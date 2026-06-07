from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from core.database import SessionLocal, get_db
from core.exceptions import NotFoundError, UnauthorizedError
from core.security import decode_access_token, oauth2_scheme
from core.websocket_manager import websocket_manager
from schemas.translation_schema import TranslationSessionRead, TranslationSessionStart, TranslationSessionStop
from services.auth_service import AuthService
from services.realtime_translate_service import RealtimeTranslateService

router = APIRouter(prefix="/realtime", tags=["realtime"])
realtime_service = RealtimeTranslateService()
auth_service = AuthService()


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedError()
    return str(subject)


@router.post("/session/start", response_model=TranslationSessionRead, status_code=status.HTTP_201_CREATED)
def start_session(
    payload: TranslationSessionStart,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> TranslationSessionRead:
    user_id = _get_user_id(token)
    auth_service.get_current_user(db, user_id)
    session = realtime_service.start_session(
        db=db,
        user_id=user_id,
        device_id=payload.device_id,
        source_language=payload.source_language,
        target_language=payload.target_language,
        translation_mode=payload.translation_mode,
    )
    return TranslationSessionRead.model_validate(session)


@router.post("/session/stop", response_model=TranslationSessionRead)
def stop_session(
    payload: TranslationSessionStop,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> TranslationSessionRead:
    user_id = _get_user_id(token)
    auth_service.get_current_user(db, user_id)
    session = realtime_service.stop_session(db, payload.session_id)
    if session is None:
        raise NotFoundError("Session tidak ditemukan", code="SESSION_NOT_FOUND")
    return TranslationSessionRead.model_validate(session)


@router.websocket("/voice")
async def voice_socket(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    if token is None:
        await websocket.accept()
        await websocket.send_json({"event": "error", "code": "AUTH_ERROR", "detail": "Token diperlukan"})
        await websocket.close(code=4401)
        return

    try:
        with SessionLocal() as db:
            user_id = _get_user_id(token)
            auth_service.get_current_user(db, user_id)
    except Exception:  # noqa: BLE001
        await websocket.accept()
        await websocket.send_json({"event": "error", "code": "AUTH_ERROR", "detail": "Token tidak valid"})
        await websocket.close(code=4401)
        return

    connection_id = f"user:{user_id}"
    await websocket_manager.connect(connection_id, websocket)
    try:
        while True:
            message = await websocket.receive_text()
            response = await realtime_service.handle_message(message)
            await websocket.send_json(response)
    except WebSocketDisconnect:
        websocket_manager.disconnect(connection_id)
    except Exception:  # noqa: BLE001
        websocket_manager.disconnect(connection_id)
        await websocket.close(code=1011)

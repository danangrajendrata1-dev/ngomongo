from __future__ import annotations

import json
import logging
from json import JSONDecodeError

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from core.database import SessionLocal, get_db
from core.exceptions import NotFoundError, UnauthorizedError
from core.security import decode_access_token, oauth2_scheme
from core.websocket_manager import websocket_manager
from schemas.translation_schema import TranslationSessionRead, TranslationSessionStart, TranslationSessionStop
from services.auth_service import AuthService
from services.realtime_translate_service import RealtimeTranslateService
from services.speech_to_text_service import SpeechToTextService
from services.text_to_speech_service import TextToSpeechService
from services.translation_service import TranslationService

router = APIRouter(prefix="/realtime", tags=["realtime"])
realtime_service = RealtimeTranslateService()
speech_to_text_service = SpeechToTextService()
text_to_speech_service = TextToSpeechService()
translation_service = TranslationService()
auth_service = AuthService()
logger = logging.getLogger(__name__)


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedError()
    return str(subject)


def _get_audio_metadata(payload: dict) -> tuple[str, str, str]:
    source_language = str(payload.get("source_language") or "id")
    target_language = str(payload.get("target_language") or "en")
    translation_mode = str(payload.get("translation_mode") or "discord")
    return source_language, target_language, translation_mode


def _get_voice_metadata(payload: dict) -> str | None:
    voice_profile_id = payload.get("voice_profile_id") or payload.get("output_voice_id")
    if isinstance(voice_profile_id, str) and voice_profile_id.strip():
        return voice_profile_id.strip()
    return None


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
            try:
                payload = json.loads(message)
            except JSONDecodeError:
                logger.warning("Invalid realtime JSON payload received")
                await websocket.send_json({
                    "type": "error",
                    "code": "INVALID_JSON",
                    "detail": "Payload JSON tidak valid.",
                })
                continue

            if not isinstance(payload, dict):
                await websocket.send_json({
                    "type": "error",
                    "code": "INVALID_PAYLOAD",
                    "detail": "Payload websocket harus berupa object JSON.",
                })
                continue

            response = await realtime_service.handle_message(payload)
            await websocket.send_json(response)
            logger.info("Realtime response sent: %s", response.get("type"))

            if payload.get("type") == "audio_chunk" and response.get("type") != "error":
                source_language, target_language, translation_mode = _get_audio_metadata(payload)

                transcript_event = await speech_to_text_service.process_audio_chunk(payload)
                await websocket.send_json(transcript_event)
                logger.info(
                    "Transcript partial sent: chunk_index=%s",
                    transcript_event.get("chunk_index", "-"),
                )

                translation_event = await translation_service.translate_partial_text(
                    text=str(transcript_event.get("text") or ''),
                    source_language=source_language,
                    target_language=target_language,
                    mode=translation_mode,
                    chunk_index=transcript_event.get("chunk_index") if isinstance(transcript_event.get("chunk_index"), int) else None,
                )
                await websocket.send_json(translation_event)
                logger.info(
                    "Translation partial sent: chunk_index=%s",
                    translation_event.get("chunk_index", "-"),
                )

                tts_event = await text_to_speech_service.synthesize_placeholder(
                    text=str(translation_event.get("translated_text") or ''),
                    voice_profile_id=_get_voice_metadata(payload),
                    target_language=target_language,
                    chunk_index=translation_event.get("chunk_index") if isinstance(translation_event.get("chunk_index"), int) else None,
                )
                await websocket.send_json(tts_event)
                logger.info(
                    "TTS placeholder sent: chunk_index=%s",
                    tts_event.get("chunk_index", "-"),
                )

            if response.get("type") == "session_stopped":
                await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
                break
    except WebSocketDisconnect:
        websocket_manager.disconnect(connection_id)
    except Exception:  # noqa: BLE001
        websocket_manager.disconnect(connection_id)
        await websocket.close(code=1011)

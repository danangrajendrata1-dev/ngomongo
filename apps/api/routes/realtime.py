from __future__ import annotations

import json
import logging
from json import JSONDecodeError
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from core.config import get_settings
from core.database import SessionLocal, get_db
from core.exceptions import NotFoundError, UnauthorizedError
from core.security import decode_access_token, oauth2_scheme
from core.websocket_manager import websocket_manager
from schemas.translation_schema import TranslationSessionRead, TranslationSessionStart, TranslationSessionStop
from services.auth_service import AuthService
from services.realtime_translate_service import RealtimeTranslateService
from services.speech_to_text_service import (
    SpeechToTextConfigurationError,
    SpeechToTextPayloadError,
    SpeechToTextService,
    SpeechToTextServiceError,
    SpeechToTextRateLimitError,
)
from services.text_to_speech_service import TextToSpeechService
from services.text_to_speech_service import (
    TextToSpeechConfigurationError,
    TextToSpeechServiceError,
)
from services.translation_service import (
    TranslationService,
    TranslationServiceConfigurationError,
    TranslationServiceError,
)

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


async def _send_followup_pipeline(
    websocket: WebSocket,
    payload: dict,
    transcript_event: dict,
    source_language: str,
    target_language: str,
    translation_mode: str,
) -> None:
    await websocket.send_json(transcript_event)
    logger.info(
        "Transcript event sent: type=%s chunk_index=%s",
        transcript_event.get("type", "-"),
        transcript_event.get("chunk_index", "-"),
    )

    translation_event = await translation_service.translate_final_text(
        text=str(transcript_event.get("text") or ""),
        source_language=source_language,
        target_language=target_language,
        mode=translation_mode,
        chunk_index=transcript_event.get("chunk_index") if isinstance(transcript_event.get("chunk_index"), int) else None,
    )
    await websocket.send_json(translation_event)
    logger.info(
        "Translation final sent: chunk_index=%s",
        translation_event.get("chunk_index", "-"),
    )

    try:
        tts_event = await text_to_speech_service.synthesize_output(
            text=str(translation_event.get("translated_text") or ""),
            voice_profile_id=_get_voice_metadata(payload),
            target_language=target_language,
            chunk_index=translation_event.get("chunk_index") if isinstance(translation_event.get("chunk_index"), int) else None,
        )
    except TextToSpeechConfigurationError as exc:
        await websocket.send_json({
            "type": "error",
            "code": exc.code,
            "detail": str(exc),
            "message": str(exc),
        })
        if not text_to_speech_service.settings.use_tts_placeholder:
            return
        tts_event = await text_to_speech_service.synthesize_placeholder(
            text=str(translation_event.get("translated_text") or ""),
            voice_profile_id=_get_voice_metadata(payload),
            target_language=target_language,
            chunk_index=translation_event.get("chunk_index") if isinstance(translation_event.get("chunk_index"), int) else None,
        )
    except TextToSpeechServiceError as exc:
        await websocket.send_json({
            "type": "error",
            "code": exc.code,
            "detail": "TTS provider failed. Falling back to placeholder audio.",
            "message": "TTS provider failed. Falling back to placeholder audio.",
        })
        if not text_to_speech_service.settings.use_tts_placeholder:
            return
        tts_event = await text_to_speech_service.synthesize_placeholder(
            text=str(translation_event.get("translated_text") or ""),
            voice_profile_id=_get_voice_metadata(payload),
            target_language=target_language,
            chunk_index=translation_event.get("chunk_index") if isinstance(translation_event.get("chunk_index"), int) else None,
        )

    await websocket.send_json(tts_event)
    logger.info(
        "TTS event sent: type=%s chunk_index=%s",
        tts_event.get("type", "-"),
        tts_event.get("chunk_index", "-"),
    )


async def _send_stt_error(websocket: WebSocket, code: str, message: str) -> None:
    await websocket.send_json({
        "type": "error",
        "code": code,
        "message": message,
        "detail": message,
    })


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
    settings = get_settings()
    token = websocket.query_params.get("token")
    if token is None:
        await websocket.accept()
        await websocket.send_json({"type": "error", "code": "AUTH_ERROR", "detail": "Token diperlukan", "message": "Token diperlukan"})
        await websocket.close(code=4401)
        return

    try:
        with SessionLocal() as db:
            user_id = _get_user_id(token)
            auth_service.get_current_user(db, user_id)
    except Exception:  # noqa: BLE001
        await websocket.accept()
        await websocket.send_json({"type": "error", "code": "AUTH_ERROR", "detail": "Token tidak valid", "message": "Token tidak valid"})
        await websocket.close(code=4401)
        return

    connection_id = f"user:{user_id}"
    await websocket_manager.connect(connection_id, websocket)
    stt_cooldown_until: datetime | None = None
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

            message_type = str(payload.get("type") or "")
            if message_type == "audio_segment" and stt_cooldown_until is not None:
                now = datetime.now(timezone.utc)
                if now < stt_cooldown_until:
                    logger.warning(
                        "STT cooldown active: chunk_index=%s code=%s",
                        payload.get("chunk_index", "-"),
                        "stt_cooldown_active",
                    )
                    await _send_stt_error(
                        websocket,
                        "stt_cooldown_active",
                        "STT is temporarily paused due to provider rate limit.",
                    )
                    continue
                stt_cooldown_until = None

            response = await realtime_service.handle_message(payload)
            await websocket.send_json(response)
            logger.info("Realtime response sent: %s", response.get("type"))

            if payload.get("type") == "audio_chunk" and response.get("type") != "error":
                source_language, target_language, translation_mode = _get_audio_metadata(payload)
                transcript_event = await speech_to_text_service.process_audio_chunk(payload)
                try:
                    await _send_followup_pipeline(
                        websocket,
                        payload,
                        transcript_event,
                        source_language,
                        target_language,
                        translation_mode,
                    )
                except (TranslationServiceConfigurationError, TranslationServiceError) as exc:
                    await websocket.send_json({
                        "type": "error",
                        "code": exc.code,
                        "detail": str(exc),
                        "message": str(exc),
                    })
                    continue

            if payload.get("type") == "audio_segment" and response.get("type") != "error":
                source_language, target_language, translation_mode = _get_audio_metadata(payload)
                try:
                    transcript_event = await speech_to_text_service.process_audio_segment(payload)
                except SpeechToTextRateLimitError as exc:
                    stt_cooldown_until = datetime.now(timezone.utc) + timedelta(seconds=settings.stt_rate_limit_cooldown_seconds)
                    logger.warning(
                        "STT provider rate limited: chunk_index=%s code=%s cooldown_seconds=%s",
                        payload.get("chunk_index", "-"),
                        exc.code,
                        settings.stt_rate_limit_cooldown_seconds,
                    )
                    await _send_stt_error(
                        websocket,
                        exc.code,
                        "STT provider rate limit or quota exceeded. Please check your OpenAI billing/quota or try again later.",
                    )
                    continue
                except SpeechToTextConfigurationError as exc:
                    await websocket.send_json({
                        "type": "error",
                        "code": exc.code,
                        "detail": str(exc),
                        "message": str(exc),
                    })
                    continue
                except SpeechToTextPayloadError as exc:
                    await websocket.send_json({
                        "type": "error",
                        "code": exc.code,
                        "detail": str(exc),
                        "message": str(exc),
                    })
                    continue
                except SpeechToTextServiceError as exc:
                    await websocket.send_json({
                        "type": "error",
                        "code": exc.code,
                        "detail": str(exc),
                        "message": str(exc),
                    })
                    continue

                try:
                    await _send_followup_pipeline(
                        websocket,
                        payload,
                        transcript_event,
                        source_language,
                        target_language,
                        translation_mode,
                    )
                except (TranslationServiceConfigurationError, TranslationServiceError) as exc:
                    await websocket.send_json({
                        "type": "error",
                        "code": exc.code,
                        "detail": str(exc),
                        "message": str(exc),
                    })
                    continue

            if response.get("type") == "session_stopped":
                await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
                break
    except WebSocketDisconnect:
        websocket_manager.disconnect(connection_id)
    except Exception:  # noqa: BLE001
        websocket_manager.disconnect(connection_id)
        await websocket.close(code=1011)

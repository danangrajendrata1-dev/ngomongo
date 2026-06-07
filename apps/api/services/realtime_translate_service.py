from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any

from sqlalchemy.orm import Session

from models.translation_session import TranslationSession
from repositories.session_repository import SessionRepository

logger = logging.getLogger(__name__)


class RealtimeTranslateService:
    def __init__(self, session_repository: SessionRepository | None = None) -> None:
        self.session_repository = session_repository or SessionRepository()

    def start_session(
        self,
        db: Session,
        user_id: str,
        device_id: str | None,
        source_language: str,
        target_language: str,
        translation_mode: str,
    ) -> TranslationSession:
        session = TranslationSession(
            user_id=user_id,
            device_id=device_id,
            source_language=source_language,
            target_language=target_language,
            translation_mode=translation_mode,
            status="active",
        )
        return self.session_repository.create(db, session)

    def stop_session(self, db: Session, session_id: str) -> TranslationSession | None:
        session = self.session_repository.get_by_id(db, session_id)
        if session is None:
            return None
        session.status = "stopped"
        return self.session_repository.update(db, session)

    async def handle_message(self, payload: dict[str, Any]) -> dict[str, Any]:
        message_type = str(payload.get("type") or "")

        if message_type == "ping":
            logger.info("Realtime ping received")
            return {"type": "pong"}

        if message_type == "session_stop":
            logger.info("Realtime session stop received")
            return {"type": "session_stopped"}

        if message_type not in {"audio_chunk", "audio_segment"}:
            return {
                "type": "error",
                "code": "UNSUPPORTED_MESSAGE_TYPE",
                "detail": "Tipe pesan realtime belum didukung.",
            }

        audio = payload.get("audio")
        audio_base64 = payload.get("audio_base64")
        payload_size = 0
        received_samples = None

        if isinstance(audio, str):
            payload_size = len(audio)
        elif isinstance(audio, list):
            received_samples = len(audio)
            payload_size = len(audio)
        elif isinstance(audio, (bytes, bytearray)):
            payload_size = len(audio)

        if payload_size == 0:
            raw_payload = payload.get("payload")
            if isinstance(raw_payload, str):
                payload_size = len(raw_payload)

        if payload_size == 0 and isinstance(audio_base64, str):
            payload_size = len(audio_base64)

        response: dict[str, Any] = {
            "type": "server_ack",
            "status": "received",
            "received_at": datetime.now(timezone.utc).isoformat(),
            "payload_size": payload_size,
        }

        chunk_index = payload.get("chunk_index")
        if isinstance(chunk_index, int):
            response["chunk_index"] = chunk_index

        if received_samples is not None:
            response["received_samples"] = received_samples

        logger.info(
            "Realtime audio payload received: type=%s chunk_index=%s payload_size=%s",
            message_type,
            response.get("chunk_index", "-"),
            payload_size,
        )

        return response

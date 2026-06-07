from sqlalchemy.orm import Session

from models.translation_session import TranslationSession
from repositories.session_repository import SessionRepository


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

    async def handle_message(self, message: str) -> dict[str, str]:
        # TODO: connect STT -> translation -> TTS pipeline here.
        return {
            "event": "placeholder",
            "message": message,
            "translated_text": message,
        }

from sqlalchemy.orm import Session

from models.translation_session import TranslationSession


class SessionRepository:
    def create(self, db: Session, session: TranslationSession) -> TranslationSession:
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def get_by_id(self, db: Session, session_id: str) -> TranslationSession | None:
        return db.get(TranslationSession, session_id)

    def update(self, db: Session, session: TranslationSession) -> TranslationSession:
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

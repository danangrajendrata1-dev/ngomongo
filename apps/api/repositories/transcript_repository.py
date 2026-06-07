from sqlalchemy import select
from sqlalchemy.orm import Session

from models.transcript import Transcript


class TranscriptRepository:
    def create(self, db: Session, transcript: Transcript) -> Transcript:
        db.add(transcript)
        db.commit()
        db.refresh(transcript)
        return transcript

    def list_by_session(self, db: Session, session_id: str) -> list[Transcript]:
        stmt = select(Transcript).where(Transcript.session_id == session_id).order_by(Transcript.sequence_no.asc())
        return list(db.execute(stmt).scalars().all())

from sqlalchemy.orm import Session

from models.transcript import Transcript
from repositories.transcript_repository import TranscriptRepository


class TranscriptService:
    def __init__(self, transcript_repository: TranscriptRepository | None = None) -> None:
        self.transcript_repository = transcript_repository or TranscriptRepository()

    def create(self, db: Session, transcript: Transcript) -> Transcript:
        return self.transcript_repository.create(db, transcript)

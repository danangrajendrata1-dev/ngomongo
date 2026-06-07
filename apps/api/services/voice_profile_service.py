from sqlalchemy.orm import Session

from models.voice_profile import VoiceProfile
from repositories.voice_profile_repository import VoiceProfileRepository


class VoiceProfileService:
    def __init__(self, voice_profile_repository: VoiceProfileRepository | None = None) -> None:
        self.voice_profile_repository = voice_profile_repository or VoiceProfileRepository()

    def list_by_user(self, db: Session, user_id: str) -> list[VoiceProfile]:
        return self.voice_profile_repository.list_by_user(db, user_id)

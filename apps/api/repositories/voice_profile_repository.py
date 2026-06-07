from sqlalchemy import select
from sqlalchemy.orm import Session

from models.voice_profile import VoiceProfile


class VoiceProfileRepository:
    def create(self, db: Session, voice_profile: VoiceProfile) -> VoiceProfile:
        db.add(voice_profile)
        db.commit()
        db.refresh(voice_profile)
        return voice_profile

    def get_by_id(self, db: Session, voice_profile_id: str) -> VoiceProfile | None:
        return db.get(VoiceProfile, voice_profile_id)

    def list_by_user(self, db: Session, user_id: str) -> list[VoiceProfile]:
        stmt = select(VoiceProfile).where(VoiceProfile.user_id == user_id).order_by(VoiceProfile.created_at.desc())
        return list(db.execute(stmt).scalars().all())

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from models.user import User


class VoiceProfile(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "voice_profiles"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    consent_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    consent_audio_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    provider_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    provider_voice_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship(back_populates="voice_profiles")

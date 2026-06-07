from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from models.transcript import Transcript
    from models.usage_log import UsageLog
    from models.user import User


class TranslationSession(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "translation_sessions"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    device_id: Mapped[str | None] = mapped_column(
        ForeignKey("desktop_devices.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    source_language: Mapped[str] = mapped_column(String(50), default="id", nullable=False)
    target_language: Mapped[str] = mapped_column(String(50), default="en", nullable=False)
    translation_mode: Mapped[str] = mapped_column(String(50), default="realtime", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="sessions")
    transcripts: Mapped[list["Transcript"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    usage_logs: Mapped[list["UsageLog"]] = relationship(back_populates="session", cascade="all, delete-orphan")

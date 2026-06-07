from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from models.audit_log import AuditLog
    from models.desktop_device import DesktopDevice
    from models.subscription import Subscription
    from models.translation_session import TranslationSession
    from models.transcript import Transcript
    from models.usage_log import UsageLog
    from models.voice_profile import VoiceProfile


class User(UUIDMixin, TimestampMixin, Base):  # type: ignore[name-defined]
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    devices: Mapped[list["DesktopDevice"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sessions: Mapped[list["TranslationSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    transcripts: Mapped[list["Transcript"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    usage_logs: Mapped[list["UsageLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    voice_profiles: Mapped[list["VoiceProfile"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    subscriptions: Mapped[list["Subscription"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")

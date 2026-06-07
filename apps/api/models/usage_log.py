from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from models.translation_session import TranslationSession
    from models.user import User


class UsageLog(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "usage_logs"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    session_id: Mapped[str | None] = mapped_column(
        ForeignKey("translation_sessions.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    audio_input_seconds: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    audio_output_seconds: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    estimated_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    provider_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    user: Mapped["User"] = relationship(back_populates="usage_logs")
    session: Mapped["TranslationSession"] = relationship(back_populates="usage_logs")

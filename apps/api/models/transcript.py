from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from models.translation_session import TranslationSession
    from models.user import User


class Transcript(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "transcripts"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    session_id: Mapped[str | None] = mapped_column(
        ForeignKey("translation_sessions.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    source_text: Mapped[str] = mapped_column(Text, nullable=False)
    translated_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_language: Mapped[str] = mapped_column(String(50), default="id", nullable=False)
    target_language: Mapped[str] = mapped_column(String(50), default="en", nullable=False)
    sequence_no: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship(back_populates="transcripts")
    session: Mapped["TranslationSession"] = relationship(back_populates="transcripts")

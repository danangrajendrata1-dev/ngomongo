from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from models.desktop_device import DesktopDevice


class DeviceSetting(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "device_settings"

    device_id: Mapped[str] = mapped_column(
        ForeignKey("desktop_devices.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    input_device_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    output_device_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_language: Mapped[str] = mapped_column(String(50), default="id", nullable=False)
    target_language: Mapped[str] = mapped_column(String(50), default="en", nullable=False)
    translation_mode: Mapped[str] = mapped_column(String(50), default="realtime", nullable=False)
    noise_suppression_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    echo_cancellation_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    auto_start_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    push_to_talk_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    device: Mapped["DesktopDevice"] = relationship(back_populates="settings")

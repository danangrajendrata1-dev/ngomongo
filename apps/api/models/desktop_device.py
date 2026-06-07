from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from models.device_setting import DeviceSetting
    from models.user import User


class DesktopDevice(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "desktop_devices"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    device_id: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    device_name: Mapped[str] = mapped_column(String(255), nullable=False)
    os: Mapped[str] = mapped_column(String(100), nullable=False)
    app_version: Mapped[str] = mapped_column(String(50), nullable=False)

    user: Mapped["User"] = relationship(back_populates="devices")
    settings: Mapped["DeviceSetting"] = relationship(
        back_populates="device",
        cascade="all, delete-orphan",
        uselist=False,
    )

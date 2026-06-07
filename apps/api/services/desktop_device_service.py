from sqlalchemy.orm import Session

from core.exceptions import NotFoundError
from models.desktop_device import DesktopDevice
from models.device_setting import DeviceSetting
from repositories.device_repository import DeviceRepository, DeviceSettingRepository
from schemas.desktop_schema import DesktopDeviceCreate, DeviceSettingUpdate


class DesktopDeviceService:
    def __init__(
        self,
        device_repository: DeviceRepository | None = None,
        device_setting_repository: DeviceSettingRepository | None = None,
    ) -> None:
        self.device_repository = device_repository or DeviceRepository()
        self.device_setting_repository = device_setting_repository or DeviceSettingRepository()

    def register_device(self, db: Session, user_id: str, payload: DesktopDeviceCreate) -> DesktopDevice:
        existing_device = self.device_repository.get_by_device_key(db, user_id, payload.device_id)
        if existing_device is not None:
            existing_device.device_name = payload.device_name
            existing_device.os = payload.os
            existing_device.app_version = payload.app_version
            db.commit()
            db.refresh(existing_device)
            if self.device_setting_repository.get_by_device_id(db, existing_device.id) is None:
                self.device_setting_repository.create(db, DeviceSetting(device_id=existing_device.id))
            return existing_device

        device = DesktopDevice(
            user_id=user_id,
            device_id=payload.device_id,
            device_name=payload.device_name,
            os=payload.os,
            app_version=payload.app_version,
        )
        device = self.device_repository.create(db, device)
        if self.device_setting_repository.get_by_device_id(db, device.id) is None:
            self.device_setting_repository.create(
                db,
                DeviceSetting(device_id=device.id),
            )
        return device

    def get_settings(self, db: Session, user_id: str) -> DeviceSetting:
        device = self._get_latest_device(db, user_id)
        setting = self.device_setting_repository.get_by_device_id(db, device.id)
        if setting is None:
            setting = self.device_setting_repository.create(db, DeviceSetting(device_id=device.id))
        return setting

    def update_settings(self, db: Session, user_id: str, payload: DeviceSettingUpdate) -> DeviceSetting:
        device = self._get_latest_device(db, user_id)
        setting = self.device_setting_repository.get_by_device_id(db, device.id)
        if setting is None:
            setting = DeviceSetting(device_id=device.id)

        for field_name, value in payload.model_dump(exclude_unset=True).items():
            setattr(setting, field_name, value)

        if setting.id is None:
            return self.device_setting_repository.create(db, setting)
        return self.device_setting_repository.update(db, setting)

    def _get_latest_device(self, db: Session, user_id: str) -> DesktopDevice:
        device = db.query(DesktopDevice).filter(DesktopDevice.user_id == user_id).order_by(DesktopDevice.created_at.desc()).first()
        if device is None:
            raise NotFoundError("Desktop device belum terdaftar", code="DEVICE_NOT_FOUND")
        return device

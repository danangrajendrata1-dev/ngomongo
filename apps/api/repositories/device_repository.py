from sqlalchemy import select
from sqlalchemy.orm import Session

from models.desktop_device import DesktopDevice
from models.device_setting import DeviceSetting


class DeviceRepository:
    def get_by_id(self, db: Session, device_id: str) -> DesktopDevice | None:
        return db.get(DesktopDevice, device_id)

    def get_by_device_key(self, db: Session, user_id: str, device_key: str) -> DesktopDevice | None:
        stmt = select(DesktopDevice).where(DesktopDevice.user_id == user_id, DesktopDevice.device_id == device_key)
        return db.execute(stmt).scalar_one_or_none()

    def create(self, db: Session, device: DesktopDevice) -> DesktopDevice:
        db.add(device)
        db.commit()
        db.refresh(device)
        return device


class DeviceSettingRepository:
    def get_by_device_id(self, db: Session, device_id: str) -> DeviceSetting | None:
        stmt = select(DeviceSetting).where(DeviceSetting.device_id == device_id)
        return db.execute(stmt).scalar_one_or_none()

    def create(self, db: Session, setting: DeviceSetting) -> DeviceSetting:
        db.add(setting)
        db.commit()
        db.refresh(setting)
        return setting

    def update(self, db: Session, setting: DeviceSetting) -> DeviceSetting:
        db.add(setting)
        db.commit()
        db.refresh(setting)
        return setting

from sqlalchemy.orm import Session

from repositories.device_repository import DeviceSettingRepository
from schemas.desktop_schema import DeviceSettingUpdate


class DeviceSettingService:
    def __init__(self, device_setting_repository: DeviceSettingRepository | None = None) -> None:
        self.device_setting_repository = device_setting_repository or DeviceSettingRepository()

    def update(self, db: Session, device_id: str, payload: DeviceSettingUpdate):
        setting = self.device_setting_repository.get_by_device_id(db, device_id)
        if setting is None:
            return None

        for field_name, value in payload.model_dump(exclude_unset=True).items():
            setattr(setting, field_name, value)
        return self.device_setting_repository.update(db, setting)

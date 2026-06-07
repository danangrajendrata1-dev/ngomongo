from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.exceptions import UnauthorizedError
from core.security import decode_access_token, oauth2_scheme
from schemas.desktop_schema import DesktopDeviceCreate, DesktopDeviceRead, DeviceSettingRead, DeviceSettingUpdate
from services.auth_service import AuthService
from services.desktop_device_service import DesktopDeviceService

router = APIRouter(prefix="/desktop", tags=["desktop"])
desktop_service = DesktopDeviceService()
auth_service = AuthService()


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedError()
    return str(subject)


@router.post("/register-device", response_model=DesktopDeviceRead, status_code=status.HTTP_201_CREATED)
def register_device(
    payload: DesktopDeviceCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> DesktopDeviceRead:
    user_id = _get_user_id(token)
    auth_service.get_current_user(db, user_id)
    device = desktop_service.register_device(db, user_id, payload)
    return DesktopDeviceRead.model_validate(device)


@router.get("/settings", response_model=DeviceSettingRead)
def get_settings(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> DeviceSettingRead:
    user_id = _get_user_id(token)
    auth_service.get_current_user(db, user_id)
    setting = desktop_service.get_settings(db, user_id)
    return DeviceSettingRead.model_validate(setting)


@router.patch("/settings", response_model=DeviceSettingRead)
def update_settings(
    payload: DeviceSettingUpdate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> DeviceSettingRead:
    user_id = _get_user_id(token)
    auth_service.get_current_user(db, user_id)
    setting = desktop_service.update_settings(db, user_id, payload)
    return DeviceSettingRead.model_validate(setting)

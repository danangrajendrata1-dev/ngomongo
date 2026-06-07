from pydantic import BaseModel, ConfigDict


class DesktopDeviceCreate(BaseModel):
    device_id: str
    device_name: str
    os: str
    app_version: str


class DesktopDeviceRead(BaseModel):
    id: str
    user_id: str
    device_id: str
    device_name: str
    os: str
    app_version: str

    model_config = ConfigDict(from_attributes=True)


class DeviceSettingUpdate(BaseModel):
    input_device_name: str | None = None
    output_device_name: str | None = None
    source_language: str | None = None
    target_language: str | None = None
    translation_mode: str | None = None
    noise_suppression_enabled: bool | None = None
    echo_cancellation_enabled: bool | None = None
    auto_start_enabled: bool | None = None
    push_to_talk_enabled: bool | None = None


class DeviceSettingRead(BaseModel):
    id: str
    device_id: str
    input_device_name: str | None
    output_device_name: str | None
    source_language: str
    target_language: str
    translation_mode: str
    noise_suppression_enabled: bool
    echo_cancellation_enabled: bool
    auto_start_enabled: bool
    push_to_talk_enabled: bool

    model_config = ConfigDict(from_attributes=True)

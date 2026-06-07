from pydantic import BaseModel, ConfigDict


class TranslationSessionStart(BaseModel):
    device_id: str | None = None
    source_language: str = "id"
    target_language: str = "en"
    translation_mode: str = "realtime"


class TranslationSessionRead(BaseModel):
    id: str
    user_id: str
    device_id: str | None
    status: str
    source_language: str
    target_language: str
    translation_mode: str
    notes: str | None = None

    model_config = ConfigDict(from_attributes=True)


class TranslationSessionStop(BaseModel):
    session_id: str

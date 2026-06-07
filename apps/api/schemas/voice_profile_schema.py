from pydantic import BaseModel, ConfigDict


class VoiceProfileRead(BaseModel):
    id: str
    user_id: str
    name: str
    status: str
    consent_text: str | None
    consent_audio_path: str | None
    provider_name: str | None
    provider_voice_id: str | None
    is_default: bool

    model_config = ConfigDict(from_attributes=True)

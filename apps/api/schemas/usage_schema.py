from pydantic import BaseModel, ConfigDict


class UsageLogRead(BaseModel):
    id: str
    user_id: str
    session_id: str | None
    event_type: str
    audio_input_seconds: float
    audio_output_seconds: float
    estimated_cost: float
    provider_name: str | None

    model_config = ConfigDict(from_attributes=True)

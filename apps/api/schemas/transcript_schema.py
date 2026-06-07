from pydantic import BaseModel, ConfigDict


class TranscriptRead(BaseModel):
    id: str
    user_id: str
    session_id: str | None
    source_text: str
    translated_text: str | None
    source_language: str
    target_language: str
    sequence_no: int

    model_config = ConfigDict(from_attributes=True)

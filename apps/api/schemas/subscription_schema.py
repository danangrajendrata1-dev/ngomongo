from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PlanRead(BaseModel):
    id: str
    code: str
    name: str
    description: str | None
    monthly_minutes_limit: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class SubscriptionRead(BaseModel):
    id: str
    user_id: str
    plan_id: str
    status: str
    starts_at: datetime | None
    ends_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

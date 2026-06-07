from pydantic import BaseModel, ConfigDict, EmailStr


class UserRead(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

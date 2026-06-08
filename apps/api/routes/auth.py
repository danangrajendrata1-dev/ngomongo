from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.database import get_db
from core.exceptions import UnauthorizedError
from core.security import decode_access_token, oauth2_scheme
from schemas.auth_schema import LoginRequest, TokenResponse, UserCreate
from schemas.user_schema import UserRead
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
auth_service = AuthService()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    user = auth_service.register(db, payload)
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenResponse)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> TokenResponse:
    payload = LoginRequest(email=form_data.username, password=form_data.password)
    return auth_service.login(db, payload)


@router.get("/me", response_model=UserRead)
def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserRead:
    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        if not subject:
            raise UnauthorizedError()
    except Exception as exc:  # noqa: BLE001
        raise UnauthorizedError() from exc

    user = auth_service.get_current_user(db, str(subject))
    return UserRead.model_validate(user)

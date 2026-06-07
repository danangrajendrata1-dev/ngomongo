from sqlalchemy.orm import Session

from core.exceptions import ConflictError, NotFoundError, UnauthorizedError
from core.security import create_access_token, get_password_hash, verify_password
from models.user import User
from repositories.user_repository import UserRepository
from schemas.auth_schema import LoginRequest, TokenResponse, UserCreate


class AuthService:
    def __init__(self, user_repository: UserRepository | None = None) -> None:
        self.user_repository = user_repository or UserRepository()

    def register(self, db: Session, payload: UserCreate) -> User:
        email = str(payload.email).lower()
        existing_user = self.user_repository.get_by_email(db, email)
        if existing_user is not None:
            raise ConflictError("Email sudah terdaftar", code="EMAIL_ALREADY_EXISTS")

        user = User(
            name=payload.name.strip(),
            email=email,
            password_hash=get_password_hash(payload.password),
            role="user",
            is_active=True,
        )
        return self.user_repository.create(db, user)

    def login(self, db: Session, payload: LoginRequest) -> TokenResponse:
        email = str(payload.email).lower()
        user = self.user_repository.get_by_email(db, email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise UnauthorizedError("Email atau password salah")
        if not user.is_active:
            raise UnauthorizedError("Akun tidak aktif")

        token = create_access_token(subject=user.id)
        return TokenResponse(access_token=token)

    def get_current_user(self, db: Session, user_id: str) -> User:
        user = self.user_repository.get_by_id(db, user_id)
        if user is None:
            raise NotFoundError("User tidak ditemukan", code="USER_NOT_FOUND")
        if not user.is_active:
            raise UnauthorizedError("Akun tidak aktif")
        return user

from sqlalchemy.orm import Session

from models.user import User
from repositories.user_repository import UserRepository


class UserService:
    def __init__(self, user_repository: UserRepository | None = None) -> None:
        self.user_repository = user_repository or UserRepository()

    def get_by_id(self, db: Session, user_id: str) -> User | None:
        return self.user_repository.get_by_id(db, user_id)

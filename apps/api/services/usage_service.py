from sqlalchemy.orm import Session

from models.usage_log import UsageLog
from repositories.usage_repository import UsageRepository


class UsageService:
    def __init__(self, usage_repository: UsageRepository | None = None) -> None:
        self.usage_repository = usage_repository or UsageRepository()

    def create(self, db: Session, usage_log: UsageLog) -> UsageLog:
        return self.usage_repository.create(db, usage_log)

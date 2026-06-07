from sqlalchemy import select
from sqlalchemy.orm import Session

from models.usage_log import UsageLog


class UsageRepository:
    def create(self, db: Session, usage_log: UsageLog) -> UsageLog:
        db.add(usage_log)
        db.commit()
        db.refresh(usage_log)
        return usage_log

    def list_by_user(self, db: Session, user_id: str) -> list[UsageLog]:
        stmt = select(UsageLog).where(UsageLog.user_id == user_id).order_by(UsageLog.created_at.desc())
        return list(db.execute(stmt).scalars().all())

from sqlalchemy.orm import Session

from models.subscription import Subscription


class SubscriptionService:
    def get_placeholder(self, db: Session, user_id: str) -> list[Subscription]:
        return []

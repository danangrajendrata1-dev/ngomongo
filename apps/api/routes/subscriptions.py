from fastapi import APIRouter

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok", "route": "subscriptions"}

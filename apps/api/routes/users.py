from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok", "route": "users"}

from fastapi import APIRouter

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok", "route": "usage"}

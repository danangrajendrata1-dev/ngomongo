from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok", "route": "admin"}

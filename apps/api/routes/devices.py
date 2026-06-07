from fastapi import APIRouter

router = APIRouter(prefix="/devices", tags=["devices"])


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok", "route": "devices"}

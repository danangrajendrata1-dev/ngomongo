from fastapi import APIRouter

router = APIRouter(prefix="/translations", tags=["translations"])


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok", "route": "translations"}

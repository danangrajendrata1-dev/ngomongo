from fastapi import APIRouter

router = APIRouter(prefix="/transcripts", tags=["transcripts"])


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok", "route": "transcripts"}

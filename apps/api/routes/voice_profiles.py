from fastapi import APIRouter

router = APIRouter(prefix="/voice-profiles", tags=["voice_profiles"])


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok", "route": "voice_profiles"}

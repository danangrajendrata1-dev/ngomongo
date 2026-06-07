from routes.admin import router as admin_router
from routes.auth import router as auth_router
from routes.desktop import router as desktop_router
from routes.devices import router as devices_router
from routes.realtime import router as realtime_router
from routes.subscriptions import router as subscriptions_router
from routes.transcripts import router as transcripts_router
from routes.translations import router as translations_router
from routes.usage import router as usage_router
from routes.users import router as users_router
from routes.voice_profiles import router as voice_profiles_router

__all__ = [
    "admin_router",
    "auth_router",
    "desktop_router",
    "devices_router",
    "realtime_router",
    "subscriptions_router",
    "transcripts_router",
    "translations_router",
    "usage_router",
    "users_router",
    "voice_profiles_router",
]

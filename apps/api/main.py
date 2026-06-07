from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from core.exceptions import register_exception_handlers
from core.logger import configure_logging
from routes import (
    admin_router,
    auth_router,
    desktop_router,
    devices_router,
    realtime_router,
    subscriptions_router,
    transcripts_router,
    translations_router,
    usage_router,
    users_router,
    voice_profiles_router,
)


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()

    app = FastAPI(title=settings.app_name, debug=settings.app_debug)
    register_exception_handlers(app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    routers = (
        auth_router,
        users_router,
        desktop_router,
        devices_router,
        realtime_router,
        translations_router,
        transcripts_router,
        voice_profiles_router,
        usage_router,
        subscriptions_router,
        admin_router,
    )

    for router in routers:
        app.include_router(router)

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok", "service": settings.app_name}

    return app


app = create_app()

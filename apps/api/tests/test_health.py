import os
import unittest

os.environ.setdefault("APP_NAME", "TalkBridge AI API")
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("APP_DEBUG", "true")
os.environ.setdefault("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/talkbridge_ai")
os.environ.setdefault("JWT_SECRET_KEY", "test_secret_key")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("JWT_EXPIRE_MINUTES", "1440")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402


class HealthTestCase(unittest.TestCase):
    def test_health_endpoint(self) -> None:
        client = TestClient(app)
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "service": "TalkBridge AI API"})

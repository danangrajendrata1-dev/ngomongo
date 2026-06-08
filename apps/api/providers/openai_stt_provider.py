from __future__ import annotations

import asyncio
from io import BytesIO

from core.config import Settings
from providers.provider_interface import SpeechToTextProvider


class OpenAISTTProviderConfigurationError(RuntimeError):
    pass


class OpenAISTTProviderError(RuntimeError):
    pass


class OpenAISTTRateLimitError(OpenAISTTProviderError):
    code = "STT_RATE_LIMITED"


def _is_rate_limit_error(exc: BaseException) -> bool:
    current: BaseException | None = exc
    visited: set[int] = set()

    while current is not None and id(current) not in visited:
        visited.add(id(current))
        status_code = getattr(current, "status_code", None)
        if status_code == 429:
            return True

        response = getattr(current, "response", None)
        if getattr(response, "status_code", None) == 429 or getattr(response, "status", None) == 429:
            return True

        current = current.__cause__ or current.__context__

    return False


class OpenAISTTProvider(SpeechToTextProvider):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        filename: str,
        content_type: str,
        language: str | None = None,
    ) -> str:
        if not self.settings.openai_api_key:
            raise OpenAISTTProviderConfigurationError(
                "STT provider is not configured. Please set OPENAI_API_KEY."
            )

        if not self.settings.openai_stt_model:
            raise OpenAISTTProviderConfigurationError(
                "STT provider model is not configured. Please set OPENAI_STT_MODEL."
            )

        if not audio_bytes:
            raise OpenAISTTProviderError("Audio segment is empty.")

        try:
            from openai import OpenAI
        except ImportError as exc:  # pragma: no cover - depends on local install state
            raise OpenAISTTProviderConfigurationError(
                "OpenAI SDK is not installed. Please add the openai package to backend requirements."
            ) from exc

        def _transcribe() -> str:
            client = OpenAI(api_key=self.settings.openai_api_key, max_retries=0)
            audio_file = BytesIO(audio_bytes)
            audio_file.name = filename

            transcription = client.audio.transcriptions.create(
                model=self.settings.openai_stt_model,
                file=audio_file,
                language=language,
                response_format="text",
            )

            if isinstance(transcription, str):
                return transcription.strip()

            text = getattr(transcription, "text", "")
            return str(text).strip()

        try:
            return await asyncio.to_thread(_transcribe)
        except OpenAISTTProviderConfigurationError:
            raise
        except Exception as exc:  # noqa: BLE001
            if _is_rate_limit_error(exc):
                raise OpenAISTTRateLimitError(
                    "STT provider rate limit or quota exceeded. Please check your OpenAI billing/quota or try again later."
                ) from exc
            raise OpenAISTTProviderError(
                "Speech-to-text provider failed to transcribe the audio segment."
            ) from exc

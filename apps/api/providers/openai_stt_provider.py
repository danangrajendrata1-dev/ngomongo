from __future__ import annotations

import asyncio
from io import BytesIO

from core.config import Settings
from providers.provider_interface import SpeechToTextProvider


class OpenAISTTProviderConfigurationError(RuntimeError):
    pass


class OpenAISTTProviderError(RuntimeError):
    pass


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
            client = OpenAI(api_key=self.settings.openai_api_key)
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
            raise OpenAISTTProviderError(
                "Speech-to-text provider failed to transcribe the audio segment."
            ) from exc

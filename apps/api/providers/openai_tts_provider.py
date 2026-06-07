from __future__ import annotations

import asyncio

from core.config import Settings
from providers.provider_interface import TextToSpeechProvider


class OpenAITTSProviderConfigurationError(RuntimeError):
    pass


class OpenAITTSProviderError(RuntimeError):
    pass


class OpenAITTSProvider(TextToSpeechProvider):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def synthesize_speech(
        self,
        text: str,
        voice_id: str | None = None,
        target_language: str = "en",
    ) -> tuple[bytes, str]:
        if not self.settings.openai_api_key:
            raise OpenAITTSProviderConfigurationError(
                "TTS provider is not configured. Please set OPENAI_API_KEY."
            )

        if not self.settings.openai_tts_model:
            raise OpenAITTSProviderConfigurationError(
                "TTS provider model is not configured. Please set OPENAI_TTS_MODEL."
            )

        selected_voice = voice_id or self.settings.openai_tts_voice
        if not selected_voice:
            raise OpenAITTSProviderConfigurationError(
                "TTS provider voice is not configured. Please set OPENAI_TTS_VOICE."
            )

        normalized_text = text.strip()
        if not normalized_text:
            raise OpenAITTSProviderError("TTS text is empty.")

        try:
            from openai import OpenAI
        except ImportError as exc:  # pragma: no cover - depends on local install state
            raise OpenAITTSProviderConfigurationError(
                "OpenAI SDK is not installed. Please add the openai package to backend requirements."
            ) from exc

        def _read_audio_bytes(response: object) -> bytes:
            read_method = getattr(response, "read", None)
            if callable(read_method):
                audio_bytes = read_method()
                if isinstance(audio_bytes, bytes):
                    return audio_bytes

            content = getattr(response, "content", None)
            if isinstance(content, bytes):
                return content

            if isinstance(response, bytes):
                return response

            raise OpenAITTSProviderError("TTS provider returned an unexpected audio payload.")

        def _synthesize() -> tuple[bytes, str]:
            client = OpenAI(api_key=self.settings.openai_api_key)
            response = client.audio.speech.create(
                model=self.settings.openai_tts_model,
                voice=selected_voice,
                input=normalized_text,
                response_format="mp3",
            )
            return _read_audio_bytes(response), "audio/mpeg"

        try:
            return await asyncio.to_thread(_synthesize)
        except OpenAITTSProviderConfigurationError:
            raise
        except OpenAITTSProviderError:
            raise
        except Exception as exc:  # noqa: BLE001
            raise OpenAITTSProviderError(
                "TTS provider failed. Please try again."
            ) from exc

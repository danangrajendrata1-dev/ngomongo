from __future__ import annotations

import base64
from typing import Any

from core.config import get_settings
from providers.openai_tts_provider import (
    OpenAITTSProvider,
    OpenAITTSProviderConfigurationError,
    OpenAITTSProviderError,
)
from providers.provider_interface import TextToSpeechProvider


class TextToSpeechServiceError(RuntimeError):
    code = "TTS_ERROR"


class TextToSpeechConfigurationError(TextToSpeechServiceError):
    code = "TTS_PROVIDER_NOT_CONFIGURED"


class TextToSpeechService:
    def __init__(self, provider: TextToSpeechProvider | None = None) -> None:
        settings = get_settings()
        self.settings = settings
        self.provider = provider or OpenAITTSProvider(settings)

    async def synthesize_placeholder(
        self,
        text: str,
        voice_profile_id: str | None = None,
        target_language: str = 'en',
        chunk_index: int | None = None,
    ) -> dict[str, Any]:
        normalized_text = text.strip() if text else ''
        placeholder_text = normalized_text or f'[{target_language.upper()} placeholder]'

        response: dict[str, Any] = {
            'type': 'tts_placeholder',
            'text': placeholder_text,
            'target_language': target_language,
            'audio_format': 'client_generated_beep',
            'duration_ms': 180,
            'is_final': False,
        }

        if isinstance(chunk_index, int) and chunk_index >= 0:
            response['chunk_index'] = chunk_index

        if voice_profile_id:
            response['voice_profile_id'] = voice_profile_id

        return response

    async def synthesize_output(
        self,
        text: str,
        voice_profile_id: str | None = None,
        target_language: str = "en",
        chunk_index: int | None = None,
    ) -> dict[str, Any]:
        normalized_text = text.strip() if text else ""
        if not normalized_text:
            raise TextToSpeechServiceError("TTS text is empty.")

        if self.settings.use_tts_placeholder:
            return await self.synthesize_placeholder(
                text=normalized_text,
                voice_profile_id=voice_profile_id,
                target_language=target_language,
                chunk_index=chunk_index,
            )

        safe_text = normalized_text[:500]

        try:
            audio_bytes, content_type = await self.provider.synthesize_speech(
                text=safe_text,
                voice_id=voice_profile_id,
                target_language=target_language,
            )
        except OpenAITTSProviderConfigurationError as exc:
            raise TextToSpeechConfigurationError(str(exc)) from exc
        except OpenAITTSProviderError as exc:
            raise TextToSpeechServiceError(str(exc)) from exc

        if not audio_bytes:
            raise TextToSpeechServiceError("TTS provider returned empty audio.")

        payload: dict[str, Any] = {
            "type": "tts_audio",
            "text": safe_text,
            "target_language": target_language,
            "audio_format": content_type,
            "audio_base64": base64.b64encode(audio_bytes).decode("utf-8"),
            "duration_ms": None,
            "is_final": True,
        }

        if isinstance(chunk_index, int) and chunk_index >= 0:
            payload["chunk_index"] = chunk_index

        if voice_profile_id:
            payload["voice_profile_id"] = voice_profile_id

        return payload

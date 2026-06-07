from __future__ import annotations

import base64
from typing import Any

from core.config import get_settings
from providers.openai_stt_provider import (
    OpenAISTTProvider,
    OpenAISTTProviderConfigurationError,
    OpenAISTTProviderError,
)
from providers.provider_interface import SpeechToTextProvider


class SpeechToTextServiceError(RuntimeError):
    code = "STT_ERROR"


class SpeechToTextConfigurationError(SpeechToTextServiceError):
    code = "STT_PROVIDER_NOT_CONFIGURED"


class SpeechToTextPayloadError(SpeechToTextServiceError):
    code = "INVALID_AUDIO_PAYLOAD"


class SpeechToTextService:
    def __init__(self, provider: SpeechToTextProvider | None = None) -> None:
        settings = get_settings()
        self.provider = provider or OpenAISTTProvider(settings)

    def generate_placeholder_transcript(self, chunk_index: int | None) -> str:
        index = chunk_index if isinstance(chunk_index, int) and chunk_index >= 0 else 0
        return f"Listening... chunk {index}"

    def decode_audio_base64(self, audio_base64: str) -> bytes:
        if not audio_base64.strip():
            raise SpeechToTextPayloadError("Audio segment is empty.")

        try:
            return base64.b64decode(audio_base64, validate=True)
        except Exception as exc:  # noqa: BLE001
            raise SpeechToTextPayloadError("Audio segment payload is not valid base64.") from exc

    async def process_audio_chunk(self, payload: dict[str, Any]) -> dict[str, Any]:
        raw_chunk_index = payload.get("chunk_index")
        chunk_index = raw_chunk_index if isinstance(raw_chunk_index, int) and raw_chunk_index >= 0 else 0
        language = str(payload.get("source_language") or "id")

        return {
            "type": "transcript_partial",
            "chunk_index": chunk_index,
            "text": self.generate_placeholder_transcript(chunk_index),
            "language": language,
            "is_final": False,
        }

    async def process_audio_segment(self, payload: dict[str, Any]) -> dict[str, Any]:
        raw_chunk_index = payload.get("chunk_index")
        chunk_index = raw_chunk_index if isinstance(raw_chunk_index, int) and raw_chunk_index >= 0 else 0
        language = str(payload.get("source_language") or "id")
        filename = str(payload.get("filename") or f"segment-{chunk_index}.webm")
        content_type = str(payload.get("content_type") or "audio/webm")
        use_placeholder = bool(payload.get("use_placeholder"))

        if use_placeholder:
            transcript_text = self.generate_placeholder_transcript(chunk_index)
        else:
            audio_base64 = payload.get("audio_base64")
            if not isinstance(audio_base64, str):
                raise SpeechToTextPayloadError("audio_base64 is required for audio_segment messages.")

            audio_bytes = self.decode_audio_base64(audio_base64)

            try:
                transcript_text = await self.provider.transcribe_audio(
                    audio_bytes=audio_bytes,
                    filename=filename,
                    content_type=content_type,
                    language=language,
                )
            except OpenAISTTProviderConfigurationError as exc:
                raise SpeechToTextConfigurationError(str(exc)) from exc
            except OpenAISTTProviderError as exc:
                raise SpeechToTextServiceError(
                    "Speech-to-text provider failed to process the audio segment."
                ) from exc

        return {
            "type": "transcript_final",
            "chunk_index": chunk_index,
            "text": transcript_text.strip(),
            "language": language,
            "is_final": True,
        }

from __future__ import annotations

from typing import Any


class TextToSpeechService:
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

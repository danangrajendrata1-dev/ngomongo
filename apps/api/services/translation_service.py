from __future__ import annotations

from typing import Any


class TranslationService:
    def generate_placeholder_translation(self, text: str, target_language: str, mode: str) -> str:
        normalized_text = text.strip() if text else ''
        translated_text = f"[{target_language.upper()} placeholder] {normalized_text}".strip()

        if not normalized_text:
            return f"[{target_language.upper()} placeholder]"

        return translated_text

    async def translate_partial_text(
        self,
        text: str,
        source_language: str,
        target_language: str,
        mode: str,
        chunk_index: int | None = None,
    ) -> dict[str, Any]:
        translated_text = self.generate_placeholder_translation(text, target_language, mode)
        payload: dict[str, Any] = {
            'type': 'translation_partial',
            'original_text': text,
            'translated_text': translated_text,
            'source_language': source_language,
            'target_language': target_language,
            'mode': mode,
            'is_final': False,
        }

        if isinstance(chunk_index, int) and chunk_index >= 0:
            payload['chunk_index'] = chunk_index

        return payload

from __future__ import annotations

from typing import Any

from core.config import get_settings
from providers.openai_translate_provider import (
    OpenAITranslationProvider,
    OpenAITranslationProviderConfigurationError,
    OpenAITranslationProviderError,
)
from providers.provider_interface import TranslationProvider


class TranslationServiceError(RuntimeError):
    code = "TRANSLATION_ERROR"


class TranslationServiceConfigurationError(TranslationServiceError):
    code = "TRANSLATION_PROVIDER_NOT_CONFIGURED"


class TranslationService:
    def __init__(self, provider: TranslationProvider | None = None) -> None:
        settings = get_settings()
        self.settings = settings
        self.provider = provider or OpenAITranslationProvider(settings)

    def generate_placeholder_translation(self, text: str, target_language: str, mode: str) -> str:
        normalized_text = text.strip() if text else ""
        translated_text = f"[{target_language.upper()} placeholder] {normalized_text}".strip()

        if not normalized_text:
            return f"[{target_language.upper()} placeholder]"

        return translated_text

    async def translate_final_text(
        self,
        text: str,
        source_language: str,
        target_language: str,
        mode: str,
        chunk_index: int | None = None,
    ) -> dict[str, Any]:
        normalized_text = text.strip() if text else ""
        translated_text = ""

        if normalized_text:
            if self.settings.use_translation_placeholder:
                translated_text = self.generate_placeholder_translation(normalized_text, target_language, mode)
            else:
                try:
                    translated_text = await self.provider.translate_text(
                        text=normalized_text,
                        source_language=source_language,
                        target_language=target_language,
                        mode=mode,
                    )
                except OpenAITranslationProviderConfigurationError as exc:
                    raise TranslationServiceConfigurationError(str(exc)) from exc
                except OpenAITranslationProviderError as exc:
                    raise TranslationServiceError(str(exc)) from exc

                if not translated_text:
                    translated_text = self.generate_placeholder_translation(normalized_text, target_language, mode)

        payload: dict[str, Any] = {
            "type": "translation_final",
            "original_text": normalized_text,
            "translated_text": translated_text,
            "source_language": source_language,
            "target_language": target_language,
            "mode": mode,
            "is_final": True,
        }

        if isinstance(chunk_index, int) and chunk_index >= 0:
            payload["chunk_index"] = chunk_index

        return payload

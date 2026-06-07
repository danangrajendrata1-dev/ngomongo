from __future__ import annotations

import asyncio

from core.config import Settings
from providers.provider_interface import TranslationProvider

MODE_STYLES = {
    "interview": "Use formal, professional, polished English.",
    "meeting": "Use clear, concise, professional English.",
    "discord": "Use natural, casual English.",
    "game": "Use short, fast, concise English.",
    "casual": "Use friendly, natural English.",
}


class OpenAITranslationProviderConfigurationError(RuntimeError):
    pass


class OpenAITranslationProviderError(RuntimeError):
    pass


class OpenAITranslationProvider(TranslationProvider):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def translate_text(
        self,
        text: str,
        source_language: str,
        target_language: str,
        mode: str,
    ) -> str:
        if not self.settings.openai_api_key:
            raise OpenAITranslationProviderConfigurationError(
                "Translation provider is not configured. Please set OPENAI_API_KEY."
            )

        if not self.settings.openai_translation_model:
            raise OpenAITranslationProviderConfigurationError(
                "Translation provider model is not configured. Please set OPENAI_TRANSLATION_MODEL."
            )

        normalized_text = text.strip()
        if not normalized_text:
            return ""

        try:
            from openai import OpenAI
        except ImportError as exc:  # pragma: no cover - depends on local install state
            raise OpenAITranslationProviderConfigurationError(
                "OpenAI SDK is not installed. Please add the openai package to backend requirements."
            ) from exc

        style_instruction = MODE_STYLES.get(mode.lower(), MODE_STYLES["casual"])

        def _translate() -> str:
            client = OpenAI(api_key=self.settings.openai_api_key)
            response = client.responses.create(
                model=self.settings.openai_translation_model,
                instructions=(
                    "You are a translation engine for a desktop speech translation app. "
                    "Translate the user's text from the source language to the target language. "
                    "Translate meaning, not word-by-word. Keep the user's intent. "
                    "Do not add new facts. Do not answer on behalf of the user. "
                    "Do not change the meaning. Output only the translated sentence with no explanation. "
                    f"{style_instruction}"
                ),
                input=(
                    f"Source language: {source_language}\n"
                    f"Target language: {target_language}\n"
                    f"Mode: {mode}\n"
                    f"Text: {normalized_text}"
                ),
            )
            translated_text = getattr(response, "output_text", "")
            return str(translated_text).strip()

        try:
            return await asyncio.to_thread(_translate)
        except OpenAITranslationProviderConfigurationError:
            raise
        except Exception as exc:  # noqa: BLE001
            raise OpenAITranslationProviderError(
                "Translation provider failed. Please try again."
            ) from exc

from providers.provider_interface import SpeechToTextProvider


class OpenAISTTProvider(SpeechToTextProvider):
    async def transcribe(self, audio_bytes: bytes, language: str | None = None) -> str:
        # TODO: wire actual OpenAI STT provider.
        return ""

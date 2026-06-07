from providers.provider_interface import TextToSpeechProvider


class OpenAITTSProvider(TextToSpeechProvider):
    async def synthesize(self, text: str, voice: str | None = None) -> bytes:
        # TODO: wire actual OpenAI TTS provider.
        return b""

class TextToSpeechService:
    async def synthesize(self, text: str, voice: str | None = None) -> bytes:
        # TODO: wire actual TTS provider.
        return b""

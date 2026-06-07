class SpeechToTextService:
    async def transcribe(self, audio_bytes: bytes, language: str | None = None) -> str:
        # TODO: wire actual STT provider.
        return ""

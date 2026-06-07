from providers.provider_interface import SpeechToTextProvider, TextToSpeechProvider, TranslationProvider


class OpenAIRealtimeProvider(SpeechToTextProvider, TranslationProvider, TextToSpeechProvider):
    async def transcribe(self, audio_bytes: bytes, language: str | None = None) -> str:
        # TODO: integrate OpenAI realtime transcription when provider wiring is approved.
        return ""

    async def translate(self, text: str, source_language: str, target_language: str) -> str:
        # TODO: integrate OpenAI realtime translation when provider wiring is approved.
        return text

    async def synthesize(self, text: str, voice: str | None = None) -> bytes:
        # TODO: integrate OpenAI realtime TTS when provider wiring is approved.
        return b""

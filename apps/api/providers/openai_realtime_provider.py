from providers.provider_interface import SpeechToTextProvider, TextToSpeechProvider, TranslationProvider


class OpenAIRealtimeProvider(SpeechToTextProvider, TranslationProvider, TextToSpeechProvider):
    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        filename: str,
        content_type: str,
        language: str | None = None,
    ) -> str:
        # TODO: integrate OpenAI realtime transcription when provider wiring is approved.
        return ""

    async def translate_text(
        self,
        text: str,
        source_language: str,
        target_language: str,
        mode: str,
    ) -> str:
        # TODO: integrate OpenAI realtime translation when provider wiring is approved.
        return text

    async def synthesize_speech(
        self,
        text: str,
        voice_id: str | None = None,
        target_language: str = "en",
    ) -> tuple[bytes, str]:
        # TODO: integrate OpenAI realtime TTS when provider wiring is approved.
        return b"", "audio/mpeg"

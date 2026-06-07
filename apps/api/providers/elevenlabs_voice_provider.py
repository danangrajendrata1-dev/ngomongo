from providers.provider_interface import VoiceProfileProvider


class ElevenLabsVoiceProvider(VoiceProfileProvider):
    async def create_voice_profile(self, name: str, metadata: dict[str, object] | None = None) -> dict[str, object]:
        # TODO: wire actual ElevenLabs voice profile provider.
        return {"name": name, "provider": "elevenlabs", "status": "placeholder"}

from providers.provider_interface import VoiceProfileProvider


class AzureVoiceProvider(VoiceProfileProvider):
    async def create_voice_profile(self, name: str, metadata: dict[str, object] | None = None) -> dict[str, object]:
        # TODO: wire actual Azure voice profile provider.
        return {"name": name, "provider": "azure", "status": "placeholder"}

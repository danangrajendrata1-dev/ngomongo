from abc import ABC, abstractmethod
from typing import Any


class SpeechToTextProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, language: str | None = None) -> str:
        raise NotImplementedError


class TranslationProvider(ABC):
    @abstractmethod
    async def translate(self, text: str, source_language: str, target_language: str) -> str:
        raise NotImplementedError


class TextToSpeechProvider(ABC):
    @abstractmethod
    async def synthesize(self, text: str, voice: str | None = None) -> bytes:
        raise NotImplementedError


class VoiceProfileProvider(ABC):
    @abstractmethod
    async def create_voice_profile(self, name: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
        raise NotImplementedError

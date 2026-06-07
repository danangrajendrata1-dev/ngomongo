from __future__ import annotations

from typing import Any


class SpeechToTextService:
    def generate_placeholder_transcript(self, chunk_index: int | None) -> str:
        index = chunk_index if isinstance(chunk_index, int) and chunk_index >= 0 else 0
        return f"Listening... chunk {index}"

    async def process_audio_chunk(self, payload: dict[str, Any]) -> dict[str, Any]:
        raw_chunk_index = payload.get("chunk_index")
        chunk_index = raw_chunk_index if isinstance(raw_chunk_index, int) and raw_chunk_index >= 0 else 0
        language = str(payload.get("source_language") or "id")

        return {
            "type": "transcript_partial",
            "chunk_index": chunk_index,
            "text": self.generate_placeholder_transcript(chunk_index),
            "language": language,
            "is_final": False,
        }

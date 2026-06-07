export type RealtimeConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type RealtimeAudioPayloadFormat = 'uint8_time_domain_base64';

export type RealtimeAudioChunkPayload = {
  type: 'audio_chunk';
  chunk_index: number;
  sample_rate: number | null;
  timestamp: number;
  payload_format: RealtimeAudioPayloadFormat;
  audio: string;
};

export type RealtimeServerMessage =
  | {
      type: 'server_ack';
      status: 'received';
      received_at: string;
      chunk_index?: number;
      payload_size: number;
      received_samples?: number;
    }
  | {
      type: 'transcript_partial';
      chunk_index: number;
      text: string;
      language: string;
      is_final: false;
    }
  | {
      type: 'pong';
    }
  | {
      type: 'session_stopped';
    }
  | {
      type: 'error';
      code?: string;
      detail?: string;
    }
  | Record<string, unknown>;

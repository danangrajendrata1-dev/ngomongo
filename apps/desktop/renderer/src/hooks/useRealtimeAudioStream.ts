import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { playPlaceholderBeep } from '@/lib/audioPlayback';
import { RealtimeService } from '@/services/realtime.service';
import type {
  RealtimeAudioChunkPayload,
  RealtimeConnectionStatus,
  RealtimeServerMessage,
} from '@/types/realtime';

function uint8ArrayToBase64(data: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < data.length; index += chunkSize) {
    const chunk = data.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return window.btoa(binary);
}

function createAudioChunkPayload(
  analyser: AnalyserNode,
  sampleRate: number,
  chunkIndex: number,
  sourceLanguage: string,
  targetLanguage: string,
  translationMode: string,
): RealtimeAudioChunkPayload {
  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);

  return {
    type: 'audio_chunk',
    chunk_index: chunkIndex,
    sample_rate: sampleRate,
    timestamp: Date.now(),
    source_language: sourceLanguage,
    target_language: targetLanguage,
    translation_mode: translationMode,
    payload_format: 'uint8_time_domain_base64',
    audio: uint8ArrayToBase64(data),
  };
}

type UseRealtimeAudioStreamArgs = {
  token: string | null;
  sourceStream: MediaStream | null;
  isCapturing: boolean;
  isPaused: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  translationMode: string;
};

type TranscriptPartialMessage = Extract<RealtimeServerMessage, { type: 'transcript_partial' }>;
type TranslationPartialMessage = Extract<RealtimeServerMessage, { type: 'translation_partial' }>;
type ServerAckMessage = Extract<RealtimeServerMessage, { type: 'server_ack' }>;
type TtsPlaceholderMessage = Extract<RealtimeServerMessage, { type: 'tts_placeholder' }>;

type OutputStatus = 'idle' | 'speaking';

export function useRealtimeAudioStream({
  token,
  sourceStream,
  isCapturing,
  isPaused,
  sourceLanguage,
  targetLanguage,
  translationMode,
}: UseRealtimeAudioStreamArgs) {
  const serviceRef = useRef(new RealtimeService());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const playbackResetTimerRef = useRef<number | null>(null);
  const chunkIndexRef = useRef(0);
  const samplerReadyRef = useRef(false);

  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>('disconnected');
  const [lastServerMessage, setLastServerMessage] = useState<RealtimeServerMessage | null>(null);
  const [lastServerAck, setLastServerAck] = useState<ServerAckMessage | null>(null);
  const [transcriptEvents, setTranscriptEvents] = useState<TranscriptPartialMessage[]>([]);
  const [transcriptText, setTranscriptText] = useState('');
  const [translationEvents, setTranslationEvents] = useState<TranslationPartialMessage[]>([]);
  const [translationText, setTranslationText] = useState('');
  const [ttsEvents, setTtsEvents] = useState<TtsPlaceholderMessage[]>([]);
  const [lastTtsEvent, setLastTtsEvent] = useState<TtsPlaceholderMessage | null>(null);
  const [outputStatus, setOutputStatus] = useState<OutputStatus>('idle');
  const [realtimeError, setRealtimeError] = useState<string | null>(null);

  const clearPlaybackResetTimer = useCallback(() => {
    if (playbackResetTimerRef.current !== null) {
      window.clearTimeout(playbackResetTimerRef.current);
      playbackResetTimerRef.current = null;
    }
  }, []);

  const resetOutputStatus = useCallback(() => {
    clearPlaybackResetTimer();
    setOutputStatus('idle');
  }, [clearPlaybackResetTimer]);

  const clearSampler = useCallback(async () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;

    const context = audioContextRef.current;
    audioContextRef.current = null;
    samplerReadyRef.current = false;

    if (context) {
      try {
        await context.close();
      } catch {
        try {
          await context.suspend();
        } catch {
          // ignore cleanup failures
        }
      }
    }
  }, []);

  const appendTranscriptPartial = useCallback((message: TranscriptPartialMessage) => {
    setTranscriptEvents((current) => {
      const next = [...current, message].slice(-50);
      setTranscriptText(next.map((event) => event.text).join('\n'));
      return next;
    });
  }, []);

  const appendTranslationPartial = useCallback((message: TranslationPartialMessage) => {
    setTranslationEvents((current) => {
      const next = [...current, message].slice(-50);
      setTranslationText(next.map((event) => event.translated_text).join('\n'));
      return next;
    });
  }, []);

  const appendTtsPlaceholder = useCallback(
    (message: TtsPlaceholderMessage) => {
      setTtsEvents((current) => [...current, message].slice(-50));
      setLastTtsEvent(message);
      setOutputStatus('speaking');

      clearPlaybackResetTimer();
      playbackResetTimerRef.current = window.setTimeout(() => {
        setOutputStatus('idle');
        playbackResetTimerRef.current = null;
      }, Math.max(120, message.duration_ms));

      void playPlaceholderBeep(message.duration_ms);
    },
    [clearPlaybackResetTimer],
  );

  const connect = useCallback(async () => {
    if (!token) {
      const message = 'Token belum tersedia. Silakan login ulang.';
      setRealtimeError(message);
      setConnectionStatus('error');
      return;
    }

    setRealtimeError(null);
    setLastServerMessage(null);
    setLastServerAck(null);
    setTranscriptEvents([]);
    setTranscriptText('');
    setTranslationEvents([]);
    setTranslationText('');
    setTtsEvents([]);
    setLastTtsEvent(null);
    setOutputStatus('idle');

    serviceRef.current.setHandlers({
      onMessage: (message) => {
        setLastServerMessage(message);

        if (message && typeof message === 'object' && 'type' in message) {
          if (message.type === 'server_ack') {
            setLastServerAck(message);
          }

          if (message.type === 'transcript_partial') {
            appendTranscriptPartial(message);
          }

          if (message.type === 'translation_partial') {
            appendTranslationPartial(message);
          }

          if (message.type === 'tts_placeholder') {
            appendTtsPlaceholder(message);
          }

          if (message.type === 'error') {
            setRealtimeError(typeof message.detail === 'string' ? message.detail : 'WebSocket mengembalikan error.');
            setConnectionStatus('error');
          }
        }
      },
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
      onError: (message) => {
        setRealtimeError(message);
        setConnectionStatus('error');
      },
    });

    try {
      await serviceRef.current.connect({ token });
    } catch (connectError) {
      const message = connectError instanceof Error ? connectError.message : 'Gagal terhubung ke WebSocket realtime.';
      setRealtimeError(message);
      setConnectionStatus('error');
    }
  }, [appendTranscriptPartial, appendTranslationPartial, appendTtsPlaceholder, token]);

  const disconnect = useCallback(async () => {
    clearPlaybackResetTimer();
    setOutputStatus('idle');
    await clearSampler();
    await serviceRef.current.disconnect();
    setConnectionStatus('disconnected');
  }, [clearPlaybackResetTimer, clearSampler]);

  const sendChunk = useCallback((payload: RealtimeAudioChunkPayload) => {
    serviceRef.current.sendAudioChunk(payload);
  }, []);

  const sendPing = useCallback(() => {
    serviceRef.current.sendPing();
  }, []);

  const sendSessionStop = useCallback(() => {
    serviceRef.current.sendSessionStop();
  }, []);

  useEffect(() => {
    if (connectionStatus !== 'connected' || !isCapturing || isPaused || !sourceStream) {
      void clearSampler();
      return;
    }

    let cancelled = false;

    const startSampler = async () => {
      if (samplerReadyRef.current) {
        return;
      }

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.2;

      const sourceNode = audioContext.createMediaStreamSource(sourceStream);
      sourceNode.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceNodeRef.current = sourceNode;
      samplerReadyRef.current = true;

      try {
        await audioContext.resume();
      } catch {
        // If resume fails we still keep the context available for teardown.
      }

      if (cancelled) {
        await clearSampler();
        return;
      }

      intervalRef.current = window.setInterval(() => {
        const currentAnalyser = analyserRef.current;
        if (!currentAnalyser || isPaused || connectionStatus !== 'connected') {
          return;
        }

        sendChunk(
          createAudioChunkPayload(
            currentAnalyser,
            audioContext.sampleRate,
            chunkIndexRef.current,
            sourceLanguage,
            targetLanguage,
            translationMode,
          ),
        );
        chunkIndexRef.current += 1;
      }, 250);
    };

    void startSampler();

    return () => {
      cancelled = true;
      void clearSampler();
    };
  }, [clearSampler, connectionStatus, isCapturing, isPaused, sendChunk, sourceLanguage, sourceStream, targetLanguage, translationMode]);

  useEffect(() => {
    if (!isCapturing) {
      chunkIndexRef.current = 0;
      resetOutputStatus();
    }
  }, [isCapturing, resetOutputStatus]);

  useEffect(() => {
    if (isPaused) {
      resetOutputStatus();
    }
  }, [isPaused, resetOutputStatus]);

  useEffect(() => {
    return () => {
      clearPlaybackResetTimer();
      void disconnect();
    };
  }, [clearPlaybackResetTimer, disconnect]);

  return useMemo(
    () => ({
      connect,
      disconnect,
      sendChunk,
      sendPing,
      sendSessionStop,
      connectionStatus,
      lastServerMessage,
      lastServerAck,
      transcriptEvents,
      transcriptText,
      translationEvents,
      translationText,
      ttsEvents,
      lastTtsEvent,
      outputStatus,
      realtimeError,
    }),
    [
      connect,
      disconnect,
      sendChunk,
      sendPing,
      sendSessionStop,
      connectionStatus,
      lastServerMessage,
      lastServerAck,
      transcriptEvents,
      transcriptText,
      translationEvents,
      translationText,
      ttsEvents,
      lastTtsEvent,
      outputStatus,
      realtimeError,
    ],
  );
}

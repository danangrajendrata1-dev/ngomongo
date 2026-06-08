import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { playBase64Audio, playPlaceholderBeep, stopAudioPlayback } from '@/lib/audioPlayback';
import { RealtimeService } from '@/services/realtime.service';
import type {
  RealtimeAudioSegmentPayload,
  RealtimeConnectionStatus,
  RealtimeServerMessage,
} from '@/types/realtime';

type UseRealtimeAudioStreamArgs = {
  token: string | null;
  outputDeviceId?: string;
};

type TranscriptMessage = Extract<RealtimeServerMessage, { type: 'transcript_partial' | 'transcript_final' }>;
type TranslationMessage = Extract<RealtimeServerMessage, { type: 'translation_partial' | 'translation_final' }>;
type TtsPlaceholderMessage = Extract<RealtimeServerMessage, { type: 'tts_placeholder' }>;
type TtsAudioMessage = Extract<RealtimeServerMessage, { type: 'tts_audio' }>;
type AckMessage = Extract<RealtimeServerMessage, { type: 'server_ack' }>;
type OutputStatus = 'idle' | 'speaking';
type SttMode = 'real' | 'placeholder';

export function useRealtimeAudioStream({ token, outputDeviceId }: UseRealtimeAudioStreamArgs) {
  const serviceRef = useRef(new RealtimeService());
  const speakingTimeoutRef = useRef<number | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>('disconnected');
  const [lastServerMessage, setLastServerMessage] = useState<RealtimeServerMessage | null>(null);
  const [lastServerAck, setLastServerAck] = useState<AckMessage | null>(null);
  const [transcriptEvents, setTranscriptEvents] = useState<TranscriptMessage[]>([]);
  const [transcriptText, setTranscriptText] = useState('');
  const [translationEvents, setTranslationEvents] = useState<TranslationMessage[]>([]);
  const [translationText, setTranslationText] = useState('');
  const [ttsEvents, setTtsEvents] = useState<Array<TtsPlaceholderMessage | TtsAudioMessage>>([]);
  const [lastTtsEvent, setLastTtsEvent] = useState<TtsPlaceholderMessage | null>(null);
  const [lastTtsAudioEvent, setLastTtsAudioEvent] = useState<TtsAudioMessage | null>(null);
  const [outputStatus, setOutputStatus] = useState<OutputStatus>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sttMode, setSttMode] = useState<SttMode>('real');
  const [lastTranscriptReceived, setLastTranscriptReceived] = useState('');
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [outputWarning, setOutputWarning] = useState<string | null>(null);

  const clearSpeakingTimeout = useCallback(() => {
    if (speakingTimeoutRef.current !== null) {
      window.clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
  }, []);

  const setSpeakingBriefly = useCallback((durationMs: number) => {
    clearSpeakingTimeout();
    setOutputStatus('speaking');
    speakingTimeoutRef.current = window.setTimeout(() => {
      setOutputStatus('idle');
      setIsSpeaking(false);
      speakingTimeoutRef.current = null;
    }, Math.max(150, durationMs));
  }, [clearSpeakingTimeout]);

  const appendTranscript = useCallback((message: TranscriptMessage) => {
    setTranscriptEvents((current) => {
      const next = [...current, message].slice(-50);
      setTranscriptText(next.map((event) => event.text).join('\n'));
      return next;
    });
    setLastTranscriptReceived(message.text);
  }, []);

  const appendTranslation = useCallback((message: TranslationMessage) => {
    setTranslationEvents((current) => {
      const next = [...current, message].slice(-50);
      setTranslationText(next.map((event) => event.translated_text).join('\n'));
      return next;
    });
  }, []);

  const appendTtsPlaceholder = useCallback((message: TtsPlaceholderMessage) => {
    setTtsEvents((current) => [...current, message].slice(-50));
    setLastTtsEvent(message);
    setSpeakingBriefly(message.duration_ms);
    setIsSpeaking(true);
    setTtsError(null);
    void playPlaceholderBeep(message.duration_ms, 0.06, outputDeviceId)
      .then((result) => {
        setOutputWarning(result.warning);
      })
      .catch(() => {
        setOutputWarning(null);
      });
  }, [outputDeviceId, setSpeakingBriefly]);

  const appendTtsAudio = useCallback((message: TtsAudioMessage) => {
    setTtsEvents((current) => [...current, message].slice(-50));
    setLastTtsAudioEvent(message);
    setOutputStatus('speaking');
    setIsSpeaking(true);
    setTtsError(null);
    void playBase64Audio(message.audio_base64, message.audio_format, outputDeviceId)
      .then((result) => {
        setOutputStatus('idle');
        setIsSpeaking(false);
        setOutputWarning(result.warning);
      })
      .catch((error) => {
        setOutputStatus('idle');
        setIsSpeaking(false);
        setTtsError(error instanceof Error ? error.message : 'Audio playback failed.');
        setOutputWarning(null);
      });
  }, [outputDeviceId]);

  const resetSessionState = useCallback(() => {
    setLastServerMessage(null);
    setLastServerAck(null);
    setTranscriptEvents([]);
    setTranscriptText('');
    setTranslationEvents([]);
    setTranslationText('');
    setTtsEvents([]);
    setLastTtsEvent(null);
    setLastTtsAudioEvent(null);
    setOutputStatus('idle');
    setIsSpeaking(false);
    setLastTranscriptReceived('');
    setRealtimeError(null);
    setTtsError(null);
    setOutputWarning(null);
    setSttMode('real');
    clearSpeakingTimeout();
    stopAudioPlayback();
  }, [clearSpeakingTimeout]);

  const connect = useCallback(async (): Promise<boolean> => {
    if (!token) {
      const message = 'Token belum tersedia. Silakan login ulang.';
      setRealtimeError(message);
      setConnectionStatus('error');
      return false;
    }

    resetSessionState();

    serviceRef.current.setHandlers({
      onMessage: (message) => {
        setLastServerMessage(message);

        if (message && typeof message === 'object' && 'type' in message) {
          if (message.type === 'server_ack') {
            setLastServerAck(message);
          }

          if (message.type === 'transcript_partial' || message.type === 'transcript_final') {
            appendTranscript(message);
            setSttMode(message.type === 'transcript_partial' ? 'placeholder' : 'real');
          }

          if (message.type === 'translation_partial' || message.type === 'translation_final') {
            appendTranslation(message);
          }

          if (message.type === 'tts_placeholder') {
            appendTtsPlaceholder(message);
          }

          if (message.type === 'tts_audio') {
            appendTtsAudio(message);
          }

          if (message.type === 'error') {
            const detail = typeof message.detail === 'string'
              ? message.detail
              : typeof (message as { message?: unknown }).message === 'string'
                ? String((message as { message?: unknown }).message)
                : 'WebSocket mengembalikan error.';
            setRealtimeError(detail);
            setConnectionStatus('error');
          }
        }
      },
      onStatusChange: (status) => {
        if (import.meta.env.DEV) {
          console.log('WebSocket status:', status);
        }
        setConnectionStatus(status);
      },
      onError: (message) => {
        setRealtimeError(message);
        setConnectionStatus('error');
      },
    });

    try {
      await serviceRef.current.connect({ token });
      serviceRef.current.sendPing();
      return true;
    } catch (connectError) {
      const message = connectError instanceof Error ? connectError.message : 'Gagal terhubung ke WebSocket realtime.';
      setRealtimeError(message);
      setConnectionStatus('error');
      return false;
    }
  }, [appendTranscript, appendTranslation, appendTtsAudio, appendTtsPlaceholder, resetSessionState, token]);

  const disconnect = useCallback(async () => {
    clearSpeakingTimeout();
    setOutputStatus('idle');
    setIsSpeaking(false);
    stopAudioPlayback();
    await serviceRef.current.disconnect();
    setConnectionStatus('disconnected');
  }, [clearSpeakingTimeout]);

  const sendAudioSegment = useCallback((payload: RealtimeAudioSegmentPayload) => {
    if (serviceRef.current.getConnectionStatus() !== 'connected') {
      return;
    }

    serviceRef.current.sendAudioSegment(payload);
  }, []);

  const sendSessionStop = useCallback(() => {
    serviceRef.current.sendSessionStop();
  }, []);

  useEffect(() => {
    return () => {
      clearSpeakingTimeout();
      void disconnect();
    };
  }, [clearSpeakingTimeout, disconnect]);

  return useMemo(
    () => ({
      connect,
      disconnect,
      sendAudioSegment,
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
      lastTtsAudioEvent,
      outputStatus,
      isSpeaking,
      sttMode,
      lastTranscriptReceived,
      realtimeError,
      ttsError,
      outputWarning,
    }),
    [
      connect,
      disconnect,
      sendAudioSegment,
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
      lastTtsAudioEvent,
      outputStatus,
      isSpeaking,
      sttMode,
      lastTranscriptReceived,
      realtimeError,
      ttsError,
      outputWarning,
    ],
  );
}

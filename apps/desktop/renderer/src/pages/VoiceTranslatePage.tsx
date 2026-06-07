import { useEffect, useMemo, useState } from 'react';

import { AudioLevelMeter } from '@/components/audio/AudioLevelMeter';
import { LatencyIndicator } from '@/components/audio/LatencyIndicator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanguageSelector } from '@/components/translator/LanguageSelector';
import { RealtimeStatus } from '@/components/translator/RealtimeStatus';
import { StartStopButton } from '@/components/translator/StartStopButton';
import { TranscriptPanel } from '@/components/translator/TranscriptPanel';
import { TranslationPanel } from '@/components/translator/TranslationPanel';
import { VoiceModeSelector } from '@/components/translator/VoiceModeSelector';
import { useAuth } from '@/stores/authStore';
import { LANGUAGE_OPTIONS } from '@/lib/constants';
import { useLocalSettings } from '@/hooks/useLocalSettings';
import { useMicrophoneCapture } from '@/hooks/useMicrophoneCapture';
import { useRealtimeAudioStream } from '@/hooks/useRealtimeAudioStream';
import type { RealtimeConnectionState } from '@/types/translator';
import type { RealtimeConnectionStatus } from '@/types/realtime';

type CaptureStatus = 'ready' | 'listening' | 'paused' | 'error';

export function VoiceTranslatePage() {
  const auth = useAuth();
  const { settings, updateSettings } = useLocalSettings();
  const microphone = useMicrophoneCapture();
  const realtime = useRealtimeAudioStream({
    token: auth.token,
    sourceStream: microphone.stream,
    isCapturing: microphone.isCapturing,
    isPaused: microphone.isPaused,
  });
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>('ready');
  const [statusMessage, setStatusMessage] = useState('Ready for local microphone capture.');

  useEffect(() => {
    if (microphone.error) {
      setCaptureStatus('error');
      setStatusMessage(microphone.error);
      return;
    }

    if (microphone.isPaused) {
      setCaptureStatus('paused');
      setStatusMessage('Microphone capture paused.');
      return;
    }

    if (microphone.isCapturing) {
      setCaptureStatus('listening');
      setStatusMessage('Microphone is live and audio level is being monitored locally.');
      return;
    }

    setCaptureStatus('ready');
    setStatusMessage('Ready for local microphone capture.');
  }, [microphone.error, microphone.isCapturing, microphone.isPaused]);

  useEffect(() => {
    if (!microphone.isCapturing || microphone.error) {
      return;
    }

    if (realtime.connectionStatus === 'disconnected') {
      void realtime.connect();
    }
  }, [microphone.error, microphone.isCapturing, realtime.connect, realtime.connectionStatus]);

  const realtimeState: RealtimeConnectionState = useMemo(() => {
    if (captureStatus === 'error' || realtime.realtimeError) {
      return 'error';
    }

    if (captureStatus === 'paused') {
      return 'paused';
    }

    if (realtime.lastServerMessage && 'type' in realtime.lastServerMessage && realtime.lastServerMessage.type === 'transcript_partial') {
      return 'processing';
    }

    if (captureStatus === 'listening') {
      return 'ready';
    }

    return 'ready';
  }, [captureStatus, realtime.lastServerMessage, realtime.realtimeError]);

  const handleStart = async () => {
    await realtime.disconnect();
    await microphone.startCapture(settings.selected_input_device_id || undefined);
  };

  const handleStop = async () => {
    if (realtime.connectionStatus === 'connected') {
      realtime.sendSessionStop();
      await realtime.disconnect();
    }
    await microphone.stopCapture();
  };

  const handlePauseResume = async () => {
    if (microphone.isPaused) {
      await microphone.resumeCapture();
      return;
    }

    await microphone.pauseCapture();
  };

  const websocketStatusLabel: Record<RealtimeConnectionStatus, string> = {
    disconnected: 'Disconnected',
    connecting: 'Connecting',
    connected: 'Connected',
    error: 'Error',
  };

  const websocketTone: Record<RealtimeConnectionStatus, 'muted' | 'warning' | 'success' | 'danger'> = {
    disconnected: 'muted',
    connecting: 'warning',
    connected: 'success',
    error: 'danger',
  };

  const lastAckMessage = realtime.lastServerMessage && 'type' in realtime.lastServerMessage && realtime.lastServerMessage.type === 'server_ack'
    ? `Ack chunk #${realtime.lastServerMessage.chunk_index ?? '-'} received (${realtime.lastServerMessage.payload_size} bytes)`
    : realtime.lastServerMessage
      ? JSON.stringify(realtime.lastServerMessage)
      : 'Belum ada respons server.';

  return (
    <div className="page-grid page-grid--twoColumn">
      <Card
        title="Session controls"
        description="Kontrol dasar untuk sesi capture mikrofon lokal."
      >
        <div className="stack">
          <div className="control-row">
            <LanguageSelector
              id="source-language"
              label="Source language"
              value={settings.source_language}
              options={LANGUAGE_OPTIONS}
              onChange={(value) => updateSettings({ source_language: value })}
            />
            <LanguageSelector
              id="target-language"
              label="Target language"
              value={settings.target_language}
              options={LANGUAGE_OPTIONS}
              onChange={(value) => updateSettings({ target_language: value })}
            />
          </div>

          <VoiceModeSelector
            value={settings.translation_mode}
            onChange={(value) => updateSettings({ translation_mode: value })}
          />

          <div className="control-row">
            <StartStopButton
              isRunning={microphone.isCapturing}
              onToggle={() => {
                if (microphone.isCapturing) {
                  void handleStop();
                  return;
                }

                void handleStart();
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void handlePauseResume();
              }}
              disabled={!microphone.isCapturing && !microphone.isPaused}
            >
              {microphone.isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void handleStop();
              }}
            >
              Stop
            </Button>
          </div>

          <RealtimeStatus
            state={realtimeState}
            message={captureStatus === 'error'
              ? statusMessage
              : realtime.realtimeError
                ? realtime.realtimeError
                : realtime.lastServerMessage && 'type' in realtime.lastServerMessage && realtime.lastServerMessage.type === 'transcript_partial'
                  ? 'Processing transcript placeholder.'
                  : captureStatus === 'paused'
                    ? 'Paused'
                    : captureStatus === 'listening'
                      ? 'Listening'
                      : 'Ready'}
          />

          <p className={captureStatus === 'error' || realtime.realtimeError ? 'text-danger' : 'text-muted'}>
            {realtime.realtimeError ?? statusMessage}
          </p>
        </div>
      </Card>

      <Card
        title="Realtime indicators"
        description="Audio meter sekarang membaca input microphone lokal."
      >
        <div className="stack">
          <LatencyIndicator latencyMs={microphone.isCapturing && !microphone.isPaused ? 18 : null} />
          <AudioLevelMeter level={microphone.audioLevel} />
          <div className="status-card">
            <div>
              <p className="status-card__label">WebSocket status</p>
              <strong className="status-card__value">{websocketStatusLabel[realtime.connectionStatus]}</strong>
            </div>
            <span className={`status-pill status-pill--${websocketTone[realtime.connectionStatus]}`}>{websocketStatusLabel[realtime.connectionStatus]}</span>
          </div>
          <div className="status-card">
            <div>
              <p className="status-card__label">Capture status</p>
              <strong className="status-card__value">
                {captureStatus === 'error'
                  ? 'Error'
                  : captureStatus === 'paused'
                    ? 'Paused'
                    : captureStatus === 'listening'
                      ? 'Listening'
                      : 'Ready'}
              </strong>
            </div>
            <span className="status-pill status-pill--warning">Local only</span>
          </div>
          <p className={realtime.realtimeError ? 'text-danger' : 'text-muted'}>{realtime.realtimeError ?? lastAckMessage}</p>
        </div>
      </Card>

      <TranscriptPanel
        label="Original transcript"
        text={realtime.transcriptText || 'Transkrip asli akan muncul di sini saat audio pipeline placeholder mengirim transcript_partial.'}
      />

      <TranslationPanel
        label="Translated transcript"
        text="Translation will appear here..."
      />
    </div>
  );
}

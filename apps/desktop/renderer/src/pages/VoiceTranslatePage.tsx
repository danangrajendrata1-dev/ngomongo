import { useEffect, useMemo, useRef, useState } from 'react';

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
import { useAudioSegmentRecorder } from '@/hooks/useAudioSegmentRecorder';
import { useMicrophoneCapture } from '@/hooks/useMicrophoneCapture';
import { useRealtimeAudioStream } from '@/hooks/useRealtimeAudioStream';
import type { RealtimeConnectionState } from '@/types/translator';
import type { RealtimeConnectionStatus } from '@/types/realtime';

type CaptureStatus = 'ready' | 'listening' | 'paused' | 'error';

export function VoiceTranslatePage() {
  const auth = useAuth();
  const { settings, updateSettings } = useLocalSettings();
  const segmentIndexRef = useRef(0);
  const microphone = useMicrophoneCapture();
  const realtime = useRealtimeAudioStream({
    token: auth.token,
  });
  const sourceLanguageCode = settings.source_language === 'English' ? 'en' : 'id';
  const targetLanguageCode = settings.target_language === 'English' ? 'en' : 'id';
  const translationModeCode = settings.translation_mode.toLowerCase();
  const segmentRecorder = useAudioSegmentRecorder({
    onSegment: async (segment) => {
      segmentIndexRef.current += 1;
      realtime.sendAudioSegment({
        type: 'audio_segment',
        chunk_index: segmentIndexRef.current,
        timestamp: Date.now(),
        source_language: sourceLanguageCode,
        target_language: targetLanguageCode,
        translation_mode: translationModeCode,
        content_type: segment.contentType || 'audio/webm',
        filename: segment.filename,
        audio_base64: segment.audioBase64,
      });
    },
    segmentDurationMs: 3000,
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

  const realtimeState: RealtimeConnectionState = useMemo(() => {
    if (captureStatus === 'error' || realtime.realtimeError) {
      return 'error';
    }

    if (captureStatus === 'paused') {
      return 'paused';
    }

    if (realtime.outputStatus === 'speaking' || realtime.translationEvents.length > 0 || realtime.transcriptEvents.length > 0 || realtime.ttsEvents.length > 0) {
      return 'processing';
    }

    if (captureStatus === 'listening') {
      return 'ready';
    }

    return 'ready';
  }, [captureStatus, realtime.outputStatus, realtime.realtimeError, realtime.transcriptEvents.length, realtime.translationEvents.length, realtime.ttsEvents.length]);

  const statusLabel = useMemo(() => {
    if (captureStatus === 'error') {
      return statusMessage;
    }

    if (realtime.realtimeError) {
      return realtime.realtimeError;
    }

    if (realtime.outputStatus === 'speaking') {
      return 'Processing transcript, translation, and TTS placeholders.';
    }

    if (realtime.translationEvents.length > 0 || realtime.transcriptEvents.length > 0 || realtime.ttsEvents.length > 0) {
      return 'Processing transcript, translation, and TTS placeholders.';
    }

    if (captureStatus === 'paused') {
      return 'Paused';
    }

    if (captureStatus === 'listening') {
      return 'Listening';
    }

    return 'Ready';
  }, [captureStatus, realtime.outputStatus, realtime.realtimeError, realtime.transcriptEvents.length, realtime.translationEvents.length, realtime.ttsEvents.length, statusMessage]);

  const handleStart = async () => {
    await realtime.disconnect();
    segmentIndexRef.current = 0;
    const isConnected = await realtime.connect();
    if (!isConnected) {
      return;
    }
    const stream = await microphone.startCapture(settings.selected_input_device_id || undefined);
    if (!stream) {
      await realtime.disconnect();
      return;
    }
    await segmentRecorder.startRecording(stream);
  };

  const handleStop = async () => {
    await segmentRecorder.stopRecording();
    if (realtime.connectionStatus === 'connected') {
      realtime.sendSessionStop();
      await realtime.disconnect();
    }
    await microphone.stopCapture();
  };

  const handlePauseResume = async () => {
    if (microphone.isPaused) {
      await microphone.resumeCapture();
      segmentRecorder.resumeRecording();
      return;
    }

    await microphone.pauseCapture();
    segmentRecorder.pauseRecording();
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

  const lastAckMessage = realtime.lastServerAck
    ? `Ack chunk #${realtime.lastServerAck.chunk_index ?? '-'} received (${realtime.lastServerAck.payload_size} bytes)`
    : 'Belum ada respons server.';

  const outputStatusLabel = realtime.outputStatus === 'speaking' ? 'Speaking placeholder' : 'Idle';
  const ttsMessage = realtime.lastTtsEvent ? 'TTS placeholder received' : 'No TTS placeholder yet.';
  const sttModeLabel = realtime.sttMode === 'real' ? 'Real' : 'Placeholder';
  const providerMessage = realtime.lastTranscriptReceived || 'Belum ada transcript dari provider.';

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
            message={statusLabel}
          />

          <p className={captureStatus === 'error' || realtime.realtimeError ? 'text-danger' : 'text-muted'}>
            {segmentRecorder.error ?? realtime.realtimeError ?? statusMessage}
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
          <div className="status-card">
            <div>
              <p className="status-card__label">Output status</p>
              <strong className="status-card__value">{outputStatusLabel}</strong>
            </div>
            <span className={`status-pill status-pill--${realtime.outputStatus === 'speaking' ? 'success' : 'muted'}`}>{outputStatusLabel}</span>
          </div>
          <div className="status-card">
            <div>
              <p className="status-card__label">STT mode</p>
              <strong className="status-card__value">{sttModeLabel}</strong>
            </div>
            <span className={`status-pill status-pill--${realtime.sttMode === 'real' ? 'success' : 'warning'}`}>{sttModeLabel}</span>
          </div>
          <p className="text-muted">{providerMessage}</p>
          <p className="text-muted">{ttsMessage}</p>
          <p className={segmentRecorder.error || realtime.realtimeError ? 'text-danger' : 'text-muted'}>
            {segmentRecorder.error ?? realtime.realtimeError ?? lastAckMessage}
          </p>
        </div>
      </Card>

      <TranscriptPanel
        label="Original transcript"
        text={realtime.transcriptText || 'Transkrip asli akan muncul di sini saat audio segment dikirim ke STT provider.'}
      />

      <TranslationPanel
        label="Translated transcript"
        text={realtime.translationText || 'Translation will appear here...'}
      />
    </div>
  );
}

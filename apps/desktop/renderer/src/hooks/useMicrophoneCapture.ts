import { useCallback, useEffect, useRef, useState } from 'react';

type MicrophoneCaptureState = {
  stream: MediaStream | null;
  audioLevel: number;
  isCapturing: boolean;
  isPaused: boolean;
  error: string | null;
};

function getFriendlyCaptureError(error: unknown): string {
  if (!(error instanceof DOMException)) {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Failed to access microphone.';
  }

  if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
    return 'Microphone permission denied. Please allow microphone access to use Voice Translate.';
  }

  if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
    return 'Microphone device not found. Please select another microphone in Device Setup.';
  }

  if (error.name === 'NotReadableError') {
    return 'Microphone is currently unavailable. Please close other apps using the microphone and try again.';
  }

  return error.message || 'Failed to access microphone.';
}

export function useMicrophoneCapture() {
  const [state, setState] = useState<MicrophoneCaptureState>({
    stream: null,
    audioLevel: 0,
    isCapturing: false,
    isPaused: false,
    error: null,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);

  const cleanupGraph = useCallback(async () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;

    const context = audioContextRef.current;
    audioContextRef.current = null;

    if (context) {
      try {
        await context.close();
      } catch {
        try {
          await context.suspend();
        } catch {
          // ignore close/suspend cleanup failures
        }
      }
    }
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopCapture = useCallback(async () => {
    activeRef.current = false;
    pausedRef.current = false;
    stopTracks();
    await cleanupGraph();
    setState({
      stream: null,
      audioLevel: 0,
      isCapturing: false,
      isPaused: false,
      error: null,
    });
  }, [cleanupGraph, stopTracks]);

  const readLevel = useCallback(() => {
    const analyser = analyserRef.current;

    if (!analyser || !activeRef.current || pausedRef.current) {
      return;
    }

    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);

    let sum = 0;
    for (let index = 0; index < data.length; index += 1) {
      const normalized = (data[index] - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / data.length);
    const level = Math.min(1, Math.max(0, rms * 1.8));
    setState((current) => ({
      ...current,
      audioLevel: level,
      error: null,
    }));

    rafRef.current = window.requestAnimationFrame(readLevel);
  }, []);

  const startCapture = useCallback(async (inputDeviceId?: string): Promise<MediaStream | null> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setState((current) => ({
        ...current,
        error: 'Media devices are not supported in this environment.',
      }));
      return null;
    }

    await stopCapture();

    const audioConstraints: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    if (inputDeviceId) {
      audioConstraints.deviceId = { exact: inputDeviceId };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.2;

      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceNodeRef.current = sourceNode;
      activeRef.current = true;
      pausedRef.current = false;

      setState({
        stream,
        audioLevel: 0,
        isCapturing: true,
        isPaused: false,
        error: null,
      });

      void audioContext.resume();
      rafRef.current = window.requestAnimationFrame(readLevel);
      return stream;
    } catch (error) {
      const message = getFriendlyCaptureError(error);
      activeRef.current = false;
      pausedRef.current = false;
      stopTracks();
      await cleanupGraph();
      setState({
        stream: null,
        audioLevel: 0,
        isCapturing: false,
        isPaused: false,
        error: message,
      });
      return null;
    }
  }, [cleanupGraph, readLevel, stopCapture, stopTracks]);

  const pauseCapture = useCallback(async () => {
    if (!activeRef.current || !audioContextRef.current || pausedRef.current) {
      return;
    }

    pausedRef.current = true;
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    try {
      await audioContextRef.current.suspend();
    } catch {
      // ignore suspend failures, stream remains attached for resume/stop
    }

    setState((current) => ({
      ...current,
      isPaused: true,
      isCapturing: true,
    }));
  }, []);

  const resumeCapture = useCallback(async () => {
    if (!activeRef.current || !audioContextRef.current || !pausedRef.current) {
      return;
    }

    try {
      await audioContextRef.current.resume();
      pausedRef.current = false;
      setState((current) => ({
        ...current,
        isPaused: false,
        isCapturing: true,
        error: null,
      }));
      rafRef.current = window.requestAnimationFrame(readLevel);
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getFriendlyCaptureError(error),
      }));
    }
  }, [readLevel]);

  useEffect(() => {
    return () => {
      void stopCapture();
    };
  }, [stopCapture]);

  return {
    startCapture,
    pauseCapture,
    resumeCapture,
    stopCapture,
    audioLevel: state.audioLevel,
    isCapturing: state.isCapturing,
    isPaused: state.isPaused,
    error: state.error,
    stream: state.stream,
  };
}

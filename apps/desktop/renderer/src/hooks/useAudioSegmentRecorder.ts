import { useCallback, useEffect, useRef, useState } from 'react';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to convert audio segment to base64.'));
        return;
      }

      const base64 = result.split(',')[1] ?? '';
      resolve(base64);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read audio segment.'));
    };
    reader.readAsDataURL(blob);
  });
}

type AudioSegment = {
  audioBase64: string;
  contentType: string;
  filename: string;
};

function getExtensionFromContentType(contentType: string): string {
  if (contentType.includes('wav')) {
    return 'wav';
  }
  if (contentType.includes('mpeg') || contentType.includes('mp3')) {
    return 'mp3';
  }
  if (contentType.includes('webm')) {
    return 'webm';
  }
  return 'webm';
}

type UseAudioSegmentRecorderArgs = {
  onSegment: (segment: AudioSegment) => Promise<void> | void;
  segmentDurationMs?: number;
};

export function useAudioSegmentRecorder({ onSegment, segmentDurationMs = 3000 }: UseAudioSegmentRecorderArgs) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanupRecorder = useCallback(() => {
    const recorder = recorderRef.current;
    recorderRef.current = null;

    if (!recorder) {
      return;
    }

    recorder.ondataavailable = null;
    recorder.onerror = null;
    recorder.onstop = null;
  }, []);

  const stopRecording = useCallback(async () => {
    activeRef.current = false;
    pausedRef.current = false;

    const recorder = recorderRef.current;
    cleanupRecorder();

    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }

    setIsRecording(false);
  }, [cleanupRecorder]);

  const startRecording = useCallback(async (stream: MediaStream) => {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
      setError('MediaRecorder is not supported in this environment.');
      return;
    }

    await stopRecording();

    const preferredMimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

    try {
      const recorder = preferredMimeType ? new MediaRecorder(stream, { mimeType: preferredMimeType }) : new MediaRecorder(stream);
      activeRef.current = true;
      pausedRef.current = false;
      setError(null);

      recorder.ondataavailable = (event) => {
        if (!activeRef.current || pausedRef.current) {
          return;
        }

        if (!event.data || event.data.size === 0) {
          return;
        }

        void blobToBase64(event.data)
          .then((audioBase64) => {
            const contentType = event.data.type || recorder.mimeType || 'audio/webm';
            return onSegment({
              audioBase64,
              contentType,
              filename: `segment-${Date.now()}.${getExtensionFromContentType(contentType)}`,
            });
          })
          .catch((segmentError) => {
            setError(segmentError instanceof Error ? segmentError.message : 'Failed to prepare audio segment.');
          });
      };

      recorder.onerror = () => {
        setError('Audio segment recorder encountered an error.');
      };

      recorder.onstop = () => {
        setIsRecording(false);
      };

      recorder.start(segmentDurationMs);
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (recordingError) {
      setError(recordingError instanceof Error ? recordingError.message : 'Failed to start audio segment recorder.');
    }
  }, [onSegment, segmentDurationMs, stopRecording]);

  const pauseRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') {
      return;
    }

    pausedRef.current = true;
    recorder.pause();
    setIsRecording(false);
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'paused') {
      return;
    }

    pausedRef.current = false;
    recorder.resume();
    setIsRecording(true);
  }, []);

  useEffect(() => {
    return () => {
      void stopRecording();
    };
  }, [stopRecording]);

  return {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    isRecording,
    error,
  };
}

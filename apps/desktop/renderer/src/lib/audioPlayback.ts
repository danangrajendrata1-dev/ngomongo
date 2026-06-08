let playbackContext: AudioContext | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

export type AudioPlaybackResult = {
  usedDefaultOutput: boolean;
  warning: string | null;
};

type AudioElementWithSinkId = HTMLAudioElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

function getPlaybackContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
    return null;
  }

  if (playbackContext && playbackContext.state !== 'closed') {
    return playbackContext;
  }

  playbackContext = new AudioContext();
  return playbackContext;
}

function base64ToBlob(base64: string, contentType: string): Blob {
  const binary = window.atob(base64);
  const length = binary.length;
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: contentType });
}

function cleanupCurrentAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}

function createToneWavBlob(durationMs = 180, frequency = 880, sampleRate = 24000): Blob {
  const totalSamples = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));
  const amplitude = 0.2;
  const pcmData = new Int16Array(totalSamples);

  for (let index = 0; index < totalSamples; index += 1) {
    const time = index / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * time) * amplitude;
    pcmData[index] = Math.max(-1, Math.min(1, sample)) * 0x7fff;
  }

  const wavBuffer = new ArrayBuffer(44 + pcmData.length * 2);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.length * 2, true);

  pcmData.forEach((sample, index) => {
    view.setInt16(44 + index * 2, sample, true);
  });

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

async function playAudioElement(audio: HTMLAudioElement, outputDeviceId?: string): Promise<AudioPlaybackResult> {
  currentAudio = audio;
  const playbackResult = await applyOutputDevice(audio, outputDeviceId);

  return new Promise<AudioPlaybackResult>((resolve, reject) => {
    const finalize = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      resolve(playbackResult);
    };

    audio.onended = finalize;
    audio.onerror = () => {
      cleanupCurrentAudio();
      reject(new Error('Audio playback failed. Please check your speaker output or browser permissions.'));
    };

    void audio.play().catch(() => {
      cleanupCurrentAudio();
      reject(new Error('Audio playback was blocked. Interact with the app and try again.'));
    });
  });
}

async function applyOutputDevice(audio: HTMLAudioElement, outputDeviceId?: string): Promise<AudioPlaybackResult> {
  const normalizedDeviceId = outputDeviceId?.trim();
  if (!normalizedDeviceId) {
    return {
      usedDefaultOutput: true,
      warning: null,
    };
  }

  const targetAudio = audio as AudioElementWithSinkId;
  if (typeof targetAudio.setSinkId !== 'function') {
    return {
      usedDefaultOutput: true,
      warning: 'Selected output device is not supported in this environment. Playing on default output.',
    };
  }

  try {
    await targetAudio.setSinkId(normalizedDeviceId);
    return {
      usedDefaultOutput: false,
      warning: null,
    };
  } catch {
    return {
      usedDefaultOutput: true,
      warning: 'Selected output device could not be used. Playing on default output.',
    };
  }
}

export function stopAudioPlayback(): void {
  cleanupCurrentAudio();
}

export async function playPlaceholderBeep(
  durationMs = 160,
  volume = 0.06,
  outputDeviceId?: string,
): Promise<AudioPlaybackResult> {
  const context = getPlaybackContext();
  if (!context) {
    return {
      usedDefaultOutput: true,
      warning: 'Audio playback is not supported in this environment.',
    };
  }

  if (context.state === 'suspended') {
    try {
      await context.resume();
    } catch {
      return {
        usedDefaultOutput: true,
        warning: 'Audio playback is blocked in this environment.',
      };
    }
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  gain.gain.value = 0;

  oscillator.connect(gain);
  gain.connect(context.destination);

  const now = context.currentTime;
  const durationSeconds = Math.max(0.08, Math.min(durationMs, 300)) / 1000;
  const releaseEnd = now + durationSeconds;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(Math.max(0.01, Math.min(volume, 0.2)), now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

  const warning = outputDeviceId?.trim()
    ? 'Selected output device is not supported for generated tones in this environment. Playing on default output.'
    : null;

  return new Promise<AudioPlaybackResult>((resolve) => {
    oscillator.onended = () => {
      try {
        oscillator.disconnect();
        gain.disconnect();
      } catch {
        // ignore disconnect failures
      }
      resolve({
        usedDefaultOutput: Boolean(outputDeviceId?.trim()),
        warning,
      });
    };

    try {
      oscillator.start(now);
      oscillator.stop(releaseEnd + 0.02);
    } catch {
      resolve({
        usedDefaultOutput: Boolean(outputDeviceId?.trim()),
        warning,
      });
    }
  });
}

export async function playTestTone(outputDeviceId?: string): Promise<AudioPlaybackResult> {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') {
    throw new Error('Audio playback is not supported in this environment.');
  }

  cleanupCurrentAudio();

  const toneBlob = createToneWavBlob(180, 880, 24000);
  const objectUrl = URL.createObjectURL(toneBlob);
  const audio = new Audio(objectUrl);
  currentAudioUrl = objectUrl;
  audio.preload = 'auto';

  try {
    return await playAudioElement(audio, outputDeviceId);
  } finally {
    if (currentAudioUrl === objectUrl) {
      URL.revokeObjectURL(objectUrl);
      currentAudioUrl = null;
    }
  }
}

export async function playBase64Audio(
  audioBase64: string,
  contentType: string,
  outputDeviceId?: string,
): Promise<AudioPlaybackResult> {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') {
    throw new Error('Audio playback is not supported in this environment.');
  }

  if (!audioBase64.trim()) {
    throw new Error('Audio payload is empty.');
  }

  cleanupCurrentAudio();

  const audioBlob = base64ToBlob(audioBase64, contentType || 'audio/mpeg');
  const objectUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(objectUrl);
  currentAudioUrl = objectUrl;
  audio.preload = 'auto';

  try {
    return await playAudioElement(audio, outputDeviceId);
  } finally {
    if (currentAudioUrl === objectUrl) {
      URL.revokeObjectURL(objectUrl);
      currentAudioUrl = null;
    }
  }
}

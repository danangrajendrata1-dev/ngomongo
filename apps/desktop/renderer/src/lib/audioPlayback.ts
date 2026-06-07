let playbackContext: AudioContext | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

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

export async function playPlaceholderBeep(durationMs = 160, volume = 0.06): Promise<void> {
  const context = getPlaybackContext();
  if (!context) {
    return;
  }

  if (context.state === 'suspended') {
    try {
      await context.resume();
    } catch {
      return;
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

  return new Promise<void>((resolve) => {
    oscillator.onended = () => {
      try {
        oscillator.disconnect();
        gain.disconnect();
      } catch {
        // ignore disconnect failures
      }
      resolve();
    };

    try {
      oscillator.start(now);
      oscillator.stop(releaseEnd + 0.02);
    } catch {
      resolve();
    }
  });
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

export function stopAudioPlayback(): void {
  cleanupCurrentAudio();
}

export async function playBase64Audio(audioBase64: string, contentType: string): Promise<void> {
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
  currentAudio = audio;
  currentAudioUrl = objectUrl;
  audio.preload = 'auto';

  return new Promise<void>((resolve, reject) => {
    const finalize = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      if (currentAudioUrl === objectUrl) {
        URL.revokeObjectURL(objectUrl);
        currentAudioUrl = null;
      }
      resolve();
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

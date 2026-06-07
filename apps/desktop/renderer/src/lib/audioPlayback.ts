let playbackContext: AudioContext | null = null;

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

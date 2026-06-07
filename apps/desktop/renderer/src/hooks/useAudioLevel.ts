import { useEffect, useState } from 'react';

export function useAudioLevel(stream: MediaStream | null) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!stream) {
      setLevel(0);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    let animationFrame = 0;

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const average = data.reduce((sum, current) => sum + current, 0) / data.length;
      setLevel(Math.min(100, Math.round((average / 255) * 100)));
      animationFrame = window.requestAnimationFrame(tick);
    };

    void audioContext.resume();
    tick();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close();
    };
  }, [stream]);

  return level;
}

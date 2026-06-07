import { useCallback, useEffect, useMemo, useState } from 'react';

import type { AudioDeviceOption, AudioDevicesState } from '@/types/audio';

function getDeviceLabel(device: MediaDeviceInfo): string {
  if (device.label.trim()) {
    return device.label;
  }

  return device.kind === 'audioinput' ? `Microphone ${device.deviceId.slice(0, 6)}` : `Output ${device.deviceId.slice(0, 6)}`;
}

function toDeviceOption(device: MediaDeviceInfo): AudioDeviceOption {
  return {
    deviceId: device.deviceId,
    groupId: device.groupId,
    label: getDeviceLabel(device),
    kind: device.kind === 'audiooutput' ? 'output' : 'input',
  };
}

export function useAudioDevices() {
  const [state, setState] = useState<AudioDevicesState>({
    microphones: [],
    outputDevices: [],
    supportsOutputSelection: typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype,
    permissionGranted: false,
    isLoading: true,
    error: null,
  });

  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      setState((current) => ({
        ...current,
        microphones: [],
        outputDevices: [],
        isLoading: false,
        error: 'Media devices tidak didukung di environment ini.',
      }));
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    let permissionGranted = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionGranted = true;
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      permissionGranted = false;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices
        .filter((device) => device.kind === 'audioinput')
        .map(toDeviceOption);
      const outputDevices = devices
        .filter((device) => device.kind === 'audiooutput')
        .map(toDeviceOption);

      setState((current) => ({
        ...current,
        microphones,
        outputDevices,
        permissionGranted,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        microphones: [],
        outputDevices: [],
        permissionGranted,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Gagal membaca daftar audio device.',
      }));
    }
  }, []);

  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  const availableMicrophones = useMemo(() => state.microphones, [state.microphones]);
  const availableOutputDevices = useMemo(() => state.outputDevices, [state.outputDevices]);

  return {
    microphones: availableMicrophones,
    outputDevices: availableOutputDevices,
    supportsOutputSelection: state.supportsOutputSelection,
    permissionGranted: state.permissionGranted,
    isLoading: state.isLoading,
    error: state.error,
    refreshDevices,
  };
}

export type AudioDeviceKind = 'input' | 'output';

export type AudioDeviceOption = {
  deviceId: string;
  groupId: string;
  label: string;
  kind: AudioDeviceKind;
};

export type AudioDevicesState = {
  microphones: AudioDeviceOption[];
  outputDevices: AudioDeviceOption[];
  supportsOutputSelection: boolean;
  permissionGranted: boolean;
  isLoading: boolean;
  error: string | null;
};

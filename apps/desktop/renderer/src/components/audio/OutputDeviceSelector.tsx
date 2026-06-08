import { Select } from '@/components/ui/Select';
import type { AudioDeviceOption } from '@/types/audio';

type OutputDeviceSelectorProps = {
  value: string;
  devices: AudioDeviceOption[];
  onChange: (deviceId: string) => void;
  disabled?: boolean;
  supportsOutputSelection: boolean;
};

export function OutputDeviceSelector({
  value,
  devices,
  onChange,
  disabled = false,
  supportsOutputSelection,
}: OutputDeviceSelectorProps) {
  return (
    <div className="field-group">
      <label className="field-group__label" htmlFor="output-selector">
        Output Device
      </label>
      <Select
        id="output-selector"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">Pilih output device</option>
        {devices.map((device) => (
          <option
            key={device.deviceId}
            value={device.deviceId}
          >
            {device.label}
          </option>
        ))}
      </Select>
      <p className="field-group__hint">
        {supportsOutputSelection
          ? 'Output device dapat dipilih saat environment mendukung routing audio.'
          : 'Output device tetap bisa dipilih, tetapi playback mungkin fallback ke default output di environment ini.'}
      </p>
    </div>
  );
}

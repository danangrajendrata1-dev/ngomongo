import { Select } from '@/components/ui/Select';
import type { AudioDeviceOption } from '@/types/audio';

type MicSelectorProps = {
  value: string;
  devices: AudioDeviceOption[];
  onChange: (deviceId: string) => void;
  disabled?: boolean;
  statusText?: string;
};

export function MicSelector({ value, devices, onChange, disabled = false, statusText }: MicSelectorProps) {
  return (
    <div className="field-group">
      <label className="field-group__label" htmlFor="mic-selector">
        Microphone
      </label>
      <Select
        id="mic-selector"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">Pilih microphone</option>
        {devices.map((device) => (
          <option
            key={device.deviceId}
            value={device.deviceId}
          >
            {device.label}
          </option>
        ))}
      </Select>
      {statusText ? <p className="field-group__hint">{statusText}</p> : null}
    </div>
  );
}

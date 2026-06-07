import { Select } from '@/components/ui/Select';
import { TRANSLATION_MODES } from '@/lib/constants';
import type { TranslationMode } from '@/types/translator';

type VoiceModeSelectorProps = {
  value: TranslationMode;
  onChange: (value: TranslationMode) => void;
};

export function VoiceModeSelector({ value, onChange }: VoiceModeSelectorProps) {
  return (
    <div className="field-group">
      <label className="field-group__label" htmlFor="voice-mode-selector">
        Translation Mode
      </label>
      <Select
        id="voice-mode-selector"
        value={value}
        onChange={(event) => onChange(event.target.value as TranslationMode)}
      >
        {TRANSLATION_MODES.map((mode) => (
          <option
            key={mode}
            value={mode}
          >
            {mode}
          </option>
        ))}
      </Select>
    </div>
  );
}

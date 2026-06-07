import { Select } from '@/components/ui/Select';
import type { TranslationLanguage } from '@/types/translator';

type LanguageSelectorProps = {
  id: string;
  label: string;
  value: TranslationLanguage;
  options: ReadonlyArray<{ value: TranslationLanguage; label: string }>;
  onChange: (value: TranslationLanguage) => void;
};

export function LanguageSelector({ id, label, value, options, onChange }: LanguageSelectorProps) {
  return (
    <div className="field-group">
      <label className="field-group__label" htmlFor={id}>
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as TranslationLanguage)}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

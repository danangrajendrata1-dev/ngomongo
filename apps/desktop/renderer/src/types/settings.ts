import type { TranslationLanguage, TranslationMode } from '@/types/translator';

export type LocalSettings = {
  selected_input_device_id: string;
  selected_input_device_name: string;
  selected_output_device_id: string;
  selected_output_device_name: string;
  source_language: TranslationLanguage;
  target_language: TranslationLanguage;
  translation_mode: TranslationMode;
  noise_suppression_enabled: boolean;
  echo_cancellation_enabled: boolean;
  push_to_talk_enabled: boolean;
  auto_start_enabled: boolean;
};

export type LocalSettingsPatch = Partial<LocalSettings>;

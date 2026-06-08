import type { LocalSettings } from '@/types/settings';

export const APP_NAME = import.meta.env.VITE_APP_NAME?.trim() || 'NGOMONGO';
export const API_URL = import.meta.env.VITE_API_URL?.trim() || '';
export const WS_URL = import.meta.env.VITE_WS_URL?.trim() || '';

export type AppPageId =
  | 'dashboard'
  | 'voice-translate'
  | 'device-setup'
  | 'voice-profile'
  | 'history'
  | 'usage'
  | 'settings';

export const NAV_ITEMS: Array<{ id: AppPageId; label: string; description: string }> = [
  { id: 'dashboard', label: 'Dashboard', description: 'Ringkasan aplikasi' },
  { id: 'voice-translate', label: 'Voice Translate', description: 'Fondasi sesi terjemahan' },
  { id: 'device-setup', label: 'Device Setup', description: 'Input dan output audio' },
  { id: 'voice-profile', label: 'Voice Profile', description: 'Consent dan profil suara' },
  { id: 'history', label: 'History', description: 'Riwayat transcript' },
  { id: 'usage', label: 'Usage & Plan', description: 'Konsumsi dan paket' },
  { id: 'settings', label: 'Settings', description: 'Preferensi aplikasi' },
];

export const TRANSLATION_MODES = ['Interview', 'Meeting', 'Discord', 'Game', 'Casual'] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'English', label: 'English' },
] as const;

export const STORAGE_KEYS = {
  accessToken: 'ngomongo.accessToken',
  tokenType: 'ngomongo.tokenType',
  user: 'ngomongo.user',
  desktopDeviceId: 'ngomongo.desktopDeviceId',
  localSettings: 'ngomongo.localSettings',
} as const;

export const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
  selected_input_device_id: '',
  selected_input_device_name: '',
  selected_output_device_id: '',
  selected_output_device_name: '',
  source_language: 'Indonesian',
  target_language: 'English',
  translation_mode: 'Interview',
  noise_suppression_enabled: true,
  echo_cancellation_enabled: true,
  push_to_talk_enabled: false,
  auto_start_enabled: false,
};

import { loadLocalSettings, resetLocalSettings, saveLocalSettings, updateLocalSettings } from '@/stores/settingsStore';
import type { LocalSettings, LocalSettingsPatch } from '@/types/settings';

export function getLocalSettings(): LocalSettings {
  return loadLocalSettings();
}

export function persistLocalSettings(settings: LocalSettings): LocalSettings {
  return saveLocalSettings(settings);
}

export function patchLocalSettings(patch: LocalSettingsPatch): LocalSettings {
  return updateLocalSettings(patch);
}

export function clearLocalSettings(): LocalSettings {
  return resetLocalSettings();
}

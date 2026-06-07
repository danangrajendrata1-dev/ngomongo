import { DEFAULT_LOCAL_SETTINGS, STORAGE_KEYS } from '@/lib/constants';
import { readStorageValue, removeStorageValue, writeStorageValue } from '@/lib/storage';
import type { LocalSettings, LocalSettingsPatch } from '@/types/settings';

function normalizeSettings(settings: Partial<LocalSettings> | null | undefined): LocalSettings {
  return {
    ...DEFAULT_LOCAL_SETTINGS,
    ...(settings ?? {}),
  };
}

export function loadLocalSettings(): LocalSettings {
  return normalizeSettings(readStorageValue<Partial<LocalSettings> | null>(STORAGE_KEYS.localSettings, null));
}

export function saveLocalSettings(settings: LocalSettings): LocalSettings {
  const normalized = normalizeSettings(settings);
  writeStorageValue(STORAGE_KEYS.localSettings, normalized);
  return normalized;
}

export function updateLocalSettings(patch: LocalSettingsPatch): LocalSettings {
  const nextSettings = normalizeSettings({
    ...loadLocalSettings(),
    ...patch,
  });

  writeStorageValue(STORAGE_KEYS.localSettings, nextSettings);
  return nextSettings;
}

export function resetLocalSettings(): LocalSettings {
  removeStorageValue(STORAGE_KEYS.localSettings);
  return DEFAULT_LOCAL_SETTINGS;
}

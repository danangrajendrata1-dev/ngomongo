import { useCallback, useState } from 'react';

import { getLocalSettings, persistLocalSettings, patchLocalSettings, clearLocalSettings } from '@/services/settings.service';
import type { LocalSettings, LocalSettingsPatch } from '@/types/settings';

export function useLocalSettings() {
  const [settings, setSettings] = useState<LocalSettings>(() => getLocalSettings());

  const saveSettings = useCallback((nextSettings: LocalSettings) => {
    const persisted = persistLocalSettings(nextSettings);
    setSettings(persisted);
    return persisted;
  }, []);

  const updateSettings = useCallback((patch: LocalSettingsPatch) => {
    const persisted = patchLocalSettings(patch);
    setSettings(persisted);
    return persisted;
  }, []);

  const resetSettings = useCallback(() => {
    const reset = clearLocalSettings();
    setSettings(reset);
    return reset;
  }, []);

  return {
    settings,
    saveSettings,
    updateSettings,
    resetSettings,
  };
}

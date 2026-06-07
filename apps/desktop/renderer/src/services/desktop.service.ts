import { getOrCreateDesktopDeviceId } from '@/lib/storage';
import { requestJson } from '@/services/api';
import type {
  DesktopDeviceRecord,
  DesktopDeviceRegistrationPayload,
  DesktopDeviceSettings,
  DesktopDeviceSettingsPayload,
} from '@/types/device';
import type { LocalSettings } from '@/types/settings';
import { loadLocalSettings, saveLocalSettings } from '@/stores/settingsStore';

function getOsName(): string {
  if (window.ngomongo?.app?.getPlatform) {
    const platform = window.ngomongo.app.getPlatform();
    if (platform === 'win32') {
      return 'Windows';
    }
    if (platform === 'darwin') {
      return 'macOS';
    }
    if (platform === 'linux') {
      return 'Linux';
    }
  }

  return 'Windows';
}

async function getAppVersion(): Promise<string> {
  try {
    return (await window.ngomongo?.app?.getVersion?.()) ?? '0.1.0';
  } catch {
    return '0.1.0';
  }
}

async function getDesktopDeviceName(): Promise<string> {
  try {
    return (await window.ngomongo?.app?.getDeviceName?.()) ?? 'NGOMONGO Desktop';
  } catch {
    return 'NGOMONGO Desktop';
  }
}

export function createDesktopRegistrationPayload(): Promise<DesktopDeviceRegistrationPayload> {
  return Promise.all([getDesktopDeviceName(), getAppVersion()]).then(([deviceName, appVersion]) => ({
    device_id: getOrCreateDesktopDeviceId(),
    device_name: deviceName,
    os: getOsName(),
    app_version: appVersion,
  }));
}

export async function registerDesktopDevice(token: string): Promise<DesktopDeviceRecord> {
  const payload = await createDesktopRegistrationPayload();
  return requestJson<DesktopDeviceRecord>('/desktop/register-device', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function getDesktopSettings(token: string): Promise<DesktopDeviceSettings> {
  return requestJson<DesktopDeviceSettings>('/desktop/settings', {
    method: 'GET',
    token,
  });
}

export async function updateDesktopSettings(token: string, payload: DesktopDeviceSettingsPayload): Promise<DesktopDeviceSettings> {
  return requestJson<DesktopDeviceSettings>('/desktop/settings', {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function bootstrapDesktopSession(token: string): Promise<DesktopDeviceSettings | null> {
  await registerDesktopDevice(token);

  try {
    const settings = await getDesktopSettings(token);
    mergeBackendSettingsIntoLocalSettings(settings);
    return settings;
  } catch {
    return null;
  }
}

export function mergeBackendSettingsIntoLocalSettings(
  backendSettings: DesktopDeviceSettings,
  fallbackSettings: LocalSettings = loadLocalSettings(),
): LocalSettings {
  return saveLocalSettings({
    ...fallbackSettings,
    selected_input_device_name: backendSettings.input_device_name ?? fallbackSettings.selected_input_device_name ?? '',
    selected_output_device_name: backendSettings.output_device_name ?? fallbackSettings.selected_output_device_name ?? '',
    source_language: (backendSettings.source_language || fallbackSettings.source_language) as LocalSettings['source_language'],
    target_language: (backendSettings.target_language || fallbackSettings.target_language) as LocalSettings['target_language'],
    translation_mode: (backendSettings.translation_mode || fallbackSettings.translation_mode) as LocalSettings['translation_mode'],
    noise_suppression_enabled: backendSettings.noise_suppression_enabled ?? fallbackSettings.noise_suppression_enabled,
    echo_cancellation_enabled: backendSettings.echo_cancellation_enabled ?? fallbackSettings.echo_cancellation_enabled,
    auto_start_enabled: backendSettings.auto_start_enabled ?? fallbackSettings.auto_start_enabled,
    push_to_talk_enabled: backendSettings.push_to_talk_enabled ?? fallbackSettings.push_to_talk_enabled,
  });
}

export function buildBackendSettingsPayload(settings: LocalSettings, inputDeviceName: string, outputDeviceName: string): DesktopDeviceSettingsPayload {
  return {
    input_device_name: inputDeviceName || settings.selected_input_device_name || null,
    output_device_name: outputDeviceName || settings.selected_output_device_name || null,
    source_language: settings.source_language,
    target_language: settings.target_language,
    translation_mode: settings.translation_mode,
    noise_suppression_enabled: settings.noise_suppression_enabled,
    echo_cancellation_enabled: settings.echo_cancellation_enabled,
    auto_start_enabled: settings.auto_start_enabled,
    push_to_talk_enabled: settings.push_to_talk_enabled,
  };
}

export type DesktopDeviceRegistrationPayload = {
  device_id: string;
  device_name: string;
  os: string;
  app_version: string;
};

export type DesktopDeviceRecord = {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  os: string;
  app_version: string;
};

export type DesktopDeviceSettings = {
  id: string;
  device_id: string;
  input_device_name: string | null;
  output_device_name: string | null;
  source_language: string;
  target_language: string;
  translation_mode: string;
  noise_suppression_enabled: boolean;
  echo_cancellation_enabled: boolean;
  auto_start_enabled: boolean;
  push_to_talk_enabled: boolean;
};

export type DesktopDeviceSettingsPayload = Partial<{
  input_device_name: string | null;
  output_device_name: string | null;
  source_language: string;
  target_language: string;
  translation_mode: string;
  noise_suppression_enabled: boolean;
  echo_cancellation_enabled: boolean;
  auto_start_enabled: boolean;
  push_to_talk_enabled: boolean;
}>;

import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MicSelector } from '@/components/audio/MicSelector';
import { OutputDeviceSelector } from '@/components/audio/OutputDeviceSelector';
import { DeviceStatus } from '@/components/audio/DeviceStatus';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { useLocalSettings } from '@/hooks/useLocalSettings';
import { useAuth } from '@/stores/authStore';
import { buildBackendSettingsPayload, getDesktopSettings, updateDesktopSettings } from '@/services/desktop.service';
import type { LocalSettings } from '@/types/settings';

export function DeviceSetupPage() {
  const auth = useAuth();
  const { settings, saveSettings } = useLocalSettings();
  const audioDevices = useAudioDevices();
  const [form, setForm] = useState<LocalSettings>(settings);
  const [statusMessage, setStatusMessage] = useState('Siap menyimpan setting lokal.');
  const syncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token || syncedTokenRef.current === auth.token) {
      return;
    }

    syncedTokenRef.current = auth.token;
    let cancelled = false;

    const syncRemoteSettings = async () => {
      try {
        const remoteSettings = await getDesktopSettings(auth.token as string);
        if (cancelled) {
          return;
        }

        const nextSettings: LocalSettings = {
          ...settings,
          selected_input_device_name: remoteSettings.input_device_name ?? settings.selected_input_device_name,
          selected_output_device_name: remoteSettings.output_device_name ?? settings.selected_output_device_name,
          source_language: (remoteSettings.source_language || settings.source_language) as LocalSettings['source_language'],
          target_language: (remoteSettings.target_language || settings.target_language) as LocalSettings['target_language'],
          translation_mode: (remoteSettings.translation_mode || settings.translation_mode) as LocalSettings['translation_mode'],
          noise_suppression_enabled: remoteSettings.noise_suppression_enabled ?? settings.noise_suppression_enabled,
          echo_cancellation_enabled: remoteSettings.echo_cancellation_enabled ?? settings.echo_cancellation_enabled,
          auto_start_enabled: remoteSettings.auto_start_enabled ?? settings.auto_start_enabled,
          push_to_talk_enabled: remoteSettings.push_to_talk_enabled ?? settings.push_to_talk_enabled,
        };

        saveSettings(nextSettings);
        setForm(nextSettings);
        setStatusMessage('Setting backend berhasil disinkronkan.');
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(error instanceof Error ? error.message : 'Gagal memuat setting backend.');
        }
      }
    };

    void syncRemoteSettings();

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.token, saveSettings, settings]);

  const resolveMicName = (deviceId: string) => audioDevices.microphones.find((device) => device.deviceId === deviceId)?.label ?? deviceId;
  const resolveOutputName = (deviceId: string) => audioDevices.outputDevices.find((device) => device.deviceId === deviceId)?.label ?? deviceId;

  useEffect(() => {
    if (!form.selected_input_device_id && form.selected_input_device_name) {
      const matched = audioDevices.microphones.find((device) => device.label === form.selected_input_device_name);
      if (matched) {
        setForm((current) => ({ ...current, selected_input_device_id: matched.deviceId }));
      }
    }
  }, [audioDevices.microphones, form.selected_input_device_id, form.selected_input_device_name]);

  useEffect(() => {
    if (!form.selected_output_device_id && form.selected_output_device_name) {
      const matched = audioDevices.outputDevices.find((device) => device.label === form.selected_output_device_name);
      if (matched) {
        setForm((current) => ({ ...current, selected_output_device_id: matched.deviceId }));
      }
    }
  }, [audioDevices.outputDevices, form.selected_output_device_id, form.selected_output_device_name]);

  const currentSelectionSummary = useMemo(() => ({
    inputName: form.selected_input_device_name || resolveMicName(form.selected_input_device_id) || 'Belum dipilih',
    outputName: form.selected_output_device_name || resolveOutputName(form.selected_output_device_id) || 'Belum dipilih',
  }), [form.selected_input_device_id, form.selected_output_device_id, form.selected_input_device_name, form.selected_output_device_name, audioDevices.microphones, audioDevices.outputDevices]);

  const handleSave = () => {
    const nextSettings = {
      ...form,
      selected_input_device_name: resolveMicName(form.selected_input_device_id) || form.selected_input_device_name,
      selected_output_device_name: resolveOutputName(form.selected_output_device_id) || form.selected_output_device_name,
    };

    saveSettings(nextSettings);

    if (auth.isAuthenticated && auth.token) {
      void updateDesktopSettings(
        auth.token,
        buildBackendSettingsPayload(
          nextSettings,
          nextSettings.selected_input_device_name,
          nextSettings.selected_output_device_name,
        ),
      )
        .then(() => setStatusMessage('Setting berhasil disimpan ke localStorage dan backend.'))
        .catch((error) => setStatusMessage(error instanceof Error ? error.message : 'Gagal menyimpan setting ke backend.'));
      return;
    }

    setStatusMessage('Setting berhasil disimpan ke localStorage.');
  };

  return (
    <div className="page-grid page-grid--twoColumn">
      <Card
        title="Audio device setup"
        description="Pilih input microphone dan output device untuk fondasi desktop."
      >
        <div className="stack">
          <DeviceStatus
            microphonesCount={audioDevices.microphones.length}
            outputDevicesCount={audioDevices.outputDevices.length}
            permissionGranted={audioDevices.permissionGranted}
            supportsOutputSelection={audioDevices.supportsOutputSelection}
          />

          <MicSelector
            value={form.selected_input_device_id}
            devices={audioDevices.microphones}
            onChange={(deviceId) => setForm((current) => ({ ...current, selected_input_device_id: deviceId, selected_input_device_name: resolveMicName(deviceId) }))}
            disabled={audioDevices.isLoading}
            statusText={audioDevices.isLoading ? 'Mencari microphone...' : 'Mic akan dipakai untuk pipeline berikutnya.'}
          />

          <OutputDeviceSelector
            value={form.selected_output_device_id}
            devices={audioDevices.outputDevices}
            onChange={(deviceId) => setForm((current) => ({ ...current, selected_output_device_id: deviceId, selected_output_device_name: resolveOutputName(deviceId) }))}
            disabled={audioDevices.isLoading}
            supportsOutputSelection={audioDevices.supportsOutputSelection}
          />

          <div className="control-row">
            <Button
              variant="secondary"
              onClick={() => setStatusMessage('Test Mic placeholder: belum ada audio test pipeline.')}
            >
              Test Mic
            </Button>
            <Button
              variant="secondary"
              onClick={() => setStatusMessage('Test Output placeholder: belum ada audio routing.')}
            >
              Test Output
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>

          <p className="text-muted">{statusMessage}</p>

          {audioDevices.error ? <p className="text-danger">{audioDevices.error}</p> : null}
        </div>
      </Card>

      <Card
        title="Current selection"
        description="Ringkasan setting lokal yang tersimpan."
      >
        <div className="stack">
          <div className="summary-row">
            <span className="summary-row__label">Input device</span>
            <strong className="summary-row__value">{currentSelectionSummary.inputName}</strong>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Output device</span>
            <strong className="summary-row__value">{currentSelectionSummary.outputName}</strong>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Permission</span>
            <strong className="summary-row__value">{audioDevices.permissionGranted ? 'Granted' : 'Pending'}</strong>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Output selection</span>
            <strong className="summary-row__value">{audioDevices.supportsOutputSelection ? 'Available' : 'Limited'}</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useLocalSettings } from '@/hooks/useLocalSettings';

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useLocalSettings();

  return (
    <div className="page-grid page-grid--twoColumn">
      <Card
        title="App settings"
        description="Preferensi dasar aplikasi desktop."
      >
        <div className="stack">
          <label className="toggle-row">
            <span>
              <strong>Noise suppression</strong>
              <small>Placeholder untuk pengurangan noise pada fase berikutnya.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.noise_suppression_enabled}
              onChange={(event) => updateSettings({ noise_suppression_enabled: event.target.checked })}
            />
          </label>

          <label className="toggle-row">
            <span>
              <strong>Echo cancellation</strong>
              <small>Placeholder untuk pengendalian feedback audio.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.echo_cancellation_enabled}
              onChange={(event) => updateSettings({ echo_cancellation_enabled: event.target.checked })}
            />
          </label>

          <label className="toggle-row">
            <span>
              <strong>Push to talk</strong>
              <small>Mode bicara manual untuk sesi realtime berikutnya.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.push_to_talk_enabled}
              onChange={(event) => updateSettings({ push_to_talk_enabled: event.target.checked })}
            />
          </label>

          <label className="toggle-row">
            <span>
              <strong>Auto start</strong>
              <small>Menentukan apakah aplikasi siap otomatis saat dibuka.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.auto_start_enabled}
              onChange={(event) => updateSettings({ auto_start_enabled: event.target.checked })}
            />
          </label>

          <div className="control-row">
            <Button
              variant="secondary"
              onClick={resetSettings}
            >
              Reset to default
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title="Current config"
        description="Nilai yang tersimpan di localStorage."
      >
        <div className="stack">
          <div className="summary-row">
            <span className="summary-row__label">Source language</span>
            <strong className="summary-row__value">{settings.source_language}</strong>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Target language</span>
            <strong className="summary-row__value">{settings.target_language}</strong>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Translation mode</span>
            <strong className="summary-row__value">{settings.translation_mode}</strong>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Settings source</span>
            <strong className="summary-row__value">localStorage</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}

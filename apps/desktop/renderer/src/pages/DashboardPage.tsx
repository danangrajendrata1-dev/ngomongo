import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type DashboardPageProps = {
  onOpenVoiceTranslate: () => void;
};

export function DashboardPage({ onOpenVoiceTranslate }: DashboardPageProps) {
  return (
    <div className="page-grid">
      <Card
        title="Application status"
        description="Fondasi desktop NGOMONGO sudah berjalan secara lokal."
      >
        <div className="stack">
          <p className="text-body">Status aplikasi: <strong>Ready</strong></p>
          <p className="text-muted">Belum terhubung backend, AI, atau audio routing lanjutan.</p>
          <Button onClick={onOpenVoiceTranslate}>
            Buka Voice Translate
          </Button>
        </div>
      </Card>

      <Card
        title="Plan placeholder"
        description="Informasi paket nantinya akan diambil dari backend."
      >
        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-card__label">Plan</span>
            <strong className="metric-card__value">Development</strong>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Mode</span>
            <strong className="metric-card__value">Local only</strong>
          </div>
        </div>
      </Card>

      <Card
        title="Usage placeholder"
        description="Konsumsi dan history akan muncul setelah backend siap."
      >
        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-card__label">Session</span>
            <strong className="metric-card__value">0</strong>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Transcript</span>
            <strong className="metric-card__value">Empty</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}

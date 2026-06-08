import type { RealtimeConnectionState } from '@/types/translator';

type RealtimeStatusProps = {
  state: RealtimeConnectionState;
  message: string;
};

const STATUS_LABELS: Record<RealtimeConnectionState, { label: string; tone: 'success' | 'warning' | 'muted' | 'danger' }> = {
  idle: { label: 'Idle', tone: 'muted' },
  ready: { label: 'Ready', tone: 'success' },
  processing: { label: 'Processing', tone: 'warning' },
  paused: { label: 'Paused', tone: 'muted' },
  connecting: { label: 'Connecting', tone: 'warning' },
  error: { label: 'Error', tone: 'danger' },
};

export function RealtimeStatus({ state, message }: RealtimeStatusProps) {
  const status = STATUS_LABELS[state];

  return (
    <div className="status-card">
      <div>
        <p className="status-card__label">Realtime status</p>
        <strong className="status-card__value">{status.label}</strong>
      </div>
      <span className={`status-pill status-pill--${status.tone}`}>{message}</span>
    </div>
  );
}

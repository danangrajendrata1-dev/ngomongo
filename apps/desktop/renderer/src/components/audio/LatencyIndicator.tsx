type LatencyIndicatorProps = {
  latencyMs?: number | null;
  description?: string;
};

export function LatencyIndicator({ latencyMs = null, description = 'Estimated processing latency' }: LatencyIndicatorProps) {
  return (
    <div className="status-card">
      <div>
        <p className="status-card__label">{description}</p>
        <strong className="status-card__value">{latencyMs === null ? '-- ms' : `${latencyMs} ms`}</strong>
      </div>
      <span className="status-pill status-pill--warning">Placeholder</span>
    </div>
  );
}

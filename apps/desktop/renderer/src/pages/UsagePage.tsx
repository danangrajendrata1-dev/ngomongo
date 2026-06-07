import { Card } from '@/components/ui/Card';

export function UsagePage() {
  return (
    <div className="page-grid page-grid--twoColumn">
      <Card
        title="Usage summary"
        description="Ringkasan pemakaian akan datang dari backend."
      >
        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-card__label">Minutes used</span>
            <strong className="metric-card__value">0</strong>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Estimated cost</span>
            <strong className="metric-card__value">-</strong>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Plan</span>
            <strong className="metric-card__value">Development</strong>
          </div>
        </div>
      </Card>

      <Card
        title="Plan placeholder"
        description="Halaman ini masih belum menghitung usage sungguhan."
      >
        <p className="text-body">Nantinya halaman ini akan menampilkan usage bulanan, quota, dan billing summary.</p>
      </Card>
    </div>
  );
}

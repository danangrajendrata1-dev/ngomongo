import { Card } from '@/components/ui/Card';

const MOCK_HISTORY = [
  {
    title: 'Session 01',
    text: 'Transcript history placeholder akan tampil setelah backend dan storage history siap.',
  },
  {
    title: 'Session 02',
    text: 'Belum ada data riwayat yang tersimpan di desktop foundation.',
  },
];

export function HistoryPage() {
  return (
    <div className="page-grid">
      {MOCK_HISTORY.map((item) => (
        <Card
          key={item.title}
          title={item.title}
          description="Placeholder transcript entry"
        >
          <p className="text-body">{item.text}</p>
        </Card>
      ))}
    </div>
  );
}

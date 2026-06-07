import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function VoiceProfilePage() {
  return (
    <div className="page-grid">
      <Card
        title="Voice profile foundation"
        description="Fitur voice profile masih placeholder dan belum menghubungkan provider."
      >
        <div className="stack">
          <p className="text-body">Consent recording akan ditambahkan pada fase berikutnya.</p>
          <div className="control-row">
            <Button variant="secondary">Record sample</Button>
            <Button variant="secondary">Add consent</Button>
            <Button variant="secondary">Preview profile</Button>
          </div>
          <p className="text-muted">Saat ini belum ada upload, cloning, atau penyimpanan voice profile.</p>
        </div>
      </Card>
    </div>
  );
}

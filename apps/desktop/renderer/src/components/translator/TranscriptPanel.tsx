import { Card } from '@/components/ui/Card';

type TranscriptPanelProps = {
  label: string;
  text: string;
};

export function TranscriptPanel({ label, text }: TranscriptPanelProps) {
  return (
    <Card title={label}>
      <pre className="transcript-box">{text}</pre>
    </Card>
  );
}

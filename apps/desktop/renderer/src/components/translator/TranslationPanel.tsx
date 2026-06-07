import { Card } from '@/components/ui/Card';

type TranslationPanelProps = {
  label: string;
  text: string;
};

export function TranslationPanel({ label, text }: TranslationPanelProps) {
  return (
    <Card title={label}>
      <pre className="transcript-box transcript-box--accent">{text}</pre>
    </Card>
  );
}

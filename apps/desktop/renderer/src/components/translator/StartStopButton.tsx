import { Button } from '@/components/ui/Button';

type StartStopButtonProps = {
  isRunning: boolean;
  onToggle: () => void;
};

export function StartStopButton({ isRunning, onToggle }: StartStopButtonProps) {
  return (
    <Button
      variant={isRunning ? 'secondary' : 'primary'}
      onClick={onToggle}
    >
      {isRunning ? 'Stop' : 'Start'}
    </Button>
  );
}

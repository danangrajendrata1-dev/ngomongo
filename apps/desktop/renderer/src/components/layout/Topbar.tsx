import { Button } from '@/components/ui/Button';
import { APP_NAME } from '@/lib/constants';

type TopbarProps = {
  title: string;
  description: string;
  statusLabel?: string;
  userName?: string;
  onLogout?: () => void;
};

export function Topbar({ title, description, statusLabel = 'Local foundation', userName, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="topbar__eyebrow">{APP_NAME}</p>
        <h2 className="topbar__title">{title}</h2>
        <p className="topbar__description">{description}</p>
      </div>

      <div className="topbar__status">
        {userName ? <span className="topbar__user">{userName}</span> : null}
        <span className="status-pill status-pill--success">{statusLabel}</span>
        {onLogout ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onLogout}
          >
            Logout
          </Button>
        ) : null}
      </div>
    </header>
  );
}

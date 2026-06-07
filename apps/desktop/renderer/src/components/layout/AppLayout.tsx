import type { ReactNode } from 'react';

import type { AppPageId } from '@/lib/constants';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

type AppLayoutProps = {
  activePage: AppPageId;
  onNavigate: (page: AppPageId) => void;
  title: string;
  description: string;
  statusLabel?: string;
  userName?: string;
  onLogout?: () => void;
  children: ReactNode;
};

export function AppLayout({ activePage, onNavigate, title, description, statusLabel, userName, onLogout, children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
      />

      <main className="app-shell__content">
        <Topbar
          title={title}
          description={description}
          statusLabel={statusLabel}
          userName={userName}
          onLogout={onLogout}
        />

        <div className="page-stack">{children}</div>
      </main>
    </div>
  );
}

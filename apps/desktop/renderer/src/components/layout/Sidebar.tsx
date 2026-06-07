import type { AppPageId } from '@/lib/constants';
import { APP_NAME, NAV_ITEMS } from '@/lib/constants';

type SidebarProps = {
  activePage: AppPageId;
  onNavigate: (page: AppPageId) => void;
};

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__mark">N</div>
        <div>
          <p className="sidebar__eyebrow">Desktop foundation</p>
          <h1 className="sidebar__title">{APP_NAME}</h1>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar__link ${activePage === item.id ? 'sidebar__link--active' : ''}`.trim()}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar__linkTitle">{item.label}</span>
            <span className="sidebar__linkDescription">{item.description}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

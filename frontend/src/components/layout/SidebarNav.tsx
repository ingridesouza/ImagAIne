import { NavLink as RouterNavLink } from 'react-router-dom';
import { Search } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import type { NavLink as NavItem } from '@/lib/constants';

const SECTION_LABELS: Record<NavItem['section'], string> = {
  discover: 'Descobrir',
  library: 'Biblioteca',
};

const sections = NAV_LINKS.reduce<Record<NavItem['section'], NavItem[]>>(
  (acc, link) => {
    acc[link.section].push(link);
    return acc;
  },
  { discover: [], library: [] },
);

const focusGlobalSearch = () => {
  const input = document.getElementById('global-search-input') as HTMLInputElement | null;
  input?.focus();
};

type SidebarNavProps = {
  onNavigate?: () => void;
};

export const SidebarNav = ({ onNavigate }: SidebarNavProps) => {
  const handleGlobalSearch = () => {
    focusGlobalSearch();
    onNavigate?.();
  };

  const handleNavigate = () => {
    onNavigate?.();
  };

  return (
    <nav className="sidebar-nav">
      <button type="button" className="sidebar-nav__search" onClick={handleGlobalSearch}>
        <Search size={16} />
        <span>Buscar</span>
        <kbd>Ctrl K</kbd>
      </button>

      {(Object.keys(sections) as (keyof typeof sections)[]).map((sectionKey) => (
        <div key={sectionKey} className="sidebar-nav__section">
          <p className="sidebar-nav__section-label">{SECTION_LABELS[sectionKey]}</p>
          {sections[sectionKey].map(({ label, path, icon: Icon }) => (
            <RouterNavLink
              key={path}
              to={path}
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
              onClick={handleNavigate}
            >
              <Icon size={18} />
              <span>{label}</span>
            </RouterNavLink>
          ))}
        </div>
      ))}
    </nav>
  );
};

import clsx from 'clsx';
import { NavLink as RouterNavLink } from 'react-router-dom';
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

const MATERIAL_ICON_NAMES: Record<string, string> = {
  '/': 'explore',
  '/dashboard': 'dashboard',
  '/wizard': 'auto_fix_high',
  '/generate': 'add_circle',
  '/my-images': 'collections',
  '/public': 'travel_explore',
  '/chat': 'chat',
  '/characters': 'group',
  '/projects': 'folder_open',
  '/profile': 'person',
  '/settings': 'settings',
};

const getIconName = (path: string) => MATERIAL_ICON_NAMES[path] ?? 'image';

type SidebarNavProps = {
  onNavigate?: () => void;
  collapsed?: boolean;
};

export const SidebarNav = ({ onNavigate, collapsed = false }: SidebarNavProps) => (
  <nav className="flex flex-col gap-6">
    {(Object.keys(sections) as (keyof typeof sections)[]).map((sectionKey) => (
      <div key={sectionKey} className="flex flex-col gap-1">
        {!collapsed && (
          <p className="mb-1 px-3 text-xs font-medium uppercase tracking-widest text-fg-muted">
            {SECTION_LABELS[sectionKey]}
          </p>
        )}
        <div className="flex flex-col gap-0.5">
          {sections[sectionKey].map(({ label, path }) => (
            <RouterNavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center rounded-lg transition-colors duration-fast',
                  collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-fg-muted hover:bg-inset hover:text-fg-sec',
                )
              }
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={clsx(
                      'material-symbols-outlined text-xl transition-colors',
                      isActive && 'text-accent',
                    )}
                    style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                    aria-hidden
                  >
                    {getIconName(path)}
                  </span>
                  {!collapsed && (
                    <span className="text-sm font-medium">{label}</span>
                  )}
                </>
              )}
            </RouterNavLink>
          ))}
        </div>
      </div>
    ))}
  </nav>
);

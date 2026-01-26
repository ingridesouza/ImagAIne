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
  '/': 'home',
  '/dashboard': 'dashboard',
  '/generate': 'add_circle',
  '/my-images': 'collections',
  '/public': 'travel_explore',
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
        {!collapsed ? (
          <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-slate-600">
            {SECTION_LABELS[sectionKey]}
          </p>
        ) : null}
        <div className="flex flex-col">
          {sections[sectionKey].map(({ label, path }) => (
            <RouterNavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center rounded-lg transition-all duration-150',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-200',
                )
              }
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={clsx(
                      'material-symbols-outlined !text-[20px] transition-colors',
                      isActive && 'text-primary'
                    )}
                    style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                    aria-hidden
                  >
                    {getIconName(path)}
                  </span>
                  {!collapsed ? (
                    <span className="text-[13px] font-medium">{label}</span>
                  ) : null}
                </>
              )}
            </RouterNavLink>
          ))}
        </div>
      </div>
    ))}
  </nav>
);

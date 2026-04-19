import clsx from 'clsx';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { NAV_LINKS } from '@/lib/constants';
import type { NavLink as NavItem } from '@/lib/constants';

const sections = NAV_LINKS.reduce<Record<NavItem['section'], NavItem[]>>(
  (acc, link) => {
    acc[link.section].push(link);
    return acc;
  },
  { discover: [], library: [] },
);

const MATERIAL_ICON_NAMES: Record<string, string> = {
  '/': 'explore',
  '/dashboard': 'space_dashboard',
  '/wizard': 'auto_fix_high',
  '/generate': 'add_circle',
  '/my-images': 'photo_library',
  '/public': 'travel_explore',
  '/chat': 'psychology',
  '/characters': 'face',
  '/projects': 'folder_special',
  '/profile': 'account_circle',
  '/settings': 'tune',
};

const getIconName = (path: string) => MATERIAL_ICON_NAMES[path] ?? 'image';

type SidebarNavProps = {
  onNavigate?: () => void;
  collapsed?: boolean;
};

export const SidebarNav = ({ onNavigate, collapsed = false }: SidebarNavProps) => (
  <nav className="flex flex-col gap-1">
    {(Object.keys(sections) as (keyof typeof sections)[]).map((sectionKey, idx) => (
      <div key={sectionKey} className="flex flex-col">
        {idx > 0 && (
          <div className={clsx('my-3', collapsed ? 'mx-2' : 'mx-3')}>
            <div className="h-px bg-border" />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {sections[sectionKey].map(({ label, path }) => (
            <RouterNavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                clsx(
                  'group relative flex items-center transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
                  collapsed
                    ? 'justify-center mx-1 p-2.5 rounded-xl'
                    : 'gap-3 mx-2 px-3 py-2 rounded-xl',
                  isActive
                    ? 'bg-black/[0.06] dark:bg-white/[0.08] text-fg font-medium'
                    : 'text-fg-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-fg',
                )
              }
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-accent" />
                  )}
                  <span
                    className={clsx(
                      'material-symbols-outlined text-[20px] transition-colors',
                      isActive ? 'text-accent' : 'text-fg-muted group-hover:text-fg-sec',
                    )}
                    style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                    aria-hidden
                  >
                    {getIconName(path)}
                  </span>
                  {!collapsed && (
                    <span className="text-[13px]">{label}</span>
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

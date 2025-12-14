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
};

export const SidebarNav = ({ onNavigate }: SidebarNavProps) => (
  <nav className="flex flex-col gap-4">
    {(Object.keys(sections) as (keyof typeof sections)[]).map((sectionKey) => (
      <div key={sectionKey} className="flex flex-col gap-2">
        <p className="px-2 text-[11px] uppercase tracking-[0.2em] text-white/40">
          {SECTION_LABELS[sectionKey]}
        </p>
        <div className="flex flex-col gap-1">
          {sections[sectionKey].map(({ label, path }) => (
            <RouterNavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-4 rounded-xl border px-4 py-3 transition-all',
                  isActive
                    ? 'border-accent-purple/10 bg-accent-purple/20 text-accent-purple'
                    : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white',
                )
              }
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined !text-[22px]"
                    style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                    aria-hidden
                  >
                    {getIconName(path)}
                  </span>
                  <span className="text-sm font-semibold">{label}</span>
                </>
              )}
            </RouterNavLink>
          ))}
        </div>
      </div>
    ))}
  </nav>
);

import clsx from 'clsx';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { useState } from 'react';
import { NAV_LINKS } from '@/lib/constants';
import { useAuthStore } from '@/features/auth/store';
import { Sparkles } from 'lucide-react';

const MATERIAL_ICON_NAMES: Record<string, string> = {
  '/': 'explore',
  '/dashboard': 'space_dashboard',
  '/wizard': 'auto_fix_high',
  '/generate': 'add_circle',
  '/my-images': 'photo_library',
  '/chat': 'psychology',
  '/characters': 'face',
  '/projects': 'folder_special',
  '/profile': 'account_circle',
  '/settings': 'tune',
};

type AppSidebarProps = {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

export const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
  const user = useAuthStore((state) => state.user);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const generationCount = user?.image_generation_count ?? 0;
  const plan = user?.plan ?? 'free';
  const quota = plan === 'pro' ? 50 : 20;
  const percent = Math.min(100, (generationCount / quota) * 100);
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const discoverLinks = NAV_LINKS.filter((l) => l.section === 'discover');
  const libraryLinks = NAV_LINKS.filter((l) => l.section === 'library');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Dock */}
      <aside
        className={clsx(
          'fixed left-3 top-3 bottom-3 z-50 flex flex-col items-center',
          'w-[68px] rounded-[28px]',
          'bg-white/70 dark:bg-[#1c1c1e]/80',
          'backdrop-blur-2xl backdrop-saturate-[1.8]',
          'border border-white/30 dark:border-white/[0.08]',
          'shadow-xl shadow-black/[0.08] dark:shadow-black/40',
          'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-24 md:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center pt-5 pb-3">
          <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-flow-500 to-flow-700 shadow-lg shadow-flow-500/30 transition-transform duration-200 hover:scale-110 active:scale-95">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px w-8 bg-black/[0.08] dark:bg-white/[0.08]" />

        {/* Discover links */}
        <nav className="flex flex-1 flex-col items-center gap-1 py-3 overflow-y-auto no-scrollbar">
          {discoverLinks.map(({ label, path }) => (
            <DockItem
              key={path}
              path={path}
              label={label}
              iconName={MATERIAL_ICON_NAMES[path] || 'image'}
              isHovered={hoveredPath === path}
              onHover={() => setHoveredPath(path)}
              onLeave={() => setHoveredPath(null)}
              onClick={onClose}
            />
          ))}

          {/* Divider */}
          <div className="my-2 h-px w-8 bg-black/[0.08] dark:bg-white/[0.08]" />

          {libraryLinks.map(({ label, path }) => (
            <DockItem
              key={path}
              path={path}
              label={label}
              iconName={MATERIAL_ICON_NAMES[path] || 'image'}
              isHovered={hoveredPath === path}
              onHover={() => setHoveredPath(path)}
              onLeave={() => setHoveredPath(null)}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Credits circle */}
        <div className="pb-4 pt-2">
          <RouterNavLink
            to="/settings"
            className="group relative flex size-10 items-center justify-center"
            title={`${generationCount}/${quota} créditos`}
          >
            <svg className="size-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/[0.06] dark:text-white/[0.08]" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="text-accent transition-all duration-700"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <span className="absolute text-[8px] font-bold text-fg-sec">{generationCount}</span>
          </RouterNavLink>
        </div>
      </aside>
    </>
  );
};

/* ---- Dock Item with tooltip ---- */
function DockItem({
  path, label, iconName, isHovered, onHover, onLeave, onClick,
}: {
  path: string; label: string; iconName: string;
  isHovered: boolean; onHover: () => void; onLeave: () => void; onClick: () => void;
}) {
  return (
    <RouterNavLink
      to={path}
      className={({ isActive }) =>
        clsx(
          'group relative flex size-11 items-center justify-center rounded-2xl',
          'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isActive
            ? 'bg-accent/10 dark:bg-accent/15 text-accent shadow-sm'
            : 'text-fg-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-fg hover:scale-110',
        )
      }
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {({ isActive }) => (
        <>
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
          >
            {iconName}
          </span>

          {/* Active dot */}
          {isActive && (
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 size-[5px] rounded-full bg-accent" />
          )}

          {/* Tooltip */}
          {isHovered && (
            <div className="absolute left-full ml-3 z-50 pointer-events-none">
              <div className="whitespace-nowrap rounded-lg bg-[#1d1d1f] dark:bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-white dark:text-[#1d1d1f] shadow-lg">
                {label}
              </div>
            </div>
          )}
        </>
      )}
    </RouterNavLink>
  );
}

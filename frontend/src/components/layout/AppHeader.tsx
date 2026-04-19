import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { useThemeStore } from '@/hooks/useTheme';

type AppHeaderProps = {
  onOpenSidebar?: () => void;
  onToggleSidebarCollapse?: () => void;
  isSidebarCollapsed?: boolean;
};

export const AppHeader = ({ onOpenSidebar, onToggleSidebarCollapse, isSidebarCollapsed }: AppHeaderProps) => {
  const user = useAuthStore((state) => state.user);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <header className="sticky top-0 z-sticky bg-white/60 dark:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/20 dark:border-white/[0.06]">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl text-fg-muted transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-fg md:hidden"
            onClick={() => onOpenSidebar?.()}
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <button
            type="button"
            className="hidden size-9 items-center justify-center rounded-xl text-fg-muted transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-fg md:flex"
            onClick={() => onToggleSidebarCollapse?.()}
            aria-label={isSidebarCollapsed ? 'Expandir' : 'Recolher'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Search — expands on focus */}
        <div className={`relative transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${searchFocused ? 'flex-1 max-w-xl' : 'w-64'}`}>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-symbols-outlined text-[18px] text-fg-muted transition-colors">search</span>
          </div>
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Pesquisar..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchValue.trim()) {
                navigate(`/explore?search=${encodeURIComponent(searchValue.trim())}`);
                searchInputRef.current?.blur();
              }
            }}
            className="w-full rounded-xl bg-black/[0.04] dark:bg-white/[0.06] py-2 pl-10 pr-12 text-sm text-fg placeholder:text-fg-muted/60 transition-all duration-200 border border-transparent focus:border-accent/30 focus:bg-white dark:focus:bg-white/10 focus:shadow-md focus:outline-none"
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            <kbd className={`rounded-md bg-black/[0.06] dark:bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-fg-muted transition-opacity ${searchFocused ? 'opacity-0' : 'opacity-100'}`}>⌘K</kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl text-fg-muted transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-fg"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <Link
            to="/generate"
            className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-b from-accent to-flow-700 text-white shadow-sm shadow-accent/25 transition-all duration-200 hover:shadow-md hover:shadow-accent/30 hover:scale-105 active:scale-95"
            aria-label="Criar"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </Link>

          {user && (
            <Link
              to="/profile"
              className="ml-1 hidden size-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-flow-400 to-flow-600 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 sm:flex"
              aria-label="Perfil"
            >
              {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

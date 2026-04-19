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
    <header className="sticky top-0 z-sticky border-b border-border bg-backdrop backdrop-blur-xl backdrop-saturate-150">
      <div className="flex items-center justify-between gap-3 px-4 py-2 md:px-6">
        {/* Left */}
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-md text-fg-muted transition-colors duration-fast hover:bg-surface hover:text-fg md:hidden"
            onClick={() => onOpenSidebar?.()}
            aria-label="Abrir menu lateral"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
          <button
            type="button"
            className="hidden size-9 items-center justify-center rounded-md text-fg-muted transition-colors duration-fast hover:bg-surface hover:text-fg md:flex"
            onClick={() => onToggleSidebarCollapse?.()}
            aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Encolher menu lateral'}
          >
            <span className="material-symbols-outlined text-xl">
              {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-lg text-fg-muted transition-colors group-focus-within:text-accent">
                  search
                </span>
              </div>
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Pesquisar..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchValue.trim()) {
                    navigate(`/explore?search=${encodeURIComponent(searchValue.trim())}`);
                    searchInputRef.current?.blur();
                  }
                }}
                className="block w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-14 text-sm text-fg placeholder:text-fg-muted transition-all duration-normal focus:border-accent/40 focus:bg-elevated focus:outline-none focus:ring-1 focus:ring-accent/20"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <kbd className="hidden rounded-md bg-inset px-1.5 py-0.5 text-xs font-medium text-fg-muted sm:inline">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-md text-fg-muted transition-colors duration-fast hover:bg-surface hover:text-fg"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            <span className="material-symbols-outlined text-xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <Link
            to="/chat"
            className="hidden size-9 items-center justify-center rounded-md text-fg-muted transition-colors duration-fast hover:bg-surface hover:text-fg sm:flex"
            aria-label="Agente Criativo"
            title="Agente Criativo"
          >
            <span className="material-symbols-outlined text-xl">chat</span>
          </Link>
          <Link
            to="/generate"
            className="flex size-9 items-center justify-center rounded-lg bg-accent text-fg-inv transition-all duration-fast hover:bg-accent-hover active:scale-95"
            aria-label="Criar nova imagem"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </Link>

          {user ? (
            <Link
              to="/settings"
              className="ml-1 hidden size-9 items-center justify-center overflow-hidden rounded-full bg-surface text-sm font-medium text-fg-sec transition-colors duration-fast hover:bg-inset sm:flex"
              aria-label="Configurações"
            >
              {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
};

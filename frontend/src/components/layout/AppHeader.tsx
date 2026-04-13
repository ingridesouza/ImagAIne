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
    <header className="sticky top-0 z-50 border-b border-border bg-body/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-2 md:px-6">
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface hover:text-fg md:hidden"
            onClick={() => onOpenSidebar?.()}
            aria-label="Abrir menu lateral"
          >
            <span className="material-symbols-outlined !text-[22px]">menu</span>
          </button>
          <button
            type="button"
            className="hidden size-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface hover:text-fg md:flex"
            onClick={() => onToggleSidebarCollapse?.()}
            aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Encolher menu lateral'}
          >
            <span className="material-symbols-outlined !text-[22px]">
              {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          <div className="flex-1 max-w-lg">
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined !text-[18px] text-fg-muted transition-colors group-focus-within:text-accent">
                  search
                </span>
              </div>
              <input
                ref={searchInputRef}
                id="global-search-input"
                data-global-search
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
                className="block w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-14 text-sm text-fg placeholder:text-fg-muted transition-all focus:border-accent/40 focus:bg-elevated focus:outline-none"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                <kbd className="hidden rounded-md bg-inset px-1.5 py-0.5 text-[10px] font-medium text-fg-muted sm:inline">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            <span className="material-symbols-outlined !text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            type="button"
            className="hidden size-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface hover:text-fg sm:flex"
            aria-label="Notificações"
          >
            <span className="material-symbols-outlined !text-[20px]">notifications</span>
          </button>
          <Link
            to="/generate"
            className="flex size-9 items-center justify-center rounded-lg bg-accent text-fg-inv transition-all hover:bg-accent-hover active:scale-95"
            aria-label="Criar nova imagem"
          >
            <span className="material-symbols-outlined !text-[20px]">add</span>
          </Link>
          {user ? (
            <Link
              to="/settings"
              className="ml-1 hidden size-9 items-center justify-center overflow-hidden rounded-full bg-surface text-sm font-medium text-fg-sec transition-all hover:bg-inset sm:flex"
              aria-label="Perfil"
            >
              {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
};

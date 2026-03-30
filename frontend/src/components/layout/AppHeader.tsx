import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

type AppHeaderProps = {
  onOpenSidebar?: () => void;
  onToggleSidebarCollapse?: () => void;
  isSidebarCollapsed?: boolean;
};

export const AppHeader = ({ onOpenSidebar, onToggleSidebarCollapse, isSidebarCollapsed }: AppHeaderProps) => {
  const user = useAuthStore((state) => state.user);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background-dark/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-2 md:px-6">
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
            onClick={() => onOpenSidebar?.()}
            aria-label="Abrir menu lateral"
          >
            <span className="material-symbols-outlined !text-[22px]">menu</span>
          </button>
          <button
            type="button"
            className="hidden size-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white md:flex"
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
                <span className="material-symbols-outlined !text-[18px] text-white/30 transition-colors group-focus-within:text-flow-300">
                  search
                </span>
              </div>
              <input
                ref={searchInputRef}
                id="global-search-input"
                data-global-search
                type="search"
                placeholder="Pesquisar..."
                className="block w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 pl-9 pr-14 text-sm text-white placeholder:text-white/30 transition-all focus:border-flow-300/40 focus:bg-white/[0.05] focus:outline-none"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                <kbd className="hidden rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/30 sm:inline">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="hidden size-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white sm:flex"
            aria-label="Notificações"
          >
            <span className="material-symbols-outlined !text-[20px]">notifications</span>
          </button>
          <Link
            to="/generate"
            className="flex size-9 items-center justify-center rounded-lg bg-flow-300 text-[#131316] transition-all hover:bg-flow-200 active:scale-95"
            aria-label="Criar nova imagem"
          >
            <span className="material-symbols-outlined !text-[20px]">add</span>
          </Link>
          {user ? (
            <Link
              to="/settings"
              className="ml-1 hidden size-9 items-center justify-center overflow-hidden rounded-full bg-white/[0.08] text-sm font-medium text-white/70 transition-all hover:bg-white/[0.12] sm:flex"
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

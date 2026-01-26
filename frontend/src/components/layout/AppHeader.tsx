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
    <header className="sticky top-0 z-30 bg-background-dark/60 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            className="flex size-10 items-center justify-center text-slate-400 transition-colors hover:text-white md:hidden"
            onClick={() => onOpenSidebar?.()}
            aria-label="Abrir menu lateral"
          >
            <span className="material-symbols-outlined !text-[22px]">menu</span>
          </button>
          <button
            type="button"
            className="hidden size-10 items-center justify-center text-slate-400 transition-colors hover:text-white md:flex"
            onClick={() => onToggleSidebarCollapse?.()}
            aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Encolher menu lateral'}
          >
            <span className="material-symbols-outlined !text-[22px]">
              {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          <div className="flex-1 max-w-xl">
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined !text-[20px] text-slate-500 transition-colors group-focus-within:text-accent-purple">
                  search
                </span>
              </div>
              <input
                ref={searchInputRef}
                id="global-search-input"
                data-global-search
                type="search"
                placeholder="Pesquisar..."
                className="block w-full rounded-xl bg-white/[0.03] py-2.5 pl-10 pr-16 text-sm text-white placeholder:text-slate-500 transition-all focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-accent-purple/50"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  className="flex size-8 items-center justify-center text-slate-500 transition-colors hover:text-white"
                  aria-label="Filtros"
                >
                  <span className="material-symbols-outlined !text-[18px]">tune</span>
                </button>
                <kbd className="hidden rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="hidden size-10 items-center justify-center text-slate-400 transition-colors hover:text-white sm:flex"
            aria-label="Notificações"
          >
            <span className="material-symbols-outlined !text-[22px]">notifications</span>
          </button>
          <Link
            to="/generate"
            className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40"
            aria-label="Criar nova imagem"
          >
            <span className="material-symbols-outlined !text-[22px]">add</span>
          </Link>
          {user ? (
            <Link
              to="/settings"
              className="ml-2 hidden size-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-semibold text-white transition-all hover:ring-2 hover:ring-accent-purple/50 sm:flex"
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

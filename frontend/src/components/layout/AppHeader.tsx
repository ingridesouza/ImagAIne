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
  const logout = useAuthStore((state) => state.logout);
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
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-10">
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            className="rounded-full bg-surface-dark p-2 text-white md:hidden"
            onClick={() => onOpenSidebar?.()}
            aria-label="Abrir menu lateral"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <button
            type="button"
            className="hidden items-center justify-center rounded-full bg-surface-dark p-2 text-white transition-colors hover:text-accent-purple md:flex"
            onClick={() => onToggleSidebarCollapse?.()}
            aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Encolher menu lateral'}
          >
            <span className="material-symbols-outlined">
              {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          <div className="flex-1">
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="material-symbols-outlined text-slate-500 transition-colors group-focus-within:text-accent-purple">
                  search
                </span>
              </div>
              <input
                ref={searchInputRef}
                id="global-search-input"
                data-global-search
                type="search"
                placeholder="Pesquise prompts, estilos ou criadores..."
                className="block w-full rounded-full border border-transparent bg-surface-dark py-3.5 pl-12 pr-20 text-sm text-white placeholder:text-slate-500 shadow-sm transition-all focus:border-accent-purple focus:ring-0"
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full bg-white/5 p-1.5 text-slate-400 transition-colors hover:bg-white/10"
                  aria-label="Abrir filtros rápidos"
                >
                  <span className="material-symbols-outlined !text-[20px]">tune</span>
                </button>
                <span className="hidden rounded-full bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:inline-flex">
                  Ctrl K
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden size-11 items-center justify-center rounded-full bg-surface-dark text-white transition-colors hover:text-accent-purple sm:flex"
            aria-label="Ver notificações"
          >
            <span className="material-symbols-outlined !text-[22px]">notifications</span>
          </button>
          <Link
            to="/generate"
            className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-emerald-400 text-background-dark shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/40"
            aria-label="Criar nova imagem"
          >
            <span className="material-symbols-outlined !text-[24px]">add</span>
          </Link>
          {user ? (
            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Olá</span>
              <span className="text-sm font-semibold text-white">{user.first_name || user.username}</span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-white/30 hover:text-white"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

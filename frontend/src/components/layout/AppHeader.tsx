import { useEffect, useRef } from 'react';
import { Bell, Menu, Search, SlidersHorizontal } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type AppHeaderProps = {
  onOpenSidebar?: () => void;
};

export const AppHeader = ({ onOpenSidebar }: AppHeaderProps) => {
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
    <header className="app-header">
      <div className="app-header__primary">
        <button
          type="button"
          className="app-header__mobile-toggle"
          onClick={() => onOpenSidebar?.()}
          aria-label="Abrir menu lateral"
        >
          <Menu size={18} />
        </button>
        <div className="app-header__search">
          <Search size={16} aria-hidden />
          <input
            ref={searchInputRef}
            id="global-search-input"
            data-global-search
            type="search"
            placeholder="Buscar na galeria"
            aria-label="Buscar na galeria"
          />
          <span className="app-header__shortcut">Ctrl K</span>
        </div>
      </div>

      <div className="app-header__actions">
        <div className="app-header__icon-buttons">
          <button type="button" className="app-header__icon-button" aria-label="Abrir filtros">
            <SlidersHorizontal size={18} />
          </button>
          <button type="button" className="app-header__icon-button" aria-label="Ver notificações">
            <Bell size={18} />
          </button>
        </div>
        {user ? (
          <div className="app-header__identity">
            <strong>{user.first_name || user.username}</strong>
            <span>{user.email}</span>
            <Badge variant={user.is_verified ? 'success' : 'warning'}>
              {user.is_verified ? 'Verificado' : 'Pendente'}
            </Badge>
          </div>
        ) : null}
        <Button type="button" variant="ghost" onClick={logout}>
          Sair
        </Button>
      </div>
    </header>
  );
};

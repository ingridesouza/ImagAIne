import { useAuthStore } from '@/features/auth/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const AppHeader = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="app-header">
      <div className="app-header__intro">
        <p className="app-header__eyebrow">Modo Explore</p>
        <h2>Galeria pública ImagAIne</h2>
        <p>Surfe por moodboards quentes, favoritos da comunidade e streams inspirados no Midjourney/Sora.</p>
      </div>

      <div className="app-header__user">
        {user ? (
          <>
            <div className="app-header__identity">
              <strong>{user.first_name || user.username}</strong>
              <small>{user.email}</small>
            </div>
            <Badge variant={user.is_verified ? 'success' : 'warning'}>
              {user.is_verified ? 'Verificado' : 'Pendente'}
            </Badge>
          </>
        ) : null}
        <Button type="button" variant="secondary" onClick={logout}>
          Sair
        </Button>
      </div>
    </header>
  );
};

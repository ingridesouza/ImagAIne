import { useAuthStore } from '@/features/auth/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const AppHeader = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="app-header">
      <div>
        <h2 style={{ margin: 0, fontSize: '1.35rem' }}>ImagAIne Studio</h2>
        <p style={{ margin: 0, color: '#64748b' }}>Experimente, publique e compartilhe imagens geradas.</p>
      </div>

      <div className="app-header__user">
        {user ? (
          <>
            <div>
              <strong style={{ display: 'block' }}>{user.first_name || user.username}</strong>
              <small style={{ color: '#64748b' }}>{user.email}</small>
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

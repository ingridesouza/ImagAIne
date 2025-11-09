import { useAuthStore } from '@/features/auth/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return null;
  }

  return (
    <section className="grid" style={{ gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0 }}>Configurações</h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            Ajuste dados básicos da conta e ações rápidas de manutenção.
          </p>
        </div>
      </div>

      <Card>
        <h3 style={{ marginTop: 0 }}>Perfil</h3>
        <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '0.5rem' }}>
          <dt>Nome</dt>
          <dd>{`${user.first_name} ${user.last_name}`}</dd>
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
          <dt>Usuário</dt>
          <dd>{user.username}</dd>
          <dt>Status</dt>
          <dd>{user.is_verified ? 'Verificado' : 'Pendente'}</dd>
        </dl>
        {!user.is_verified ? (
          <p style={{ color: '#b45309' }}>
            Confirme seu e-mail usando o link enviado durante o cadastro para liberar o acesso completo.
          </p>
        ) : null}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Sessão</h3>
        <p style={{ color: '#64748b' }}>Encerre sessões em outros dispositivos ou refaça login com segurança.</p>
        <Button type="button" variant="danger" onClick={logout}>
          Encerrar sessão
        </Button>
      </Card>
    </section>
  );
};

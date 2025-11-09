import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <section className="auth-layout">
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ color: '#475569' }}>Página não encontrada.</p>
      <Link to="/" className="button button--primary">
        Voltar ao painel
      </Link>
    </div>
  </section>
);

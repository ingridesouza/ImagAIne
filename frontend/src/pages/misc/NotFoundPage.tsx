import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <section className="auth-layout auth-theme">
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ color: 'var(--auth-muted)', marginBottom: '1rem' }}>Página não encontrada.</p>
      <Link to="/" className="auth-back" style={{ justifyContent: 'center' }}>
        <span className="material-symbols-outlined" aria-hidden>
          arrow_back
        </span>
        <span className="auth-back__label">Voltar ao painel</span>
      </Link>
    </div>
  </section>
);

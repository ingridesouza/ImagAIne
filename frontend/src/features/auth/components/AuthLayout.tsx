import type { ReactNode } from 'react';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
  <section className="auth-layout">
    <div className="auth-card">
      <header style={{ marginBottom: '1.5rem' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
          ImagAIne
        </p>
        <h2 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.5rem' }}>{title}</h2>
        {subtitle ? <p style={{ margin: 0, color: '#475569' }}>{subtitle}</p> : null}
      </header>
      {children}
      {footer ? <footer style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}>{footer}</footer> : null}
    </div>
  </section>
);

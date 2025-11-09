import { Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { AppHeader } from '@/components/layout/AppHeader';

export const AppLayout = () => (
  <div className="app-shell">
    <aside className="app-shell__sidebar">
      <div className="app-shell__branding">
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c7d2fe', margin: 0 }}>
          ImagAIne
        </p>
        <h1>Studio</h1>
        <small style={{ color: '#cbd5f5' }}>Crie com IA</small>
      </div>
      <SidebarNav />
    </aside>
    <div className="app-shell__content">
      <AppHeader />
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  </div>
);

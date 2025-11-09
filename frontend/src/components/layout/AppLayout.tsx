import { Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { AppHeader } from '@/components/layout/AppHeader';

export const AppLayout = () => (
  <div className="app-shell">
    <aside className="app-shell__sidebar">
      <div className="app-shell__branding">
        <span className="app-shell__badge">IMAGAIne</span>
        <h1>Mood Atlas</h1>
        <p className="app-shell__tagline">
          Explore, catalogue e refine universos visuais em um painel inspirado no Midjourney.
        </p>
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

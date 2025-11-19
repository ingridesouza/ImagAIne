import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { AppHeader } from '@/components/layout/AppHeader';

export const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={clsx('app-shell', isSidebarOpen && 'app-shell--sidebar-open')}>
      <aside className="app-shell__sidebar" data-open={isSidebarOpen}>
        <button
          type="button"
          className="app-shell__sidebar-close"
          onClick={closeSidebar}
          aria-label="Fechar menu lateral"
        >
          <X size={18} />
        </button>
        <div className="app-shell__branding">
          <span className="app-shell__badge">IMAGAIne</span>
          <h1>Mood Atlas</h1>
          <p className="app-shell__tagline">
            Explore, catalogue e refine universos visuais em um painel inspirado no Midjourney.
          </p>
        </div>
        <SidebarNav onNavigate={closeSidebar} />
      </aside>

      {isSidebarOpen ? (
        <div
          className="app-shell__mobile-overlay"
          aria-hidden={!isSidebarOpen}
          onClick={closeSidebar}
          role="presentation"
        />
      ) : null}

      <div className="app-shell__content">
        <AppHeader onOpenSidebar={openSidebar} />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

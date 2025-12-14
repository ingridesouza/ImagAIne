import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';

export const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isSidebarCollapsed ? '5.5rem' : '18rem');
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
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

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark text-slate-200 font-display">
      <AppSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
          aria-hidden={!isSidebarOpen}
        />
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleSidebarCollapse={() => setSidebarCollapsed((prev) => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="app-shell__main flex-1 min-h-0 overflow-y-auto bg-background-light dark:bg-background-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

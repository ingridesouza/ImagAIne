import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { useThemeStore } from '@/hooks/useTheme';

export const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Subscribe so the store initializes and applies the class
  useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isSidebarCollapsed ? '4.5rem' : '15rem');
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
    <div id="app-layout" className="flex h-screen w-full overflow-hidden bg-body text-fg font-sans">
      <AppSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-overlay md:hidden"
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
        <main className="relative z-0 flex-1 min-h-0 overflow-y-auto bg-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

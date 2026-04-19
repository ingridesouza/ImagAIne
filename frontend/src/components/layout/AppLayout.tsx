import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { useThemeStore } from '@/hooks/useTheme';

export const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  useThemeStore((s) => s.theme);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  return (
    <div id="app-layout" className="flex h-screen w-full overflow-hidden bg-body text-fg font-sans">
      {/* Dock sidebar — fixed, floats over content */}
      <AppSidebar
        isOpen={isSidebarOpen}
        isCollapsed={false}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => {}}
      />

      {/* Main content — offset for dock */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:ml-[80px]">
        <AppHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleSidebarCollapse={() => {}}
          isSidebarCollapsed={false}
        />
        <main className="relative z-0 flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

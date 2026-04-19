import clsx from 'clsx';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { useAuthStore } from '@/features/auth/store';

type AppSidebarProps = {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

export const AppSidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }: AppSidebarProps) => {
  const user = useAuthStore((state) => state.user);

  const generationCount = user?.image_generation_count ?? 0;
  const plan = user?.plan ?? 'free';
  const quota = plan === 'pro' ? 50 : 20;
  const percent = Math.min(100, (generationCount / quota) * 100);

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-overlay bg-sidebar backdrop-blur-xl text-fg border-r border-border',
        'transition-all duration-normal ease-out',
        'md:static md:translate-x-0 md:flex md:flex-col',
        isCollapsed ? 'w-sidebar-collapsed px-2 py-5' : 'w-sidebar px-4 py-5',
        isOpen ? 'translate-x-0 flex' : '-translate-x-full',
      )}
      aria-label="Navegação principal"
    >
      {/* Close (mobile) */}
      <button
        type="button"
        className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-md text-fg-muted transition-colors duration-fast hover:bg-inset hover:text-fg md:hidden"
        onClick={onClose}
        aria-label="Fechar menu"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>

      <div className="flex h-full flex-col justify-between gap-4">
        {/* Logo + Nav */}
        <div className="flex flex-col gap-6">
          <div className={clsx('flex items-center', isCollapsed ? 'justify-center' : 'gap-3 px-2')}>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden size-9 items-center justify-center rounded-lg bg-accent transition-all duration-fast hover:bg-accent-hover active:scale-95 md:flex"
              aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              <span className="material-symbols-outlined text-xl text-fg-inv">auto_awesome</span>
            </button>
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent md:hidden">
              <span className="material-symbols-outlined text-xl text-fg-inv">auto_awesome</span>
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold tracking-tight text-fg">ImagAIne</span>
            )}
          </div>

          <SidebarNav onNavigate={onClose} collapsed={isCollapsed} />
        </div>

        {/* Credits */}
        {!isCollapsed ? (
          <div className="space-y-2 px-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-fg-muted">Créditos</span>
              <span className="font-medium text-fg-sec">
                {generationCount}<span className="text-fg-muted">/{quota}</span>
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-inset">
              <div className="h-full rounded-full bg-accent transition-all duration-slow" style={{ width: `${percent}%` }} />
            </div>
            <span className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-fg-muted">
              Plano {plan === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden items-center justify-center text-fg-muted transition-colors duration-fast hover:text-fg md:flex"
            aria-label="Expandir"
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        )}
      </div>
    </aside>
  );
};

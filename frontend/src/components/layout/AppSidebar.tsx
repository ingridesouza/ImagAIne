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
        'fixed inset-y-0 left-0 z-40 bg-background-dark/95 backdrop-blur-xl text-white transition-all duration-300 ease-out',
        isCollapsed ? 'w-[72px] px-3 py-4' : 'w-64 px-4 py-5',
        'md:static md:translate-x-0 md:flex md:flex-col',
        isOpen ? 'translate-x-0 flex shadow-2xl' : '-translate-x-full',
      )}
      aria-label="Navegação principal"
    >
      <button
        type="button"
        className="absolute right-3 top-3 flex size-8 items-center justify-center text-slate-500 transition-colors hover:text-white md:hidden"
        onClick={onClose}
        aria-label="Fechar menu"
      >
        <span className="material-symbols-outlined !text-[20px]">close</span>
      </button>

      <div className="flex h-full flex-col justify-between gap-8">
        <div className="flex flex-col gap-8">
          <div className={clsx('flex items-center', isCollapsed ? 'justify-center' : 'gap-3 px-1')}>
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600">
              <span className="material-symbols-outlined !text-[20px] text-white">auto_awesome</span>
            </div>
            {!isCollapsed ? (
              <span className="text-base font-semibold tracking-tight">ImagAIne</span>
            ) : null}
          </div>

          <SidebarNav onNavigate={onClose} collapsed={isCollapsed} />
        </div>

        {!isCollapsed ? (
          <div className="space-y-3 px-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Créditos</span>
              <span className="font-medium text-slate-300">
                {generationCount}<span className="text-slate-600">/{quota}</span>
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              <span className="material-symbols-outlined !text-[16px]">bolt</span>
              Upgrade
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden items-center justify-center text-slate-500 transition-colors hover:text-white md:flex"
            aria-label="Expandir"
          >
            <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
          </button>
        )}
      </div>
    </aside>
  );
};

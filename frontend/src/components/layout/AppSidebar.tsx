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
        'fixed inset-y-0 left-0 z-40 bg-surface-dark text-white transition-all duration-200 ease-out',
        isCollapsed ? 'w-[72px] px-2.5 py-5' : 'w-60 px-3.5 py-5',
        'md:static md:translate-x-0 md:flex md:flex-col',
        'border-r border-white/[0.06]',
        isOpen ? 'translate-x-0 flex' : '-translate-x-full',
      )}
      aria-label="Navegação principal"
    >
      <button
        type="button"
        className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
        onClick={onClose}
        aria-label="Fechar menu"
      >
        <span className="material-symbols-outlined !text-[20px]">close</span>
      </button>

      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex flex-col gap-5">
          <div className={clsx('flex items-center', isCollapsed ? 'justify-center' : 'gap-3 px-2')}>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden size-9 items-center justify-center rounded-lg bg-flow-300 transition-all duration-150 hover:bg-flow-200 active:scale-95 md:flex"
              aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              <span className="material-symbols-outlined !text-[20px] text-[#131316]">auto_awesome</span>
            </button>
            <div className="flex size-9 items-center justify-center rounded-lg bg-flow-300 md:hidden">
              <span className="material-symbols-outlined !text-[20px] text-[#131316]">auto_awesome</span>
            </div>
            {!isCollapsed ? (
              <span className="text-[15px] font-semibold tracking-tight text-white/90">ImagAIne</span>
            ) : null}
          </div>

          <SidebarNav onNavigate={onClose} collapsed={isCollapsed} />
        </div>

        {!isCollapsed ? (
          <div className="space-y-2.5 px-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Créditos</span>
              <span className="font-medium text-white/60">
                {generationCount}<span className="text-white/25">/{quota}</span>
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-flow-300 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70"
            >
              <span className="material-symbols-outlined !text-[14px]">bolt</span>
              Upgrade
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden items-center justify-center text-white/40 transition-colors hover:text-white md:flex"
            aria-label="Expandir"
          >
            <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
          </button>
        )}
      </div>
    </aside>
  );
};

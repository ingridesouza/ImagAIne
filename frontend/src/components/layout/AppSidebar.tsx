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
        'fixed inset-y-0 left-0 z-40 bg-surface-dark border-r border-white/5 text-white shadow-2xl transition-transform duration-300 ease-in-out',
        isCollapsed ? 'w-20 p-4' : 'w-72 p-6',
        'md:static md:translate-x-0 md:flex md:flex-col',
        isOpen ? 'translate-x-0 flex' : '-translate-x-full',
      )}
      aria-label="Navegação principal"
    >
      <button
        type="button"
        className="absolute right-4 top-4 text-slate-400 hover:text-white md:hidden"
        onClick={onClose}
        aria-label="Fechar menu lateral"
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      <div className="flex h-full flex-col justify-between gap-6">
        <div className="flex flex-col gap-6">
          <div className={clsx('flex items-center px-2', isCollapsed ? 'justify-center' : 'gap-3')}>
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-black">
              <span className="material-symbols-outlined !text-[24px]">auto_awesome</span>
            </div>
            {!isCollapsed ? (
              <div>
                <h1 className="text-lg font-bold leading-none tracking-tight">AI Gen</h1>
                <p className="text-xs font-medium text-white/40">Galeria Criativa</p>
              </div>
            ) : null}
          </div>

          <SidebarNav onNavigate={onClose} collapsed={isCollapsed} />
        </div>

        {!isCollapsed ? (
          <div className="rounded-2xl bg-gradient-to-b from-white/5 to-transparent p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Créditos mensais</span>
              <span className="text-xs font-bold text-primary">
                {generationCount}/{quota}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-white/5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              Upgrade Pro
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden items-center justify-center rounded-xl bg-white/5 p-3 text-white transition-colors hover:bg-white/10 md:flex"
            aria-label="Expandir menu lateral"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>
    </aside>
  );
};

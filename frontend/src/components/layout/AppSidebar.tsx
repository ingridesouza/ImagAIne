import clsx from 'clsx';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { useAuthStore } from '@/features/auth/store';
import { Sparkles } from 'lucide-react';

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
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-overlay flex flex-col',
        'bg-white/60 dark:bg-black/40 backdrop-blur-2xl backdrop-saturate-150',
        'border-r border-white/20 dark:border-white/[0.06]',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'md:static md:translate-x-0',
        isCollapsed ? 'w-[72px]' : 'w-[260px]',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
      aria-label="Navegação principal"
    >
      {/* Close mobile */}
      <button
        type="button"
        className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-full text-fg-muted/60 transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-fg md:hidden"
        onClick={onClose}
        aria-label="Fechar"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>

      {/* Logo */}
      <div className={clsx(
        'flex items-center shrink-0',
        isCollapsed ? 'justify-center px-0 pt-6 pb-4' : 'gap-3 px-5 pt-6 pb-4',
      )}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className={clsx(
            'relative flex size-10 items-center justify-center rounded-2xl',
            'bg-gradient-to-br from-flow-500 to-flow-700',
            'shadow-md shadow-flow-500/25',
            'transition-all duration-200 hover:shadow-lg hover:shadow-flow-500/30 hover:scale-105 active:scale-95',
            'hidden md:flex',
          )}
          aria-label={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          <Sparkles className="h-5 w-5 text-white" />
        </button>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-flow-500 to-flow-700 shadow-md shadow-flow-500/25 md:hidden">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-fg">ImagAIne</span>
            <span className="text-[10px] font-medium tracking-widest text-fg-muted uppercase">Studio</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        <SidebarNav onNavigate={onClose} collapsed={isCollapsed} />
      </div>

      {/* Credits — circular progress */}
      <div className={clsx(
        'shrink-0 border-t border-border px-3 py-4',
        isCollapsed ? 'flex justify-center' : '',
      )}>
        {isCollapsed ? (
          <div className="relative flex size-10 items-center justify-center">
            <svg className="size-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-inset" />
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="text-accent transition-all duration-500"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <span className="absolute text-[9px] font-bold text-fg-sec">{generationCount}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center">
              <svg className="size-10 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-inset" />
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className="text-accent transition-all duration-500"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
              </svg>
              <span className="absolute text-[9px] font-bold text-fg-sec">{generationCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-fg">{generationCount}/{quota} créditos</span>
              <span className="text-[10px] text-fg-muted">Plano {plan === 'pro' ? 'Pro' : 'Free'}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

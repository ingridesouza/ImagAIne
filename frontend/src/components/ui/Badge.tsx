import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

type BadgeProps = {
  children?: ReactNode;
  variant?: 'default' | 'success' | 'warning';
  showIcon?: boolean;
};

const ICON_MAP = {
  default: AlertCircle,
  success: Check,
  warning: Loader2,
};

export const Badge = ({ children, variant = 'default', showIcon = false }: BadgeProps) => {
  const Icon = ICON_MAP[variant];
  const isAnimated = variant === 'warning';

  return (
    <span
      className={clsx('badge', {
        'badge--success': variant === 'success',
        'badge--warning': variant === 'warning',
      })}
    >
      {showIcon ? (
        <Icon size={12} className={isAnimated ? 'animate-spin' : undefined} />
      ) : null}
      {children}
    </span>
  );
};

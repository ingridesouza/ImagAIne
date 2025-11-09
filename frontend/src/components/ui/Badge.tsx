import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning';
};

export const Badge = ({ children, variant = 'default' }: BadgeProps) => (
  <span
    className={clsx('badge', {
      'badge--success': variant === 'success',
      'badge--warning': variant === 'warning',
    })}
  >
    {children}
  </span>
);

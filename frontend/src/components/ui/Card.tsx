import type { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  children: ReactNode;
  className?: string;
  variant?: 'surface' | 'elevated' | 'inset';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const variantStyles = {
  surface: 'bg-surface border border-border',
  elevated: 'bg-elevated border border-border shadow-sm',
  inset: 'bg-inset',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = ({ children, className, variant = 'surface', padding = 'md' }: CardProps) => (
  <div
    className={clsx(
      'rounded-xl',
      variantStyles[variant],
      paddingStyles[padding],
      className,
    )}
  >
    {children}
  </div>
);

import { forwardRef } from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const variants = {
  primary: 'bg-accent text-fg-inv hover:bg-accent-hover hover:brightness-105',
  secondary: 'bg-surface text-fg shadow-sm hover:shadow-md',
  ghost: 'text-fg-sec hover:bg-inset hover:text-fg',
  danger: 'bg-danger text-white hover:brightness-110',
};

const sizes = {
  sm: 'h-8 px-4 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-5 text-base gap-2 rounded-xl',
  lg: 'h-12 px-6 text-lg gap-2 rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-body',
        'active:scale-[0.97]',
        'disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';

import { forwardRef } from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', disabled, children, ...props }, ref) => {
    const classes = clsx(
      'button',
      {
        'button--primary': variant === 'primary',
        'button--secondary': variant === 'secondary',
        'button--ghost': variant === 'ghost',
        'button--danger': variant === 'danger',
      },
      disabled && 'button--disabled',
      className,
    );
    return (
      <button ref={ref} className={classes} disabled={disabled} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

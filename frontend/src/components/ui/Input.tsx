import { forwardRef } from 'react';
import clsx from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'input',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

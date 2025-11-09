import { forwardRef } from 'react';
import clsx from 'clsx';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={clsx('select', className)} {...props}>
      {children}
    </select>
  ),
);

Select.displayName = 'Select';

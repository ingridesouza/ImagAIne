import { forwardRef } from 'react';
import clsx from 'clsx';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={clsx('textarea', className)} {...props} />
  ),
);

Textarea.displayName = 'Textarea';

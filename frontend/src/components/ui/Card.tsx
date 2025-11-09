import type { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => (
  <div
    className={clsx(
      'card',
      className,
    )}
  >
    {children}
  </div>
);

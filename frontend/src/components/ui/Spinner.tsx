import clsx from 'clsx';

type SpinnerProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-[2.5px]',
  lg: 'h-8 w-8 border-3',
};

export const Spinner = ({ label, size = 'md', className }: SpinnerProps) => (
  <div className={clsx('flex flex-col items-center gap-2', className)}>
    <span
      className={clsx(
        'animate-spin rounded-full border-border border-t-accent',
        sizeMap[size],
      )}
    />
    {label ? <span className="text-xs text-fg-muted">{label}</span> : null}
  </div>
);

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
    {icon ? <div className="mb-1 text-fg-muted">{icon}</div> : null}
    <h3 className="text-lg font-semibold text-fg">{title}</h3>
    {description ? <p className="max-w-sm text-sm text-fg-muted">{description}</p> : null}
    {actionLabel && onAction ? (
      <Button type="button" variant="secondary" size="sm" onClick={onAction} className="mt-2">
        {actionLabel}
      </Button>
    ) : null}
  </div>
);

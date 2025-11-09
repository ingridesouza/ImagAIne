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
  <div
    style={{
      border: '1px dashed #c7d2fe',
      borderRadius: '1rem',
      padding: '2rem',
      textAlign: 'center',
      background: '#fff',
    }}
  >
    {icon ? <div style={{ marginBottom: '0.5rem' }}>{icon}</div> : null}
    <h3 style={{ margin: '0 0 0.5rem' }}>{title}</h3>
    {description ? <p style={{ margin: '0 0 1rem', color: '#475569' }}>{description}</p> : null}
    {actionLabel && onAction ? (
      <Button type="button" variant="secondary" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);

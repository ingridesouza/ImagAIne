import type { KeyboardEvent } from 'react';
import { Download, Eye, EyeOff, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ImageRecord } from '@/features/images/types';

const STATUS_COPY: Record<
  ImageRecord['status'],
  { label: string; variant: 'default' | 'success' | 'warning' }
> = {
  READY: { label: 'Pronta', variant: 'success' },
  GENERATING: { label: 'Em processamento', variant: 'warning' },
  FAILED: { label: 'Falhou', variant: 'default' },
};

type ImageCardProps = {
  image: ImageRecord;
  canToggleVisibility?: boolean;
  onToggleVisibility?: (image: ImageRecord) => void;
  onToggleLike?: (image: ImageRecord) => void;
  onDownload?: (image: ImageRecord) => void;
  onShare?: (image: ImageRecord) => void;
  onSelect?: (image: ImageRecord) => void;
};

export const ImageCard = ({
  image,
  canToggleVisibility = false,
  onToggleVisibility,
  onToggleLike,
  onDownload,
  onShare,
  onSelect,
}: ImageCardProps) => {
  const status = STATUS_COPY[image.status];
  const showActions = image.status === 'READY';
  const previewClasses = `image-card__preview${onSelect ? ' image-card__preview--clickable' : ''}`;

  const handlePreviewKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(image);
    }
  };

  return (
    <article className="image-card">
      <div
        className={previewClasses}
        onClick={onSelect ? () => onSelect(image) : undefined}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onKeyDown={onSelect ? handlePreviewKeyDown : undefined}
        aria-label={onSelect ? `Ver detalhes de ${image.prompt}` : undefined}
      >
        {image.image_url ? (
          <img src={image.image_url} alt={image.prompt} loading="lazy" />
        ) : (
          <span style={{ color: '#94a3b8' }}>{status.label}</span>
        )}
      </div>
      <div className="image-card__meta">
        <Badge variant={status.variant}>{status.label}</Badge>
        <small style={{ color: '#94a3b8' }}>
          {new Date(image.created_at).toLocaleDateString('pt-BR')}
        </small>
      </div>
      <div>
        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{image.prompt}</strong>
        {image.negative_prompt ? (
          <small style={{ color: '#94a3b8' }}>Avoid: {image.negative_prompt}</small>
        ) : null}
      </div>

      <div className="image-card__meta">
        <span>❤️ {image.like_count}</span>
        <span>💬 {image.comment_count}</span>
        <span>⬇️ {image.download_count}</span>
      </div>

      {showActions ? (
        <div className="image-card__actions">
          {onToggleLike ? (
            <Button
              type="button"
              variant={image.is_liked ? 'primary' : 'secondary'}
              onClick={() => onToggleLike(image)}
            >
              <Heart size={16} fill={image.is_liked ? '#fff' : 'none'} />
              {image.is_liked ? 'Curtida' : 'Curtir'}
            </Button>
          ) : null}
          {onDownload ? (
            <Button type="button" variant="secondary" onClick={() => onDownload(image)}>
              <Download size={16} />
              Download
            </Button>
          ) : null}
          {canToggleVisibility && onToggleVisibility ? (
            <Button type="button" variant="ghost" onClick={() => onToggleVisibility(image)}>
              {image.is_public ? (
                <>
                  <Eye size={16} />
                  Tornar privada
                </>
              ) : (
                <>
                  <EyeOff size={16} />
                  Tornar pública
                </>
              )}
            </Button>
          ) : null}
          {onShare ? (
            <Button type="button" variant="ghost" onClick={() => onShare(image)}>
              <Share2 size={16} />
              Compartilhar
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

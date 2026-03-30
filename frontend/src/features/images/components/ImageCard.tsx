import type { KeyboardEvent } from 'react';
import { Download, Eye, EyeOff, Heart, MessageCircle, Share2, Check, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { ImageRecord } from '@/features/images/types';

const STATUS_CONFIG: Record<
  ImageRecord['status'],
  { icon: typeof Check; className: string }
> = {
  READY: { icon: Check, className: 'text-success' },
  GENERATING: { icon: Loader2, className: 'text-warning animate-spin' },
  FAILED: { icon: AlertCircle, className: 'text-danger' },
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
  const statusConfig = STATUS_CONFIG[image.status];
  const StatusIcon = statusConfig.icon;
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
    <article className="image-card group">
      <div
        className={previewClasses}
        onClick={onSelect ? () => onSelect(image) : undefined}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onKeyDown={onSelect ? handlePreviewKeyDown : undefined}
        aria-label={onSelect ? `Ver detalhes de ${image.prompt}` : undefined}
      >
        {image.image_url ? (
          <>
            <img src={image.image_url} alt={image.prompt} loading="lazy" />
            {showActions ? (
              <div className="absolute inset-0 flex items-end justify-center gap-1.5 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {onToggleLike ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleLike(image); }}
                    className={clsx(
                      'flex size-8 items-center justify-center rounded-lg backdrop-blur-md transition-all',
                      image.is_liked ? 'bg-like-soft text-like' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    )}
                    aria-label={image.is_liked ? 'Remover curtida' : 'Curtir'}
                  >
                    <Heart size={15} fill={image.is_liked ? 'currentColor' : 'none'} />
                  </button>
                ) : null}
                {onDownload ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDownload(image); }}
                    className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-white/20"
                    aria-label="Download"
                  >
                    <Download size={15} />
                  </button>
                ) : null}
                {canToggleVisibility && onToggleVisibility ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(image); }}
                    className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-white/20"
                    aria-label={image.is_public ? 'Tornar privada' : 'Tornar pública'}
                  >
                    {image.is_public ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                ) : null}
                {onShare ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onShare(image); }}
                    className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-white/20"
                    aria-label="Compartilhar"
                  >
                    <Share2 size={15} />
                  </button>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-fg-muted">
            <StatusIcon size={22} className={statusConfig.className} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-0.5 pt-0.5">
        <p className="truncate text-[13px] text-fg-sec">{image.prompt}</p>
        <div className="flex shrink-0 items-center gap-2 text-[11px] text-fg-muted">
          <span className="flex items-center gap-0.5">
            <Heart size={11} />
            {image.like_count}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageCircle size={11} />
            {image.comment_count}
          </span>
        </div>
      </div>
    </article>
  );
};

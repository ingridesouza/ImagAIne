import type { KeyboardEvent } from 'react';
import { Download, Eye, EyeOff, Heart, MessageCircle, Share2, Check, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { ImageRecord } from '@/features/images/types';

const STATUS_CONFIG: Record<
  ImageRecord['status'],
  { icon: typeof Check; className: string }
> = {
  READY: { icon: Check, className: 'text-emerald-400' },
  GENERATING: { icon: Loader2, className: 'text-amber-400 animate-spin' },
  FAILED: { icon: AlertCircle, className: 'text-rose-400' },
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
              <div className="absolute inset-0 flex items-end justify-center gap-2 bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                {onToggleLike ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleLike(image); }}
                    className={clsx(
                      'flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-all hover:scale-110',
                      image.is_liked ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'
                    )}
                    aria-label={image.is_liked ? 'Remover curtida' : 'Curtir'}
                  >
                    <Heart size={16} fill={image.is_liked ? 'currentColor' : 'none'} />
                  </button>
                ) : null}
                {onDownload ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDownload(image); }}
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/20"
                    aria-label="Download"
                  >
                    <Download size={16} />
                  </button>
                ) : null}
                {canToggleVisibility && onToggleVisibility ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(image); }}
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/20"
                    aria-label={image.is_public ? 'Tornar privada' : 'Tornar pública'}
                  >
                    {image.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                ) : null}
                {onShare ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onShare(image); }}
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/20"
                    aria-label="Compartilhar"
                  >
                    <Share2 size={16} />
                  </button>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <StatusIcon size={24} className={statusConfig.className} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="truncate text-sm text-slate-300">{image.prompt}</p>
        <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Heart size={12} />
            {image.like_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} />
            {image.comment_count}
          </span>
        </div>
      </div>
    </article>
  );
};

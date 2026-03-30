import clsx from 'clsx';
import type { MouseEvent } from 'react';
import type { ImageRecord } from '@/features/images/types';

type GalleryCardProps = {
  image: ImageRecord;
  aspectRatio?: string;
  onSelect: () => void;
  onToggleLike: () => void;
  onDownload: () => void;
  isTogglingLike?: boolean;
};

export const GalleryCard = ({
  image,
  aspectRatio = '1 / 1',
  onSelect,
  onToggleLike,
  onDownload,
  isTogglingLike = false,
}: GalleryCardProps) => {
  const handleDownload = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDownload();
  };

  const handleToggleLike = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isTogglingLike) {
      onToggleLike();
    }
  };

  return (
    <button
      type="button"
      className="masonry-item group relative block w-full min-h-[200px] overflow-hidden rounded-xl bg-surface ring-1 ring-border transition-all duration-300 hover:ring-border-strong hover:shadow-lg"
      style={{ aspectRatio }}
      onClick={onSelect}
    >
      {image.image_url ? (
        <img
          src={image.image_url}
          alt={image.prompt}
          loading="lazy"
          className="h-auto w-full min-h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-fg-muted">
          {image.prompt}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="min-w-0 flex-1 pr-2">
          <p className="truncate text-[13px] font-medium text-white/90">{image.prompt}</p>
          <p className="mt-0.5 text-[11px] text-white/50">@{image.user.username}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            className="pointer-events-auto flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-white/20"
            aria-label="Baixar imagem"
          >
            <span className="material-symbols-outlined !text-[18px]">download</span>
          </button>
          <button
            type="button"
            onClick={handleToggleLike}
            className={clsx(
              'pointer-events-auto flex size-8 items-center justify-center rounded-lg backdrop-blur-md transition-all',
              image.is_liked
                ? 'bg-like-soft text-like'
                : 'bg-white/10 text-white/80 hover:bg-white/20',
            )}
            aria-label={image.is_liked ? 'Remover dos favoritos' : 'Favoritar imagem'}
            disabled={isTogglingLike}
          >
            <span
              className="material-symbols-outlined !text-[18px]"
              style={{ fontVariationSettings: `'FILL' ${image.is_liked ? 1 : 0}` }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>
    </button>
  );
};

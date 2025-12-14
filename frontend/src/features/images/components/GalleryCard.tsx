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
      className="masonry-item group relative block w-full min-h-[200px] sm:min-h-[240px] overflow-hidden rounded-2xl bg-surface-dark shadow-lg shadow-black/25 ring-1 ring-white/5 transition-transform duration-300 hover:-translate-y-1"
      style={{ aspectRatio }}
      onClick={onSelect}
    >
      {image.image_url ? (
        <img
          src={image.image_url}
          alt={image.prompt}
          loading="lazy"
          className="h-auto w-full min-h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full min-h-[200px] sm:min-h-[240px] items-center justify-center bg-gradient-to-br from-surface-dark to-black text-sm text-slate-400">
          {image.prompt}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="flex items-center justify-between translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
          <div className="flex flex-col text-left">
            <span className="truncate text-sm font-semibold text-white">{image.prompt}</span>
            <span className="text-xs text-slate-400">@{image.user.username}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Baixar imagem"
            >
              <span className="material-symbols-outlined !text-[20px]">download</span>
            </button>
            <button
              type="button"
              onClick={handleToggleLike}
              className={clsx(
                'pointer-events-auto flex size-10 items-center justify-center rounded-full transition-colors backdrop-blur-sm',
                image.is_liked
                  ? 'bg-accent-purple text-white'
                  : 'bg-white/10 text-white hover:bg-white/20',
              )}
              aria-label={image.is_liked ? 'Remover dos favoritos' : 'Favoritar imagem'}
              disabled={isTogglingLike}
            >
              <span
                className="material-symbols-outlined !text-[20px]"
                style={{ fontVariationSettings: `'FILL' ${image.is_liked ? 1 : 0}` }}
              >
                favorite
              </span>
            </button>
          </div>
        </div>
      </div>
    </button>
  );
};

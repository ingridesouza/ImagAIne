import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { ImageDetailsDialog } from '@/features/images/components/ImageDetailsDialog';
import { GalleryCard } from '@/features/images/components/GalleryCard';
import type { ImageRecord } from '@/features/images/types';
import { QUERY_KEYS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';

const VIEW_OPTIONS = [
  { label: 'Tendências', value: 'featured' as const },
  { label: 'Recentes', value: 'recent' as const },
  { label: 'Top downloads', value: 'downloads' as const },
  { label: 'Likes', value: 'liked' as const },
];

const SKELETON_RATIOS = ['3 / 4', '4 / 5', '1 / 1', '16 / 9'];
const PLACEHOLDER_TILES = Array.from({ length: 12 }, (_, index) => index);

type ViewFilter = (typeof VIEW_OPTIONS)[number]['value'];

const formatAspectRatio = (value?: string | null) => {
  if (!value) {
    return '1 / 1';
  }
  const [width, height] = value.split(':').map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
    return '1 / 1';
  }
  return `${width} / ${height}`;
};

export const ExplorePage = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ViewFilter>('featured');
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  useEffect(() => {
    const searchInput = document.querySelector<HTMLInputElement>('[data-global-search]');
    if (!searchInput) {
      return undefined;
    }
    const handleInput = (event: Event) => setSearch((event.target as HTMLInputElement).value);
    searchInput.addEventListener('input', handleInput);
    return () => searchInput.removeEventListener('input', handleInput);
  }, []);

  useEffect(() => {
    const searchInput = document.querySelector<HTMLInputElement>('[data-global-search]');
    if (searchInput && searchInput.value !== search) {
      searchInput.value = search;
    }
  }, [search]);

  const { data: response, isLoading } = useQuery({
    queryKey: QUERY_KEYS.publicImages(debouncedSearch),
    queryFn: () => imagesApi.fetchPublicImages(debouncedSearch),
  });
  const images = useMemo<ImageRecord[]>(() => response?.results ?? [], [response?.results]);

  const readyImages = useMemo(() => {
    const curated = images.filter((image) => image.status === 'READY');
    const sorted = [...curated];
    switch (activeFilter) {
      case 'liked':
        return sorted.sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0));
      case 'downloads':
        return sorted.sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0));
      case 'recent':
        return sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case 'featured':
      default:
        return sorted.sort((a, b) => {
          if (a.featured === b.featured) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return a.featured ? -1 : 1;
        });
    }
  }, [images, activeFilter]);

  const totalLikes = useMemo(
    () => readyImages.reduce((sum, image) => sum + (image.like_count ?? 0), 0),
    [readyImages],
  );
  const totalDownloads = useMemo(
    () => readyImages.reduce((sum, image) => sum + (image.download_count ?? 0), 0),
    [readyImages],
  );

  const visibilityMutation = useMutation({
    mutationFn: ({ image, isPublic }: { image: ImageRecord; isPublic: boolean }) =>
      imagesApi.updateShare(image.id, isPublic),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicImages(debouncedSearch) }),
  });

  const likeMutation = useMutation({
    mutationFn: (image: ImageRecord) =>
      image.is_liked ? imagesApi.unlike(image.id) : imagesApi.like(image.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicImages(debouncedSearch) }),
  });

  const handleDownload = async (image: ImageRecord) => {
    const data = await imagesApi.registerDownload(image.id);
    if (data.download_url) {
      window.open(data.download_url, '_blank');
    }
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicImages(debouncedSearch) });
  };

  const handleUpdateVisibility = (image: ImageRecord, isPublic: boolean) => {
    setSelectedImage((current) => (current?.id === image.id ? { ...current, is_public: isPublic } : current));
    visibilityMutation.mutate({ image, isPublic });
  };

  const isLoadingGrid = isLoading;
  const showEmptyState = !isLoadingGrid && readyImages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-200">
      <div className="flex items-start justify-between pt-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Galeria AI Gen</p>
          <h1 className="text-2xl font-bold text-white">Explorar</h1>
          <p className="text-sm text-slate-400">Descubra estilos, artistas e prompts da comunidade.</p>
        </div>

        {search ? (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="ml-4 hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white sm:flex"
          >
            <span className="material-symbols-outlined !text-[18px]">close</span>
            Limpar busca
          </button>
        ) : null}
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto pb-12 pt-4">
        <div className="no-scrollbar flex flex-wrap items-center gap-3 overflow-x-auto pb-4 pt-2">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={clsx(
                'rounded-full border px-5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap',
                activeFilter === option.value
                  ? 'border-accent-purple/20 bg-white text-background-dark shadow-lg shadow-white/10'
                  : 'border-white/5 bg-surface-dark text-slate-300 hover:border-white/20 hover:text-white',
              )}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-surface-dark/70 p-4 shadow-lg shadow-black/20">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Peças exibidas</p>
            <p className="text-xl font-semibold text-white">{readyImages.length.toLocaleString('pt-BR')}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-surface-dark/70 p-4 shadow-lg shadow-black/20">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Curtidas</p>
            <p className="text-xl font-semibold text-white">{totalLikes.toLocaleString('pt-BR')}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-surface-dark/70 p-4 shadow-lg shadow-black/20">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Downloads</p>
            <p className="text-xl font-semibold text-white">{totalDownloads.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="masonry-grid pt-6" role="list">
          {isLoadingGrid
            ? PLACEHOLDER_TILES.map((placeholder) => (
                <div
                  key={placeholder}
                  className="masonry-item rounded-2xl bg-surface-dark/80 shadow-lg shadow-black/20"
                  style={{ aspectRatio: SKELETON_RATIOS[placeholder % SKELETON_RATIOS.length] }}
                  aria-hidden
                >
                  <div className="h-full w-full animate-pulse rounded-2xl bg-gradient-to-br from-white/5 via-white/10 to-white/5" />
                </div>
              ))
            : null}

          {!isLoadingGrid && !showEmptyState
            ? readyImages.map((image) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                  aspectRatio={formatAspectRatio(image.aspect_ratio)}
                  onSelect={() => setSelectedImage(image)}
                  onToggleLike={() => likeMutation.mutate(image)}
                  onDownload={() => handleDownload(image)}
                  isTogglingLike={likeMutation.isPending}
                />
              ))
            : null}
        </div>

        {showEmptyState ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-surface-dark/60 px-6 py-10 text-center text-slate-300">
            <span className="material-symbols-outlined !text-[32px] text-primary">auto_awesome</span>
            <p className="text-lg font-semibold text-white">Nenhuma imagem pública encontrada.</p>
            <p className="text-sm text-slate-400">Tente outro termo de busca ou altere o filtro acima.</p>
          </div>
        ) : null}
      </div>

      <ImageDetailsDialog
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onToggleLike={(image) => likeMutation.mutate(image)}
        onDownload={handleDownload}
        onUpdateVisibility={handleUpdateVisibility}
        isUpdatingVisibility={visibilityMutation.isPending}
      />
    </div>
  );
};

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { ImageDetailsDialog } from '@/features/images/components/ImageDetailsDialog';
import type { ImageRecord } from '@/features/images/types';
import { QUERY_KEYS } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';

const VIEW_OPTIONS = [
  { label: 'Explore', value: 'featured' as const, description: 'Curadoria viva' },
  { label: 'Imagens', value: 'recent' as const, description: 'Chegaram agora' },
  { label: 'Top', value: 'downloads' as const, description: 'Mais baixadas' },
  { label: 'Likes', value: 'liked' as const, description: 'Favoritas da semana' },
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
    <section className="explore">
      <div className="explore__hero glass-panel">
        <div className="explore__hero-copy">
          <p className="page-eyebrow">Galeria pública</p>
          <h1>Explore</h1>
          <p>
            Moodboards cinematográficos e retratos elétricos em um feed mínimo inspirado no Midjourney e no Sora.
          </p>
        </div>
        <div className="explore__hero-actions">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por prompt, artista ou mood..."
          />
          <button type="button" className="explore__clear" onClick={() => setSearch('')} disabled={!search}>
            Limpar
          </button>
        </div>
        <div className="explore__metrics">
          <div>
            <span>Peças exibidas</span>
            <strong>{readyImages.length.toLocaleString('pt-BR')}</strong>
          </div>
          <div>
            <span>Curtidas totais</span>
            <strong>{totalLikes.toLocaleString('pt-BR')}</strong>
          </div>
          <div>
            <span>Downloads</span>
            <strong>{totalDownloads.toLocaleString('pt-BR')}</strong>
          </div>
        </div>
      </div>

      <div className="explore__filters glass-panel">
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={clsx('explore-filter', { 'explore-filter--active': activeFilter === option.value })}
            onClick={() => setActiveFilter(option.value)}
          >
            <span>{option.label}</span>
            <small>{option.description}</small>
          </button>
        ))}
      </div>

      <div className="explore__gallery" role="list">
        {isLoadingGrid
          ? PLACEHOLDER_TILES.map((placeholder) => (
              <div
                key={placeholder}
                className="explore-tile explore-tile--skeleton"
                style={{ aspectRatio: SKELETON_RATIOS[placeholder % SKELETON_RATIOS.length] }}
                aria-hidden
              />
            ))
          : null}

        {!isLoadingGrid && !showEmptyState
          ? readyImages.map((image) => (
              <button
                key={image.id}
                type="button"
                className="explore-tile"
                style={{ aspectRatio: formatAspectRatio(image.aspect_ratio) }}
                onClick={() => setSelectedImage(image)}
                aria-label={`Abrir detalhes de ${image.prompt}`}
              >
                {image.image_url ? (
                  <img src={image.image_url} alt={image.prompt} loading="lazy" />
                ) : (
                  <span className="explore-tile__placeholder">{image.prompt}</span>
                )}
              </button>
            ))
          : null}

        {showEmptyState ? (
          <div className="explore__empty glass-panel">
            <p>Nenhuma imagem pública encontrada.</p>
            <small>Tente um novo termo ou altere o filtro.</small>
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
    </section>
  );
};

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { ImageGrid } from '@/features/images/components/ImageGrid';
import { ImageDetailsDialog } from '@/features/images/components/ImageDetailsDialog';
import type { ImageRecord } from '@/features/images/types';
import { QUERY_KEYS } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';

const FILTER_OPTIONS = [
  { label: 'Destaques', value: 'featured' as const, description: 'Curadoria e brilho' },
  { label: 'Mais recentes', value: 'recent' as const, description: 'Tudo que acabou de chegar' },
  { label: 'Mais curtidas', value: 'liked' as const, description: 'Favoritas da comunidade' },
];

const FALLBACK_TAGS = ['minimalista', 'futurismo', 'fine-art', 'surrealismo'];

type FilterValue = (typeof FILTER_OPTIONS)[number]['value'];

export const PublicGalleryPage = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterValue>('featured');
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: QUERY_KEYS.publicImages(debouncedSearch),
    queryFn: () => imagesApi.fetchPublicImages(debouncedSearch),
  });
  const images: ImageRecord[] = response?.results ?? [];

  const totalLikes = useMemo(() => images.reduce((sum, image) => sum + (image.like_count ?? 0), 0), [images]);
  const totalDownloads = useMemo(
    () => images.reduce((sum, image) => sum + (image.download_count ?? 0), 0),
    [images],
  );
  const highlightedTags = useMemo(() => {
    const frequency = new Map<string, number>();
    images.forEach((image) =>
      image.tags?.forEach((tag) => frequency.set(tag, (frequency.get(tag) ?? 0) + 1)),
    );
    if (frequency.size === 0) {
      return FALLBACK_TAGS;
    }
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag);
  }, [images]);

  const filteredImages = useMemo(() => {
    if (images.length === 0) {
      return images;
    }
    const sorted = [...images];
    switch (activeFilter) {
      case 'liked':
        return sorted.sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0));
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

  const visibilityMutation = useMutation({
    mutationFn: ({ image, isPublic }: { image: ImageRecord; isPublic: boolean }) =>
      imagesApi.updateShare(image.id, isPublic),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicImages(debouncedSearch) }),
  });

  const likeMutation = useMutation({
    mutationFn: (image: ImageRecord) =>
      image.is_liked ? imagesApi.unlike(image.id) : imagesApi.like(image.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicImages(debouncedSearch) }),
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

  const heroStats = [
    { label: 'Imagens públicas no feed', value: filteredImages.length },
    { label: 'Curtidas acumuladas', value: totalLikes },
    { label: 'Downloads registrados', value: totalDownloads },
  ];

  return (
    <section className="public-gallery">
      <div className="public-gallery__hero glass-panel">
        <div className="public-gallery__hero-copy">
          <p className="public-gallery__eyebrow">Explorar comunidade</p>
          <h1>Galeria pública</h1>
          <p className="public-gallery__lead">
            Descubra inspirações coletivas em um ambiente minimalista, com superfícies translúcidas e foco total
            nas imagens que importam.
          </p>
          <div className="public-gallery__stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="public-gallery__stat">
                <span>{stat.label}</span>
                <strong>{stat.value.toLocaleString('pt-BR')}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="public-gallery__search-card">
          <div className="public-gallery__search-input">
            <Input
              placeholder="Buscar por prompt, mood ou artista..."
              value={search}
              className="public-gallery__input"
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              type="button"
              className="public-gallery__search-button"
              onClick={() => setSearch('')}
              disabled={!search}
            >
              {search ? 'Limpar busca' : 'Descobrir agora'}
            </button>
          </div>
          <p className="public-gallery__hint">Dica: combine sentimentos + estilo para resultados mais precisos.</p>
        </div>
      </div>

      <div className="public-gallery__toolbar glass-panel">
        <div className="public-gallery__filters">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={clsx('public-gallery__filter', {
                'public-gallery__filter--active': activeFilter === option.value,
              })}
              onClick={() => setActiveFilter(option.value)}
            >
              <span>{option.label}</span>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
        <div className="public-gallery__chips">
          {highlightedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="public-gallery__chip"
              onClick={() => setSearch(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="public-gallery__grid glass-panel">
        <ImageGrid
          images={filteredImages}
          isLoading={isLoading || visibilityMutation.isPending}
          onToggleLike={(image) => likeMutation.mutate(image)}
          onDownload={handleDownload}
          onSelectImage={(image) => setSelectedImage(image)}
        />
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

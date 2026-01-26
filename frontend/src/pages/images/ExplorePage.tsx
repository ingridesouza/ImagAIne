import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  const [activeFilter, _setActiveFilter] = useState<ViewFilter>('featured');
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [promptDraft, setPromptDraft] = useState('');
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const handleShare = async (image: ImageRecord) => {
    const shareUrl = `${window.location.origin}/explore?image=${image.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Confira essa imagem no ImagAIne!',
          text: image.prompt,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      // TODO: Add toast notification
    }
  };

  const isLoadingGrid = isLoading;
  const showEmptyState = !isLoadingGrid && readyImages.length === 0;

  const handlePromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/generate', { state: { promptDraft } });
  };

  return (
    <div className="explore-page flex h-full min-h-0 flex-col overflow-hidden bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-200">
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

      <div className="no-scrollbar flex-1 overflow-y-auto pb-32 pt-4">
        <div className="masonry-grid pt-6" role="list">
          {isLoadingGrid
            ? PLACEHOLDER_TILES.map((placeholder) => (
                <div
                  key={placeholder}
                  className="masonry-item rounded-xl bg-surface-dark/80 shadow-lg shadow-black/20"
                  style={{ aspectRatio: SKELETON_RATIOS[placeholder % SKELETON_RATIOS.length] }}
                  aria-hidden
                >
                  <div className="h-full w-full animate-pulse rounded-xl bg-gradient-to-br from-white/5 via-white/10 to-white/5" />
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

      <form className="explore-prompt" onSubmit={handlePromptSubmit}>
        <div className="explore-prompt__input">
          <span className="material-symbols-outlined">auto_awesome</span>
          <input
            type="text"
            placeholder="Descreva a imagem que você quer criar..."
            value={promptDraft}
            onChange={(event) => setPromptDraft(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="explore-prompt__controls">
          <button type="button" className="explore-pill" title="Tipo de saída">
            <span className="material-symbols-outlined">image</span>
            <span>Imagem</span>
          </button>
          <button type="button" className="explore-pill explore-pill--active" title="Proporção">
            <span className="material-symbols-outlined">crop_square</span>
            <span>1:1</span>
          </button>
          <button type="button" className="explore-pill" title="Proporção retrato">
            <span className="material-symbols-outlined">crop_portrait</span>
            <span>9:16</span>
          </button>
          <button type="button" className="explore-pill" title="Proporção paisagem">
            <span className="material-symbols-outlined">crop_landscape</span>
            <span>16:9</span>
          </button>
          <div className="explore-prompt__divider" />
          <button type="button" className="explore-pill explore-pill--hide-text-mobile" title="Configurações avançadas">
            <span className="material-symbols-outlined">tune</span>
            <span>Opções</span>
          </button>
          <button type="button" className="explore-pill explore-pill--hide-text-mobile" title="Dicas de prompts">
            <span className="material-symbols-outlined">lightbulb</span>
            <span>Dicas</span>
          </button>
          <button
            type="submit"
            disabled={!promptDraft.trim()}
            className="explore-submit"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
            <span>Criar</span>
          </button>
        </div>
      </form>

      <ImageDetailsDialog
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onToggleLike={(image) => likeMutation.mutate(image)}
        onDownload={handleDownload}
        onShare={handleShare}
        onUpdateVisibility={handleUpdateVisibility}
        isUpdatingVisibility={visibilityMutation.isPending}
      />
    </div>
  );
};

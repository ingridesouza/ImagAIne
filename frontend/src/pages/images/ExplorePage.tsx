import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { imagesApi } from '@/features/images/api';
import { ImageDetailsDialog, type ImageComment } from '@/features/images/components/ImageDetailsDialog';
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

type AspectRatioOption = '1:1' | '9:16' | '16:9';

export const ExplorePage = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, _setActiveFilter] = useState<ViewFilter>('featured');
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [comments, setComments] = useState<ImageComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [promptDraft, setPromptDraft] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioOption>('1:1');
  const [showOptions, setShowOptions] = useState(false);
  const [showTips, setShowTips] = useState(false);
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

  const fetchCommentsForImage = async (imageId: number) => {
    setIsLoadingComments(true);
    try {
      const data = await imagesApi.fetchComments(imageId);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSelectImage = (image: ImageRecord) => {
    setSelectedImage(image);
    setComments([]);
    fetchCommentsForImage(image.id);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
    setComments([]);
  };

  const addCommentMutation = useMutation({
    mutationFn: ({ imageId, text }: { imageId: number; text: string }) =>
      imagesApi.addComment(imageId, text),
    onSuccess: (newComment) => {
      setComments((prev) => [...prev, newComment]);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicImages(debouncedSearch) });
    },
  });

  const handleAddComment = (image: ImageRecord, text: string) => {
    addCommentMutation.mutate({ imageId: image.id, text });
  };

  const likeCommentMutation = useMutation({
    mutationFn: ({ imageId, commentId, isLiked }: { imageId: number; commentId: number; isLiked: boolean }) =>
      isLiked ? imagesApi.unlikeComment(imageId, commentId) : imagesApi.likeComment(imageId, commentId),
    onSuccess: (data) => {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === data.comment_id) {
            return { ...comment, is_liked: data.is_liked, like_count: data.like_count };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === data.comment_id
                  ? { ...reply, is_liked: data.is_liked, like_count: data.like_count }
                  : reply
              ),
            };
          }
          return comment;
        })
      );
    },
  });

  const handleLikeComment = (commentId: number) => {
    if (!selectedImage) return;
    const comment = comments.find((c) => c.id === commentId);
    const reply = comments.flatMap((c) => c.replies || []).find((r) => r.id === commentId);
    const isLiked = comment?.is_liked || reply?.is_liked || false;
    likeCommentMutation.mutate({ imageId: selectedImage.id, commentId, isLiked });
  };

  const addReplyMutation = useMutation({
    mutationFn: ({ imageId, parentId, text }: { imageId: number; parentId: number; text: string }) =>
      imagesApi.addReply(imageId, parentId, text),
    onSuccess: (newReply, { parentId }) => {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), newReply],
                reply_count: (comment.reply_count || 0) + 1,
              }
            : comment
        )
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicImages(debouncedSearch) });
    },
  });

  const handleAddReply = (parentId: number, text: string) => {
    if (!selectedImage) return;
    addReplyMutation.mutate({ imageId: selectedImage.id, parentId, text });
  };

  const likeMutation = useMutation({
    mutationFn: async (image: ImageRecord) => {
      if (image.is_liked) {
        await imagesApi.unlike(image.id);
      } else {
        await imagesApi.like(image.id);
      }
    },
    onMutate: (image) => {
      // Optimistic update - atualiza a UI imediatamente
      const optimisticImage = {
        ...image,
        is_liked: !image.is_liked,
        like_count: image.is_liked
          ? Math.max(0, (image.like_count ?? 1) - 1)
          : (image.like_count ?? 0) + 1,
      };
      if (selectedImage && selectedImage.id === image.id) {
        setSelectedImage(optimisticImage);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicImages(debouncedSearch) });
    },
  });

  const generateMutation = useMutation({
    mutationFn: (payload: { prompt: string; aspect_ratio: string }) =>
      imagesApi.generate(payload),
    onSuccess: (newImage) => {
      setPromptDraft('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicImages(debouncedSearch) });
      navigate('/my-images', { state: { highlightId: newImage.id } });
    },
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
    if (!promptDraft.trim() || generateMutation.isPending) return;
    generateMutation.mutate({
      prompt: promptDraft.trim(),
      aspect_ratio: selectedRatio,
      ...(negativePrompt.trim() ? { negative_prompt: negativePrompt.trim() } : {}),
    });
  };

  const handleTipClick = (tip: string) => {
    setPromptDraft(tip);
    setShowTips(false);
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
                  onSelect={() => handleSelectImage(image)}
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

      {showOptions && (
        <div className="explore-panel explore-panel--options">
          <div className="explore-panel__header">
            <span className="material-symbols-outlined">tune</span>
            <span>Opções Avançadas</span>
            <button type="button" className="explore-panel__close" onClick={() => setShowOptions(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="explore-panel__content">
            <label className="explore-panel__label">
              <span>Prompt Negativo</span>
              <small>Descreva o que você NÃO quer na imagem</small>
            </label>
            <input
              type="text"
              className="explore-panel__input"
              placeholder="Ex: blur, low quality, watermark, text..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
            />
          </div>
        </div>
      )}

      {showTips && (
        <div className="explore-panel explore-panel--tips">
          <div className="explore-panel__header">
            <span className="material-symbols-outlined">lightbulb</span>
            <span>Dicas de Prompts</span>
            <button type="button" className="explore-panel__close" onClick={() => setShowTips(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="explore-panel__content">
            <button
              type="button"
              className="explore-panel__assistant-btn"
              onClick={() => { setShowTips(false); navigate('/prompt-assistant'); }}
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              <div>
                <strong>Assistente de Prompts com IA</strong>
                <small>Descreva sua ideia e a IA cria o prompt perfeito</small>
              </div>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="explore-panel__hint">Ou use uma dica rapida:</p>
            <div className="explore-panel__tips-grid">
              <button type="button" className="explore-panel__tip" onClick={() => handleTipClick('A serene Japanese garden with cherry blossoms, koi pond, wooden bridge, soft morning light, photorealistic')}>
                Jardim Japones
              </button>
              <button type="button" className="explore-panel__tip" onClick={() => handleTipClick('Cyberpunk city at night, neon lights, rain reflections, flying cars, detailed architecture, cinematic')}>
                Cidade Cyberpunk
              </button>
              <button type="button" className="explore-panel__tip" onClick={() => handleTipClick('Portrait of a mystical forest elf, ethereal glow, intricate jewelry, fantasy art style, highly detailed')}>
                Elfo da Floresta
              </button>
              <button type="button" className="explore-panel__tip" onClick={() => handleTipClick('Cozy coffee shop interior, warm lighting, bookshelves, plants, rainy window view, illustration style')}>
                Cafe Aconchegante
              </button>
              <button type="button" className="explore-panel__tip" onClick={() => handleTipClick('Majestic dragon flying over mountains, sunset, epic scale, detailed scales, fantasy digital art')}>
                Dragao Epico
              </button>
              <button type="button" className="explore-panel__tip" onClick={() => handleTipClick('Astronaut floating in space, Earth in background, stars, nebula colors, realistic, cinematic lighting')}>
                Astronauta no Espaco
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="explore-prompt" onSubmit={handlePromptSubmit}>
        <div className="explore-prompt__input">
          <span className="material-symbols-outlined">auto_awesome</span>
          <input
            type="text"
            placeholder="Descreva a imagem que você quer criar..."
            value={promptDraft}
            onChange={(event) => setPromptDraft(event.target.value)}
            autoComplete="off"
            disabled={generateMutation.isPending}
          />
        </div>
        <div className="explore-prompt__controls">
          <button type="button" className="explore-pill" title="Tipo de saída">
            <span className="material-symbols-outlined">image</span>
            <span>Imagem</span>
          </button>
          <button
            type="button"
            className={`explore-pill${selectedRatio === '1:1' ? ' explore-pill--active' : ''}`}
            title="Proporção quadrada"
            onClick={() => setSelectedRatio('1:1')}
          >
            <span className="material-symbols-outlined">crop_square</span>
            <span>1:1</span>
          </button>
          <button
            type="button"
            className={`explore-pill${selectedRatio === '9:16' ? ' explore-pill--active' : ''}`}
            title="Proporção retrato"
            onClick={() => setSelectedRatio('9:16')}
          >
            <span className="material-symbols-outlined">crop_portrait</span>
            <span>9:16</span>
          </button>
          <button
            type="button"
            className={`explore-pill${selectedRatio === '16:9' ? ' explore-pill--active' : ''}`}
            title="Proporção paisagem"
            onClick={() => setSelectedRatio('16:9')}
          >
            <span className="material-symbols-outlined">crop_landscape</span>
            <span>16:9</span>
          </button>
          <div className="explore-prompt__divider" />
          <button
            type="button"
            className={`explore-pill explore-pill--hide-text-mobile${showOptions ? ' explore-pill--active' : ''}`}
            title="Configurações avançadas"
            onClick={() => { setShowOptions(!showOptions); setShowTips(false); }}
          >
            <span className="material-symbols-outlined">tune</span>
            <span>Opções</span>
          </button>
          <button
            type="button"
            className={`explore-pill explore-pill--hide-text-mobile${showTips ? ' explore-pill--active' : ''}`}
            title="Dicas de prompts"
            onClick={() => { setShowTips(!showTips); setShowOptions(false); }}
          >
            <span className="material-symbols-outlined">lightbulb</span>
            <span>Dicas</span>
          </button>
          <button
            type="submit"
            disabled={!promptDraft.trim() || generateMutation.isPending}
            className="explore-submit"
          >
            {generateMutation.isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">arrow_forward</span>
                <span>Criar</span>
              </>
            )}
          </button>
        </div>
      </form>

      <ImageDetailsDialog
        image={selectedImage}
        onClose={handleCloseDialog}
        onToggleLike={(image) => likeMutation.mutate(image)}
        onDownload={handleDownload}
        onShare={handleShare}
        onUpdateVisibility={handleUpdateVisibility}
        isUpdatingVisibility={visibilityMutation.isPending}
        comments={comments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onAddReply={handleAddReply}
        isLoadingComments={isLoadingComments}
      />
    </div>
  );
};

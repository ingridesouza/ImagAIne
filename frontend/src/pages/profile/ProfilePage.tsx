import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import clsx from 'clsx';
import { GalleryCard } from '@/features/images/components/GalleryCard';
import { ImageDetailsDialog, type ImageComment } from '@/features/images/components/ImageDetailsDialog';
import type { ImageRecord } from '@/features/images/types';
import { imagesApi } from '@/features/images/api';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import type { UserProfile } from '@/features/auth/types';
import { QUERY_KEYS } from '@/lib/constants';

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

const getInitials = (name?: string, username?: string) => {
  if (name && name.trim().length) {
    const parts = name.trim().split(' ');
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
  if (username) {
    return username.slice(0, 2).toUpperCase();
  }
  return 'AI';
};

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const cachedProfile = queryClient.getQueryData<UserProfile>(QUERY_KEYS.profile);
  const storeUser = useAuthStore((state) => state.user);
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [comments, setComments] = useState<ImageComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [activeTab, setActiveTab] = useState<'creations' | 'liked'>('creations');

  const { data: profile } = useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => authApi.fetchProfile(),
    staleTime: 5 * 60 * 1000,
    initialData: cachedProfile,
  });

  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const avatarUploadMutation = useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData<UserProfile>(QUERY_KEYS.profile, data);
      setUploadError(null);
    },
    onError: () => setUploadError('Não foi possível atualizar a foto de perfil. Tente novamente.'),
  });

  const coverUploadMutation = useMutation({
    mutationFn: (file: File) => authApi.uploadCover(file),
    onSuccess: (data) => {
      queryClient.setQueryData<UserProfile>(QUERY_KEYS.profile, data);
      setUploadError(null);
    },
    onError: () => setUploadError('Não foi possível atualizar a capa. Tente novamente.'),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione um arquivo de imagem válido.');
      return;
    }
    setUploadError(null);
    if (type === 'avatar') {
      avatarUploadMutation.mutate(file);
    } else {
      coverUploadMutation.mutate(file);
    }
    event.target.value = '';
  };

  const {
    data: myImagesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.myImagesInfinite(),
    queryFn: ({ pageParam = 1 }) => imagesApi.fetchMyImagesPage({ pageParam }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const {
    data: likedImagesData,
    isLoading: isLoadingLiked,
    fetchNextPage: fetchNextLikedPage,
    hasNextPage: hasNextLikedPage,
    isFetchingNextPage: isFetchingNextLikedPage,
  } = useInfiniteQuery({
    queryKey: [...QUERY_KEYS.likedImages(), 'infinite'] as const,
    queryFn: ({ pageParam = 1 }) => imagesApi.fetchLikedImages(pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: activeTab === 'liked',
  });

  const images = useMemo(
    () => myImagesData?.pages.flatMap((p) => p.results) ?? [],
    [myImagesData],
  );
  const readyImages = useMemo(
    () => images.filter((image) => image.status === 'READY'),
    [images],
  );
  const likedImages = useMemo(
    () => likedImagesData?.pages.flatMap((p) => p.results) ?? [],
    [likedImagesData],
  );

  const totalCreations = myImagesData?.pages[0]?.count ?? images.length;
  const totalLikes = readyImages.reduce((sum, image) => sum + (image.like_count ?? 0), 0);
  const totalDownloads = readyImages.reduce((sum, image) => sum + (image.download_count ?? 0), 0);

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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImagesInfinite() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.likedImages() });
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ image, isPublic }: { image: ImageRecord; isPublic: boolean }) =>
      imagesApi.updateShare(image.id, isPublic),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImagesInfinite() }),
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImagesInfinite() });
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImagesInfinite() });
    },
  });

  const handleAddReply = (parentId: number, text: string) => {
    if (!selectedImage) return;
    addReplyMutation.mutate({ imageId: selectedImage.id, parentId, text });
  };

  const handleDownload = async (image: ImageRecord) => {
    const data = await imagesApi.registerDownload(image.id);
    if (data.download_url) {
      window.open(data.download_url, '_blank');
    }
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImagesInfinite() });
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
    }
  };

  const coverUrl = profile?.cover_url;
  const avatarUrl = profile?.avatar_url;
  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
    profile?.username ||
    storeUser?.username ||
    'Usuário';
  const username = profile?.username ?? storeUser?.username ?? 'user';
  const bio = profile?.bio || 'Adicione uma bio para contar ao mundo sobre suas criações generativas.';

  return (
    <div className="isolate flex min-h-full flex-col bg-body text-fg">
      <div className="relative z-0 h-44 w-full overflow-hidden sm:h-52 md:h-56">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Capa de ${fullName}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-flow-800 via-flow-700 to-flow-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-body/60 to-transparent" />
        <div className="absolute bottom-3 right-4 z-10">
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white/70 backdrop-blur-md transition-colors hover:bg-black/50 hover:text-white disabled:opacity-50"
            disabled={coverUploadMutation.isPending}
          >
            <span className="material-symbols-outlined text-[14px]">
              {coverUploadMutation.isPending ? 'hourglass_empty' : 'edit'}
            </span>
            {coverUploadMutation.isPending ? 'Atualizando...' : 'Editar capa'}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFileChange(event, 'cover')}
          />
        </div>
      </div>

      <div className="relative z-10 -mt-10 px-4 pb-6 sm:-mt-12 sm:px-6 md:-mt-14 md:px-8 lg:px-16 xl:px-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-6">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="group relative h-28 w-28 overflow-hidden rounded-full border-[3px] border-body bg-surface shadow-lg md:h-32 md:w-32 disabled:opacity-60"
                aria-label="Alterar foto de perfil"
                disabled={avatarUploadMutation.isPending}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={`Avatar de ${fullName}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent-soft text-xl font-semibold text-accent">
                    {getInitials(fullName, username)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[20px] text-white">
                    {avatarUploadMutation.isPending ? 'hourglass_empty' : 'photo_camera'}
                  </span>
                </div>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFileChange(event, 'avatar')}
              />
              {profile?.is_verified ? (
                <div
                  className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full border-2 border-body bg-accent"
                  title="Verificado"
                >
                  <span className="material-symbols-outlined text-[13px] font-bold text-fg-inv">check</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-1 pb-1">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">{fullName}</h1>
                {profile?.is_verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Verificado
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-fg-muted">@{username}</p>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-fg-sec">{bio}</p>

              <div className="mt-3 flex flex-wrap gap-5 text-[13px] text-fg-muted">
                <div className="flex items-center gap-1.5">
                  <strong className="text-fg">{totalCreations.toLocaleString('pt-BR')}</strong>
                  <span>criações</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-fg">{totalLikes.toLocaleString('pt-BR')}</strong>
                  <span>likes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-fg">{totalDownloads.toLocaleString('pt-BR')}</strong>
                  <span>downloads</span>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 pb-1 md:w-auto">
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-4 text-[13px] font-medium text-fg-sec transition-all hover:bg-inset hover:text-fg md:flex-initial"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Editar perfil
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  toast.success('Link do perfil copiado!');
                }}
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-fg-muted transition-all hover:bg-inset hover:text-fg"
                aria-label="Compartilhar perfil"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {uploadError ? (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20">
          <div className="mt-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
            {uploadError}
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 md:px-8 lg:px-16 xl:px-20">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border pb-0">
          <button
            type="button"
            className={clsx(
              'relative flex-shrink-0 px-4 py-3 text-[13px] font-medium transition-colors',
              activeTab === 'creations' ? 'text-fg' : 'text-fg-muted hover:text-fg-sec',
            )}
            onClick={() => setActiveTab('creations')}
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              <span>Criações</span>
            </div>
            {activeTab === 'creations' && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-accent" />
            )}
          </button>
          <button
            type="button"
            className={clsx(
              'relative flex-shrink-0 px-4 py-3 text-[13px] font-medium transition-colors',
              activeTab === 'liked' ? 'text-fg' : 'text-fg-muted hover:text-fg-sec',
            )}
            onClick={() => setActiveTab('liked')}
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              <span>Curtidas</span>
            </div>
            {activeTab === 'liked' && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-accent" />
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {['Tudo', 'Retratos', 'Paisagens', 'Cyberpunk', '3D'].map((chip) => (
              <button
                key={chip}
                type="button"
                className={clsx(
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all',
                  chip === 'Tudo'
                    ? 'bg-accent-soft text-accent'
                    : 'text-fg-muted hover:bg-surface hover:text-fg-sec',
                )}
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
            <span>Ordenar:</span>
            <select className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-fg-sec outline-none focus:ring-0">
              <option>Mais recentes</option>
              <option>Mais baixadas</option>
              <option>Mais curtidas</option>
            </select>
          </div>
        </div>

        {activeTab === 'creations' && (
          <>
            <div className="profile-grid pt-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="masonry-item h-56 rounded-xl bg-surface"
                    >
                      <div className="h-full w-full animate-pulse rounded-xl bg-inset" />
                    </div>
                  ))
                : null}

              {!isLoading && readyImages.length
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

            {!isLoading && readyImages.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center gap-2 py-16 text-center">
                <span className="material-symbols-outlined text-[28px] text-fg-muted">auto_awesome</span>
                <p className="text-sm font-medium text-fg-sec">Nenhuma criação ainda</p>
                <p className="text-[12px] text-fg-muted">Quando você gerar imagens, elas aparecerão aqui.</p>
              </div>
            ) : null}

            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-border px-5 py-2 text-[13px] font-medium text-fg-muted transition-all hover:bg-surface hover:text-fg-sec"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      Carregando...
                    </>
                  ) : (
                    'Carregar mais'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'liked' && (
          <>
            <div className="profile-grid pt-4">
              {isLoadingLiked
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="masonry-item h-56 rounded-xl bg-surface"
                    >
                      <div className="h-full w-full animate-pulse rounded-xl bg-inset" />
                    </div>
                  ))
                : null}

              {!isLoadingLiked && likedImages.length
                ? likedImages.map((image) => (
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

            {!isLoadingLiked && likedImages.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center gap-2 py-16 text-center">
                <span className="material-symbols-outlined text-[28px] text-fg-muted">favorite</span>
                <p className="text-sm font-medium text-fg-sec">Nenhuma curtida ainda</p>
                <p className="text-[12px] text-fg-muted">Imagens que você curtir aparecerão aqui.</p>
              </div>
            ) : null}

            {hasNextLikedPage && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-border px-5 py-2 text-[13px] font-medium text-fg-muted transition-all hover:bg-surface hover:text-fg-sec"
                  onClick={() => fetchNextLikedPage()}
                  disabled={isFetchingNextLikedPage}
                >
                  {isFetchingNextLikedPage ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      Carregando...
                    </>
                  ) : (
                    'Carregar mais'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ImageDetailsDialog
        image={selectedImage}
        onClose={handleCloseDialog}
        onToggleLike={(image) => likeMutation.mutate(image)}
        onDownload={(image) => handleDownload(image)}
        onShare={handleShare}
        onUpdateVisibility={(image, isPublic) => visibilityMutation.mutate({ image, isPublic })}
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

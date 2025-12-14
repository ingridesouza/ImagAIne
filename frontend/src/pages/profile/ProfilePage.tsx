import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import clsx from 'clsx';
import { GalleryCard } from '@/features/images/components/GalleryCard';
import { ImageDetailsDialog } from '@/features/images/components/ImageDetailsDialog';
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
  const cachedProfile = queryClient.getQueryData<UserProfile>(QUERY_KEYS.profile);
  const storeUser = useAuthStore((state) => state.user);
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);

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

  const { data: myImagesResponse, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });

  const images = myImagesResponse?.results ?? [];
  const readyImages = images.filter((image) => image.status === 'READY');

  const totalCreations = myImagesResponse?.count ?? images.length;
  const totalLikes = readyImages.reduce((sum, image) => sum + (image.like_count ?? 0), 0);
  const totalDownloads = readyImages.reduce((sum, image) => sum + (image.download_count ?? 0), 0);

  const likeMutation = useMutation({
    mutationFn: (image: ImageRecord) =>
      image.is_liked ? imagesApi.unlike(image.id) : imagesApi.like(image.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() }),
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ image, isPublic }: { image: ImageRecord; isPublic: boolean }) =>
      imagesApi.updateShare(image.id, isPublic),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() }),
  });

  const handleDownload = async (image: ImageRecord) => {
    const data = await imagesApi.registerDownload(image.id);
    if (data.download_url) {
      window.open(data.download_url, '_blank');
    }
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() });
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
    <div className="flex min-h-screen flex-col bg-background-dark text-white">
      <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-60">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Capa de ${fullName}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2e1065] via-[#581c87] to-[#1e1b4b]" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          </>
        )}
        <div className="absolute bottom-4 right-6 flex gap-2">
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/60 disabled:opacity-60"
            disabled={coverUploadMutation.isPending}
          >
            <span className="material-symbols-outlined text-[16px]">
              {coverUploadMutation.isPending ? 'hourglass_empty' : 'edit'}
            </span>
            {coverUploadMutation.isPending ? 'Atualizando...' : 'Alterar capa'}
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

      <div className="relative -mt-8 px-4 pb-6 sm:-mt-10 sm:px-6 md:-mt-12 md:px-8 lg:px-16 xl:px-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="group relative h-32 w-32 overflow-hidden rounded-full border-4 border-background-dark bg-surface-dark shadow-2xl md:h-36 md:w-36 disabled:opacity-60"
                aria-label="Alterar foto de perfil"
                disabled={avatarUploadMutation.isPending}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={`Avatar de ${fullName}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-emerald-500/20 text-2xl font-bold text-primary">
                    {getInitials(fullName, username)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="material-symbols-outlined text-white">
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
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background-dark bg-primary text-background-dark"
                  title="Verificado"
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-2 pb-2">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{fullName}</h1>
                {profile?.is_verified ? (
                  <span className="flex items-center gap-1 rounded-full border border-accent-purple/40 bg-accent-purple/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-accent-purple">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Verificado
                  </span>
                ) : null}
              </div>
              <p className="text-sm font-medium text-gray-400">@{username}</p>
              <p className="mt-1 max-w-2xl text-sm text-gray-300">{bio}</p>

              <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-400 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">imagesmode</span>
                  <strong className="text-white">{totalCreations.toLocaleString('pt-BR')}</strong>
                  <span>criações</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">favorite</span>
                  <strong className="text-white">{totalLikes.toLocaleString('pt-BR')}</strong>
                  <span>likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">download</span>
                  <strong className="text-white">{totalDownloads.toLocaleString('pt-BR')}</strong>
                  <span>downloads</span>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 pb-2 md:w-auto md:flex-row md:items-center">
              <button
                type="button"
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/20 md:flex-initial"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Editar perfil
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
                  aria-label="Compartilhar perfil"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
                  aria-label="Mais ações"
                >
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {uploadError ? (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20">
          <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-100">
            {uploadError}
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 md:px-8 lg:px-16 xl:px-20">
        <div className="no-scrollbar flex gap-6 overflow-x-auto pb-4">
          <button
            type="button"
            className="relative flex-shrink-0 py-4 text-sm font-medium text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-accent-purple">grid_view</span>
              <span>Criações</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-accent-purple shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          </button>
          <button
            type="button"
            className="relative flex-shrink-0 py-4 text-sm font-medium text-gray-500 transition-colors hover:text-gray-300"
            disabled
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              <span>Curtidas</span>
            </div>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Tudo', 'Retratos', 'Paisagens', 'Cyberpunk', '3D'].map((chip) => (
              <button
                key={chip}
                type="button"
                className={clsx(
                  'whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors shadow-sm',
                  chip === 'Tudo'
                    ? 'border-white/10 bg-white text-background-dark'
                    : 'border-white/10 bg-surface-dark text-gray-300 hover:border-white/30 hover:text-white',
                )}
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Ordenar por:</span>
            <select className="bg-background-dark text-white focus:ring-0">
              <option>Mais recentes</option>
              <option>Mais baixadas</option>
              <option>Mais curtidas</option>
            </select>
          </div>
        </div>

        <div className="profile-grid pt-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="masonry-item h-64 rounded-[22px] bg-surface-dark/80"
                >
                  <div className="h-full w-full animate-pulse rounded-[22px] bg-gradient-to-br from-white/5 via-white/10 to-white/5" />
                </div>
              ))
            : null}

          {!isLoading && readyImages.length
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

        {!isLoading && readyImages.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-surface-dark/60 px-6 py-10 text-center text-gray-400">
            <span className="material-symbols-outlined text-[32px] text-primary">auto_awesome</span>
            <p className="text-lg font-semibold text-white">Nenhuma criação ainda</p>
            <p className="text-sm text-gray-500">Quando você gerar imagens, elas aparecerão aqui.</p>
          </div>
        ) : null}
      </div>

      <ImageDetailsDialog
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onToggleLike={(image) => likeMutation.mutate(image)}
        onDownload={(image) => handleDownload(image)}
        onUpdateVisibility={(image, isPublic) => visibilityMutation.mutate({ image, isPublic })}
        isUpdatingVisibility={visibilityMutation.isPending}
      />
    </div>
  );
};

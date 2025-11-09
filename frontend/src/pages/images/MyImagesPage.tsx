import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { ImageGrid } from '@/features/images/components/ImageGrid';
import type { ImageRecord } from '@/features/images/types';
import { QUERY_KEYS } from '@/lib/constants';

export const MyImagesPage = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });
  const images: ImageRecord[] = response?.results ?? [];

  const visibilityMutation = useMutation({
    mutationFn: (image: ImageRecord) => imagesApi.updateShare(image.id, !image.is_public),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (image: ImageRecord) =>
      image.is_liked ? imagesApi.unlike(image.id) : imagesApi.like(image.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() }),
  });

  const handleDownload = async (image: ImageRecord) => {
    const data = await imagesApi.registerDownload(image.id);
    if (data.download_url) {
      window.open(data.download_url, '_blank');
    }
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() });
  };

  return (
    <section className="grid" style={{ gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0 }}>Minhas imagens</h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            Gerencie visibilidade, downloads e prepare suas melhores criações para o feed público.
          </p>
        </div>
      </div>

      <ImageGrid
        images={images}
        isLoading={isLoading || visibilityMutation.isPending}
        canToggleVisibility
        onToggleVisibility={(image) => visibilityMutation.mutate(image)}
        onToggleLike={(image) => likeMutation.mutate(image)}
        onDownload={handleDownload}
      />
    </section>
  );
};

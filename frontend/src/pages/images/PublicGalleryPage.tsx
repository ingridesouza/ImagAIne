import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { ImageGrid } from '@/features/images/components/ImageGrid';
import type { ImageRecord } from '@/features/images/types';
import { QUERY_KEYS } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';

export const PublicGalleryPage = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: QUERY_KEYS.publicImages(debouncedSearch),
    queryFn: () => imagesApi.fetchPublicImages(debouncedSearch),
  });
  const images: ImageRecord[] = response?.results ?? [];

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

  return (
    <section className="grid" style={{ gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0 }}>Galeria pública</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Descubra as gerações da comunidade e apoie curtindo.</p>
        </div>
        <Input
          placeholder="Buscar por prompt..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ maxWidth: '260px' }}
        />
      </div>

      <ImageGrid
        images={images}
        isLoading={isLoading}
        onToggleLike={(image) => likeMutation.mutate(image)}
        onDownload={handleDownload}
      />
    </section>
  );
};

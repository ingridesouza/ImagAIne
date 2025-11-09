import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { ImageGrid } from '@/features/images/components/ImageGrid';
import { StatCard } from '@/components/ui/StatCard';
import { QUERY_KEYS } from '@/lib/constants';
import type { ImageRecord } from '@/features/images/types';

export const DashboardPage = () => {
  const { data: myImagesResponse, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });

  const myImages: ImageRecord[] = myImagesResponse?.results ?? [];
  const readyCount = myImages.filter((image) => image.status === 'READY').length;
  const generatingCount = myImages.filter((image) => image.status === 'GENERATING').length;
  const publicCount = myImages.filter((image) => image.is_public).length;
  const latest = myImages.slice(0, 3);

  return (
    <section className="grid" style={{ gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0 }}>Visão geral</h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            Acompanhe o status das criações e compartilhe com a comunidade.
          </p>
        </div>
        <Link to="/generate" className="button button--primary">
          Nova geração
        </Link>
      </div>

      <div className="grid --two">
        <StatCard label="Imagens prontas" value={readyCount} helper="Disponíveis para download" />
        <StatCard label="Em processamento" value={generatingCount} helper="Fila Celery + Hugging Face" />
        <StatCard label="Galeria pública" value={publicCount} helper="Visíveis no feed global" />
        <StatCard label="Total" value={myImages.length} helper="Inclui falhas e imagens privadas" />
      </div>

      <div>
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Últimas criações</h2>
          <Link to="/my-images" style={{ color: '#6366f1' }}>
            Ver todas
          </Link>
        </div>
        <ImageGrid images={latest} isLoading={isLoading} canToggleVisibility={false} />
      </div>
    </section>
  );
};

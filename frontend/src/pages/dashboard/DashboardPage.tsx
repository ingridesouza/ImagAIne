import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { ImageGrid } from '@/features/images/components/ImageGrid';
import { StatCard } from '@/components/ui/StatCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-white">Visão geral</h1>
          <p className="m-0 mt-1 text-sm text-white/40">
            Acompanhe o status das criações e compartilhe com a comunidade.
          </p>
        </div>
        <Link to="/generate" className="button button--primary">
          Nova geração
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Imagens prontas" value={readyCount} helper="Disponíveis para download" />
        <StatCard label="Em processamento" value={generatingCount} helper="Fila Celery + Hugging Face" />
        <StatCard label="Galeria pública" value={publicCount} helper="Visíveis no feed global" />
        <StatCard label="Total" value={myImages.length} helper="Inclui falhas e imagens privadas" />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-lg font-medium text-white">Últimas criações</h2>
          <Link to="/my-images" className="text-sm text-flow-300 hover:text-flow-200">
            Ver todas
          </Link>
        </div>
        <ImageGrid images={latest} isLoading={isLoading} canToggleVisibility={false} />
      </div>
    </section>
  );
};

import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { imagesApi } from '@/features/images/api';
import { ImageGrid } from '@/features/images/components/ImageGrid';
import { StatCard } from '@/components/ui/StatCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { QUERY_KEYS } from '@/lib/constants';
import type { ImageRecord } from '@/features/images/types';

function StyleSuggestionsWidget() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['style-suggestions'],
    queryFn: () => imagesApi.fetchStyleSuggestions(5),
    retry: false,
  });

  if (isLoading || !data || data.results.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <h2 className="m-0 text-lg font-medium text-fg">Sugestões para você</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {data.results.map((suggestion) => (
          <button
            key={suggestion.label}
            onClick={() => navigate('/generate', { state: { prompt: suggestion.example_prompt } })}
            className="flex-shrink-0 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-accent hover:bg-accent-soft"
          >
            <span className="block text-sm font-medium text-fg">{suggestion.label}</span>
            <span className="mt-0.5 block text-xs text-fg-muted line-clamp-1">{suggestion.example_prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

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
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-fg">Visão geral</h1>
          <p className="m-0 mt-1 text-sm text-fg-muted">
            Acompanhe o status das criações e compartilhe com a comunidade.
          </p>
        </div>
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-fg-inv transition-all duration-fast hover:bg-accent-hover active:scale-[0.97]"
        >
          Nova geração
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Imagens prontas" value={readyCount} helper="Disponíveis para download" />
        <StatCard label="Em processamento" value={generatingCount} helper="Fila Celery + Hugging Face" />
        <StatCard label="Galeria pública" value={publicCount} helper="Visíveis no feed global" />
        <StatCard label="Total" value={myImages.length} helper="Inclui falhas e imagens privadas" />
      </div>

      <StyleSuggestionsWidget />

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-lg font-medium text-fg">Últimas criações</h2>
          <Link to="/my-images" className="text-sm text-accent hover:text-accent-hover">
            Ver todas
          </Link>
        </div>
        <ImageGrid images={latest} isLoading={isLoading} canToggleVisibility={false} />
      </div>
    </section>
  );
};

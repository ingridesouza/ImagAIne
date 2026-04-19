import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ArrowRight, Image, Zap, Globe, Layers } from 'lucide-react';
import { imagesApi } from '@/features/images/api';
import { ImageGrid } from '@/features/images/components/ImageGrid';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/features/auth/store';
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
    <div className="mt-8">
      <h2 className="mb-4 text-base font-semibold text-fg">Sugestões para você</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {data.results.map((suggestion) => (
          <button
            key={suggestion.label}
            onClick={() => navigate('/generate', { state: { prompt: suggestion.example_prompt } })}
            className="group flex-shrink-0 rounded-2xl bg-white dark:bg-white/[0.06] p-4 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] min-w-[200px]"
          >
            <Sparkles className="mb-2 h-4 w-4 text-accent" />
            <span className="block text-sm font-medium text-fg">{suggestion.label}</span>
            <span className="mt-1 block text-xs text-fg-muted line-clamp-2">{suggestion.example_prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const STAT_ICONS = [
  { icon: Image, gradient: 'from-green-400 to-emerald-600' },
  { icon: Zap, gradient: 'from-amber-400 to-orange-600' },
  { icon: Globe, gradient: 'from-blue-400 to-indigo-600' },
  { icon: Layers, gradient: 'from-purple-400 to-violet-600' },
];

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const { data: myImagesResponse, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });

  const myImages: ImageRecord[] = myImagesResponse?.results ?? [];
  const readyCount = myImages.filter((image) => image.status === 'READY').length;
  const generatingCount = myImages.filter((image) => image.status === 'GENERATING').length;
  const publicCount = myImages.filter((image) => image.is_public).length;
  const latest = myImages.slice(0, 6);

  const firstName = user?.first_name || user?.username || 'Criador';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = [
    { label: 'Prontas', value: readyCount, ...STAT_ICONS[0] },
    { label: 'Gerando', value: generatingCount, ...STAT_ICONS[1] },
    { label: 'Públicas', value: publicCount, ...STAT_ICONS[2] },
    { label: 'Total', value: myImages.length, ...STAT_ICONS[3] },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          {greeting}, {firstName}
        </h1>
        <p className="mt-2 text-base text-fg-muted">
          Continue criando. Sua imaginação é o limite.
        </p>
      </div>

      {/* CTA Card — glassmorphism */}
      <Link
        to="/chat"
        className="group mb-8 flex items-center justify-between rounded-3xl bg-gradient-to-r from-flow-500/10 via-flow-600/5 to-transparent p-6 transition-all duration-300 hover:from-flow-500/15 hover:shadow-lg dark:from-flow-500/[0.08]"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-flow-500 to-flow-700 shadow-lg shadow-flow-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="block text-base font-semibold text-fg">Agente Criativo</span>
            <span className="block text-sm text-fg-muted">Descreva sua ideia e eu crio para você</span>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-fg-muted transition-transform duration-300 group-hover:translate-x-1" />
      </Link>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, gradient }) => (
          <div
            key={label}
            className="group rounded-2xl bg-white dark:bg-white/[0.04] p-5 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div className={`mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <span className="block text-2xl font-bold tracking-tight text-fg">{value}</span>
            <span className="block text-xs text-fg-muted mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      <StyleSuggestionsWidget />

      {/* Latest creations */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-fg">Últimas criações</h2>
          <Link to="/my-images" className="flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ImageGrid images={latest} isLoading={isLoading} canToggleVisibility={false} />
      </div>
    </section>
  );
};

import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ArrowRight, Image, Zap, Globe, Layers, Plus, MessageSquare } from 'lucide-react';
import { imagesApi } from '@/features/images/api';
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
    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
      {data.results.map((s) => (
        <button
          key={s.label}
          onClick={() => navigate('/generate', { state: { prompt: s.example_prompt } })}
          className="group flex-shrink-0 rounded-2xl bg-white dark:bg-white/[0.04] p-4 text-left shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] min-w-[180px]"
        >
          <Sparkles className="mb-2 h-3.5 w-3.5 text-accent" />
          <span className="block text-sm font-medium text-fg">{s.label}</span>
          <span className="mt-1 block text-xs text-fg-muted line-clamp-2">{s.example_prompt}</span>
        </button>
      ))}
    </div>
  );
}

const STAT_CONFIG = [
  { key: 'ready', icon: Image, gradient: 'from-emerald-400 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { key: 'generating', icon: Zap, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { key: 'public', icon: Globe, gradient: 'from-blue-400 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { key: 'total', icon: Layers, gradient: 'from-violet-400 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-500/10' },
];

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { data: myImagesResponse, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });

  const myImages: ImageRecord[] = myImagesResponse?.results ?? [];
  const readyCount = myImages.filter((i) => i.status === 'READY').length;
  const generatingCount = myImages.filter((i) => i.status === 'GENERATING').length;
  const publicCount = myImages.filter((i) => i.is_public).length;
  const latest = myImages.filter((i) => i.status === 'READY' && i.image_url).slice(0, 8);

  const firstName = user?.first_name || user?.username || 'Criador';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  if (isLoading) return <DashboardSkeleton />;

  const stats = [
    { label: 'Prontas', value: readyCount, ...STAT_CONFIG[0] },
    { label: 'Gerando', value: generatingCount, ...STAT_CONFIG[1] },
    { label: 'Públicas', value: publicCount, ...STAT_CONFIG[2] },
    { label: 'Total', value: myImages.length, ...STAT_CONFIG[3] },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      {/* ---- Hero: greeting + quick actions ---- */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-fg">
            {greeting}, <span className="text-accent">{firstName}</span>
          </h1>
          <p className="mt-2 text-lg text-fg-muted">O que vamos criar hoje?</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-fg shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquare className="h-4 w-4 text-accent" />
            Agente
          </Link>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-flow-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent/25 transition-all duration-200 hover:shadow-md hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Criar imagem
          </Link>
        </div>
      </div>

      {/* ---- Stats row ---- */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, gradient, bg }) => (
          <div
            key={label}
            className={`rounded-2xl ${bg} p-4 transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <div className={`flex size-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-fg">{value}</span>
            </div>
            <span className="mt-2 block text-xs font-medium text-fg-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* ---- Suggestions ---- */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-fg-muted">Sugestões</h2>
        <StyleSuggestionsWidget />
      </div>

      {/* ---- Latest creations ---- */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">Últimas criações</h2>
          <Link to="/my-images" className="flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-hover">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white dark:bg-white/[0.03] py-16 text-center shadow-xs">
            <Image className="h-10 w-10 text-fg-muted/40" />
            <p className="text-sm text-fg-muted">Nenhuma criação ainda</p>
            <button onClick={() => navigate('/generate')} className="mt-1 text-sm font-medium text-accent hover:text-accent-hover">
              Criar primeira imagem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((img) => (
              <Link
                key={img.id}
                to={`/images/${img.id}/edit`}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-inset shadow-xs transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <img src={img.image_url!} alt={img.prompt || ''} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="absolute bottom-0 left-0 right-0 p-3 text-xs text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100 line-clamp-2">
                  {img.prompt}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

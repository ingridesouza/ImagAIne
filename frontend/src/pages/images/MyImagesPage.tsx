import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { ImageGrid } from '@/features/images/components/ImageGrid';
import type { ImageRecord } from '@/features/images/types';
import { QUERY_KEYS } from '@/lib/constants';
import { Input } from '@/components/ui/Input';

const VISIBILITY_FILTERS = [
  { label: 'Todas', value: 'all' as const, description: 'Coleção completa' },
  { label: 'Públicas', value: 'public' as const, description: 'Visíveis no feed' },
  { label: 'Privadas', value: 'private' as const, description: 'Somente você vê' },
];

type VisibilityFilter = (typeof VISIBILITY_FILTERS)[number]['value'];

export const MyImagesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<VisibilityFilter>('all');

  const { data: response, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });
  const images: ImageRecord[] = useMemo(() => response?.results ?? [], [response?.results]);

  const totalDownloads = useMemo(
    () => images.reduce((sum, image) => sum + (image.download_count ?? 0), 0),
    [images],
  );
  const totalPublic = useMemo(() => images.filter((image) => image.is_public).length, [images]);
  const totalPrivate = useMemo(() => images.length - totalPublic, [images.length, totalPublic]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredImages = useMemo(() => {
    if (images.length === 0) {
      return images;
    }
    return images.filter((image) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'public' && image.is_public) ||
        (activeFilter === 'private' && !image.is_public);

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${image.prompt} ${image.tags?.join(' ') ?? ''}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [images, activeFilter, normalizedSearch]);

  const visibilityMutation = useMutation({
    mutationFn: (image: ImageRecord) => imagesApi.updateShare(image.id, !image.is_public),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() }),
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

  const heroStats = [
    { label: 'Total na biblioteca', value: images.length },
    { label: 'Visíveis no feed', value: totalPublic },
    { label: 'Downloads gerados', value: totalDownloads },
  ];

  const summary = [
    { label: 'Privadas', value: totalPrivate },
    { label: 'Curtidas médias', value: images.length ? Math.round(totalDownloads / images.length) : 0 },
  ];

  return (
    <section className="my-images">
      <div className="my-images__hero glass-panel">
        <div className="my-images__hero-copy">
          <p className="my-images__eyebrow">Biblioteca</p>
          <h1>Minhas imagens</h1>
          <p className="my-images__lead">
            Centralize, revise e ajuste a visibilidade das suas criações antes de compartilhar com a comunidade.
          </p>

          <div className="my-images__actions">
            <Input
              placeholder="Procurar por prompt ou tag..."
              value={search}
              className="my-images__input"
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="my-images__actions-buttons">
              <button
                type="button"
                className="my-images__clear"
                onClick={() => setSearch('')}
                disabled={!search}
              >
                Limpar
              </button>
              <Link to="/images/generate" className="button button--primary my-images__action">
                Criar nova imagem
              </Link>
            </div>
          </div>

          <div className="my-images__stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="my-images__stat">
                <span>{stat.label}</span>
                <strong>{stat.value.toLocaleString('pt-BR')}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="my-images__panel">
          <header>
            <span className="my-images__panel-label">Resumo rápido</span>
            <strong>Fluxo das suas criações</strong>
          </header>
          <dl>
            {summary.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value.toLocaleString('pt-BR')}</dd>
              </div>
            ))}
          </dl>
          <p>Atualize descrições e garanta que as peças certas estejam no palco certo.</p>
        </div>
      </div>

      <div className="my-images__toolbar glass-panel">
        <div className="my-images__filters">
          {VISIBILITY_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={clsx('my-images__filter', {
                'my-images__filter--active': activeFilter === option.value,
              })}
              onClick={() => setActiveFilter(option.value)}
            >
              <span>{option.label}</span>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
        <div className="my-images__legend">
          <span>Visíveis: {totalPublic.toLocaleString('pt-BR')}</span>
          <span>Privadas: {totalPrivate.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <div className="my-images__grid glass-panel">
        <ImageGrid
          images={filteredImages}
          isLoading={isLoading || visibilityMutation.isPending}
          canToggleVisibility
          onToggleVisibility={(image) => visibilityMutation.mutate(image)}
          onToggleLike={(image) => likeMutation.mutate(image)}
          onDownload={handleDownload}
        />
      </div>
    </section>
  );
};

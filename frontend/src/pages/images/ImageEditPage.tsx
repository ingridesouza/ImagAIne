import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Wand2, Palette, Loader2, Check } from 'lucide-react';
import { imagesApi } from '@/features/images/api';
import type { ImageRecord } from '@/features/images/types';
import { QUERY_KEYS } from '@/lib/constants';

const STYLES = [
  { value: 'photorealistic', label: 'Fotorrealista' },
  { value: 'anime', label: 'Anime' },
  { value: 'digital_art', label: 'Arte Digital' },
  { value: 'oil_painting', label: 'Pintura a Óleo' },
  { value: 'watercolor', label: 'Aquarela' },
  { value: '3d_render', label: 'Render 3D' },
  { value: 'pixel_art', label: 'Pixel Art' },
  { value: 'sketch', label: 'Esboço' },
];

export const ImageEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'variations' | 'restyle'>('variations');
  const [strength, setStrength] = useState(0.65);
  const [variationCount, setVariationCount] = useState(2);
  const [selectedStyle, setSelectedStyle] = useState('anime');
  const [results, setResults] = useState<ImageRecord[]>([]);

  const { data: myImages } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });

  const sourceImage = myImages?.results.find((img) => img.id === Number(id));

  const variationMutation = useMutation({
    mutationFn: () => imagesApi.generateVariations(Number(id), variationCount, strength),
    onSuccess: (data) => {
      setResults(data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() });
      toast.success(`${data.length} variação(ões) na fila de geração.`);
    },
    onError: () => toast.error('Erro ao gerar variações.'),
  });

  const restyleMutation = useMutation({
    mutationFn: () => imagesApi.restyleImage(Number(id), selectedStyle, strength),
    onSuccess: (data) => {
      setResults([data]);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() });
      toast.success('Restyle na fila de geração.');
    },
    onError: () => toast.error('Erro ao aplicar estilo.'),
  });

  const isPending = variationMutation.isPending || restyleMutation.isPending;

  if (!sourceImage) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-fg-muted">Carregando imagem...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
      <Link to="/my-images" className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Minhas imagens
      </Link>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-fg">Editar imagem</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Source image */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <img
              src={sourceImage.image_url || ''}
              alt={sourceImage.prompt || 'Imagem original'}
              className="w-full object-contain"
              style={{ maxHeight: '500px' }}
            />
          </div>
          {sourceImage.prompt && (
            <p className="mt-3 text-xs text-fg-muted italic line-clamp-2">{sourceImage.prompt}</p>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-fg">Resultados</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {results.map((img) => (
                  <div key={img.id} className="overflow-hidden rounded-xl border border-border">
                    {img.status === 'READY' && img.image_url ? (
                      <img src={img.image_url} alt="" className="aspect-square w-full object-cover" />
                    ) : img.status === 'GENERATING' ? (
                      <div className="flex aspect-square items-center justify-center bg-surface">
                        <Loader2 className="h-6 w-6 animate-spin text-accent" />
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-surface">
                        <Check className="h-6 w-6 text-fg-muted" />
                      </div>
                    )}
                    <div className="px-2 py-1.5 text-[10px] text-fg-muted">
                      {img.generation_type} — {img.status.toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls panel */}
        <div className="space-y-5">
          {/* Mode toggle */}
          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            <button
              onClick={() => setMode('variations')}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                mode === 'variations' ? 'bg-accent text-fg-inv' : 'text-fg-muted hover:text-fg'
              }`}
            >
              <Wand2 className="mr-1.5 inline h-3.5 w-3.5" />
              Variações
            </button>
            <button
              onClick={() => setMode('restyle')}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                mode === 'restyle' ? 'bg-accent text-fg-inv' : 'text-fg-muted hover:text-fg'
              }`}
            >
              <Palette className="mr-1.5 inline h-3.5 w-3.5" />
              Mudar estilo
            </button>
          </div>

          {/* Strength slider */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-fg-sec">Força da transformação</label>
              <span className="text-xs font-mono text-fg-muted">{strength.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.95}
              step={0.05}
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-[10px] text-fg-muted">
              <span>Sutil</span>
              <span>Drástico</span>
            </div>
          </div>

          {mode === 'variations' ? (
            <>
              {/* Count selector */}
              <div>
                <label className="mb-2 block text-xs font-medium text-fg-sec">Quantidade</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setVariationCount(n)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                        variationCount === n
                          ? 'border-accent bg-accent-soft text-accent'
                          : 'border-border text-fg-muted hover:border-accent/40'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => variationMutation.mutate()}
                disabled={isPending}
                className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-fg-inv transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {variationMutation.isPending ? (
                  <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Gerando...</>
                ) : (
                  `Gerar ${variationCount} variação(ões)`
                )}
              </button>
            </>
          ) : (
            <>
              {/* Style selector */}
              <div>
                <label className="mb-2 block text-xs font-medium text-fg-sec">Estilo alvo</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedStyle(s.value)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        selectedStyle === s.value
                          ? 'border-accent bg-accent-soft text-accent'
                          : 'border-border text-fg-sec hover:border-accent/40'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => restyleMutation.mutate()}
                disabled={isPending}
                className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-fg-inv transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {restyleMutation.isPending ? (
                  <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Aplicando...</>
                ) : (
                  `Aplicar estilo: ${STYLES.find((s) => s.value === selectedStyle)?.label}`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

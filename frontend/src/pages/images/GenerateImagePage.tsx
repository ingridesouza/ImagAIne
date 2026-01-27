import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { imagesApi } from '@/features/images/api';
import type { GenerateImagePayload, ImageRecord } from '@/features/images/types';
import { QUERY_KEYS } from '@/lib/constants';

const schema = z.object({
  prompt: z.string().min(20, 'Conte um pouco mais sobre sua imagem'),
  negative_prompt: z.string().optional(),
  aspect_ratio: z.enum(['1:1', '16:9', '4:3', '9:16', '3:4', '2:1', '3:2']),
  seed: z
    .string()
    .optional()
    .refine((value) => !value || Number(value) >= 0, { message: 'Seed deve ser um número positivo' }),
});

type FormValues = z.infer<typeof schema>;

const aspectRatioOptions: { label: string; value: FormValues['aspect_ratio']; shape: 'square' | 'landscape' | 'portrait' }[] =
  [
    { label: '1:1', value: '1:1', shape: 'square' },
    { label: '16:9', value: '16:9', shape: 'landscape' },
    { label: '9:16', value: '9:16', shape: 'portrait' },
    { label: '4:3', value: '4:3', shape: 'landscape' },
    { label: '3:4', value: '3:4', shape: 'portrait' },
  ];

// Modos de criação com intenção
type CreationMode = {
  id: string;
  label: string;
  icon: string;
  description: string;
  promptSuffix: string;
  samplePrompts: string[];
};

const creationModes: CreationMode[] = [
  {
    id: 'cinematic',
    label: 'Cena cinematográfica',
    icon: 'movie',
    description: 'Momentos dramáticos de filme',
    promptSuffix: ', cinematic lighting, dramatic atmosphere, film still, movie scene, depth of field, anamorphic lens',
    samplePrompts: [
      'Um detetive solitário observando a cidade chuvosa através de uma janela escura',
      'Dois samurais se enfrentando ao pôr do sol em um campo de bambu',
      'Uma astronauta flutuando em silêncio no espaço, olhando para a Terra distante',
    ],
  },
  {
    id: 'concept_art',
    label: 'Conceito artístico',
    icon: 'palette',
    description: 'Arte conceitual e ilustrações',
    promptSuffix: ', concept art, digital painting, highly detailed, artstation trending, illustration',
    samplePrompts: [
      'Floresta mágica com árvores cristalinas e criaturas luminescentes',
      'Fortaleza steampunk flutuante entre as nuvens ao amanhecer',
      'Portal dimensional abrindo em uma biblioteca antiga e misteriosa',
    ],
  },
  {
    id: 'character',
    label: 'Personagem',
    icon: 'person',
    description: 'Design de personagens únicos',
    promptSuffix: ', character design, full body portrait, detailed features, expressive pose, professional character art',
    samplePrompts: [
      'Guerreira élfica com armadura de cristal e cabelos prateados',
      'Inventor excêntrico com óculos mecânicos e avental de ferramentas',
      'Jovem maga urbana com tatuagens rúnicas brilhantes nos braços',
    ],
  },
  {
    id: 'product',
    label: 'Produto / Publicidade',
    icon: 'shopping_bag',
    description: 'Imagens comerciais e produtos',
    promptSuffix: ', product photography, professional lighting, commercial shot, clean background, advertising quality',
    samplePrompts: [
      'Frasco de perfume luxuoso com respingos de água e pétalas de rosa',
      'Tênis esportivo futurista flutuando com partículas de energia',
      'Relógio elegante em superfície refletiva com iluminação dramática',
    ],
  },
  {
    id: 'environment',
    label: 'Ambiente / Cenário',
    icon: 'landscape',
    description: 'Paisagens e ambientes imersivos',
    promptSuffix: ', environment art, scenic view, atmospheric perspective, detailed landscape, matte painting quality',
    samplePrompts: [
      'Cidade flutuante acima das nuvens durante o pôr do sol dourado',
      'Caverna de cristais gigantes refletindo luz bioluminescente',
      'Ruínas de um templo antigo sendo reclamadas pela selva tropical',
    ],
  },
];

// Placeholders dinâmicos por modo
const modePlaceholders: Record<string, string> = {
  cinematic: 'Descreva uma cena dramática, com luz e atmosfera...',
  concept_art: 'Descreva um mundo, criatura ou conceito fantástico...',
  character: 'Descreva a aparência, roupas e personalidade...',
  product: 'Descreva o produto e como deve ser apresentado...',
  environment: 'Descreva o lugar, hora do dia e atmosfera...',
};

// Prompts padrão quando nenhum modo está selecionado
const defaultSamplePrompts = [
  'Um astronauta meditando em um jardim zen flutuante, luz dourada, estilo cinematográfico',
  'Retrato hiper-realista de uma inventora steampunk com óculos de latão, fumaça ao fundo',
  'Cidade cyberpunk submersa à noite, letreiros neon refletindo na água, chuva leve',
];

// ========== CHIPS DE REFINAMENTO ==========
type RefinementChip = {
  id: string;
  label: string;
  tags: string;
  tooltip: string;
};

const styleChips: RefinementChip[] = [
  { id: 'photorealistic', label: 'Fotorrealista', tags: 'photorealistic, hyperrealistic', tooltip: 'Aparência muito real' },
  { id: 'illustration', label: 'Ilustração', tags: 'digital illustration, detailed illustration', tooltip: 'Estilo ilustrado' },
  { id: 'oil_painting', label: 'Pintura a óleo', tags: 'oil painting style', tooltip: 'Textura de pintura' },
  { id: 'anime', label: 'Anime', tags: 'anime style, cel shading', tooltip: 'Traço tipo anime' },
  { id: '3d_render', label: '3D render', tags: '3D render, studio render', tooltip: 'Visual 3D' },
  { id: 'minimalist', label: 'Minimalista', tags: 'minimalist, clean composition', tooltip: 'Simples e limpo' },
];

const lightChips: RefinementChip[] = [
  { id: 'natural', label: 'Luz natural', tags: 'natural daylight', tooltip: 'Luz do dia' },
  { id: 'golden', label: 'Luz dourada', tags: 'golden hour lighting', tooltip: 'Tom quente do pôr do sol' },
  { id: 'neon', label: 'Neon', tags: 'neon lights', tooltip: 'Cores neon' },
  { id: 'dramatic', label: 'Dramática', tags: 'dramatic lighting, chiaroscuro', tooltip: 'Contraste forte' },
  { id: 'soft', label: 'Suave', tags: 'soft diffused light', tooltip: 'Luz macia' },
  { id: 'night', label: 'Noturna', tags: 'night scene, moonlight', tooltip: 'Clima noturno' },
];

const framingChips: RefinementChip[] = [
  { id: 'closeup', label: 'Close-up', tags: 'close-up shot', tooltip: 'Foco em detalhe' },
  { id: 'portrait', label: 'Retrato', tags: 'portrait shot', tooltip: 'Foco na pessoa' },
  { id: 'fullbody', label: 'Corpo inteiro', tags: 'full body shot', tooltip: 'Mostra o corpo todo' },
  { id: 'panoramic', label: 'Panorâmico', tags: 'wide angle, panoramic', tooltip: 'Mostra o cenário' },
  { id: 'birdseye', label: 'De cima', tags: "bird's eye view", tooltip: 'Visão de cima' },
  { id: 'lowangle', label: 'De baixo', tags: 'low angle shot', tooltip: 'Visão de baixo' },
];

export const GenerateImagePage = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedLight, setSelectedLight] = useState<string | null>(null);
  const [selectedFraming, setSelectedFraming] = useState<string | null>(null);
  const location = useLocation();
  const presetPrompt = (location.state as { promptDraft?: string } | undefined)?.promptDraft ?? '';
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: presetPrompt,
      negative_prompt: '',
      aspect_ratio: '1:1',
      seed: '',
    },
  });

  const aspectRatio = watch('aspect_ratio');
  const promptValue = watch('prompt');

  useEffect(() => {
    if (presetPrompt) {
      setValue('prompt', presetPrompt, { shouldValidate: true, shouldDirty: false });
    }
  }, [presetPrompt, setValue]);

  const { data: myImagesResponse } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });

  const myImages: ImageRecord[] = myImagesResponse?.results ?? [];
  const queue = myImages.filter((image) => image.status === 'GENERATING');

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: GenerateImagePayload) => imagesApi.generate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() });
      reset({ prompt: '', negative_prompt: '', aspect_ratio: '1:1', seed: '' });
      setShowAdvanced(false);
      setSelectedMode(null);
      setSelectedStyle(null);
      setSelectedLight(null);
      setSelectedFraming(null);
    },
  });

  const currentMode = creationModes.find((m) => m.id === selectedMode);
  const placeholder = selectedMode
    ? modePlaceholders[selectedMode]
    : 'Descreva sua imaginação em detalhes...';

  // Função para evitar duplicatas case-insensitive
  const buildFinalPrompt = (basePrompt: string): string => {
    let finalPrompt = basePrompt;

    // Adiciona sufixo do modo
    const modeSuffix = currentMode?.promptSuffix ?? '';
    if (modeSuffix) {
      finalPrompt += modeSuffix;
    }

    // Coleta tags dos chips selecionados
    const chipTags: string[] = [];
    const styleChip = styleChips.find((c) => c.id === selectedStyle);
    const lightChip = lightChips.find((c) => c.id === selectedLight);
    const framingChip = framingChips.find((c) => c.id === selectedFraming);

    if (styleChip) chipTags.push(...styleChip.tags.split(', '));
    if (lightChip) chipTags.push(...lightChip.tags.split(', '));
    if (framingChip) chipTags.push(...framingChip.tags.split(', '));

    // Filtra duplicatas case-insensitive
    const existingLower = finalPrompt.toLowerCase();
    const uniqueTags = chipTags.filter((tag) => !existingLower.includes(tag.toLowerCase()));

    if (uniqueTags.length > 0) {
      finalPrompt += ', ' + uniqueTags.join(', ');
    }

    return finalPrompt;
  };

  const onSubmit = (values: FormValues) => {
    const finalPrompt = buildFinalPrompt(values.prompt);

    const payload: GenerateImagePayload = {
      prompt: finalPrompt,
      negative_prompt: values.negative_prompt,
      aspect_ratio: values.aspect_ratio,
      seed: values.seed ? Number(values.seed) : undefined,
    };

    // TODO: add refinements to payload when backend supports
    // refinements: {
    //   style: selectedStyle ?? undefined,
    //   light: selectedLight ?? undefined,
    //   framing: selectedFraming ?? undefined,
    //   mode: selectedMode ?? undefined,
    // }

    void mutateAsync(payload);
  };

  const handleRandomPrompt = () => {
    // Usa prompts do modo selecionado ou os padrão
    const prompts = currentMode ? currentMode.samplePrompts : defaultSamplePrompts;
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setValue('prompt', random, { shouldValidate: true });
  };

  const handleChipClick = (
    category: 'style' | 'light' | 'framing',
    chipId: string,
  ) => {
    if (isPending) return;

    if (category === 'style') {
      setSelectedStyle(selectedStyle === chipId ? null : chipId);
    } else if (category === 'light') {
      setSelectedLight(selectedLight === chipId ? null : chipId);
    } else {
      setSelectedFraming(selectedFraming === chipId ? null : chipId);
    }
  };

  const renderChipGroup = (
    category: 'style' | 'light' | 'framing',
    chips: RefinementChip[],
    selectedId: string | null,
    microcopy: string,
  ) => (
    <div className="space-y-2">
      <span className="text-xs text-gray-500">{microcopy}</span>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            title={chip.tooltip}
            disabled={isPending}
            onClick={() => handleChipClick(category, chip.id)}
            className={clsx(
              'rounded-full px-3 py-1.5 text-sm transition-all',
              selectedId === chip.id
                ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/50'
                : 'bg-white/[0.03] text-gray-400 ring-1 ring-white/5 hover:bg-white/[0.06] hover:text-white',
              isPending && 'cursor-not-allowed opacity-50',
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );

  const hasRefinements = selectedStyle || selectedLight || selectedFraming;

  return (
    <div className="relative min-h-full overflow-y-auto text-white">
      {/* Background glow sutil */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-6 py-12 md:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs text-purple-300">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Studio
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            O que você quer criar?
          </h1>
        </div>

        {/* Seletor de Modos de Criação - Chips compactos */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {creationModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              disabled={isPending}
              onClick={() => setSelectedMode(selectedMode === mode.id ? null : mode.id)}
              className={clsx(
                'group flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all',
                selectedMode === mode.id
                  ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/50'
                  : 'bg-white/[0.03] text-gray-400 ring-1 ring-white/5 hover:bg-white/[0.06] hover:text-white',
                isPending && 'cursor-not-allowed opacity-50',
              )}
            >
              <span
                className={clsx(
                  'material-symbols-outlined text-[18px] transition-colors',
                  selectedMode === mode.id ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300',
                )}
              >
                {mode.icon}
              </span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {/* Card do prompt */}
          <div className="group relative rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/10 transition-all focus-within:bg-white/[0.05] focus-within:ring-purple-500/50">
            <label htmlFor="prompt" className="mb-2 block text-sm text-gray-400">
              Descreva sua imagem
            </label>
            <textarea
              id="prompt"
              rows={4}
              className="w-full resize-none border-0 bg-transparent text-lg leading-relaxed text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
              placeholder={placeholder}
              {...register('prompt')}
            />

            {errors.prompt && (
              <p className="mt-3 text-sm text-red-400">{errors.prompt.message}</p>
            )}

            {/* Footer do card */}
            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
              {!promptValue ? (
                <button
                  type="button"
                  onClick={handleRandomPrompt}
                  className={clsx(
                    'flex items-center gap-1.5 text-sm transition-colors',
                    currentMode ? 'text-purple-400 hover:text-purple-300' : 'text-gray-500 hover:text-purple-400',
                  )}
                >
                  <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                  {currentMode ? `Exemplo de ${currentMode.label.toLowerCase()}` : 'Me inspire'}
                </button>
              ) : promptValue.length >= 80 ? (
                <span className="text-xs text-gray-600">{promptValue.length} caracteres</span>
              ) : (
                <span />
              )}

              {(currentMode || hasRefinements) && (
                <span className="flex items-center gap-1 text-xs text-purple-400/70">
                  <span className="material-symbols-outlined text-[12px]">auto_fix_high</span>
                  {currentMode && hasRefinements
                    ? 'Modo + refinamentos aplicados'
                    : currentMode
                      ? 'Estilo aplicado'
                      : 'Refinamentos aplicados'}
                </span>
              )}
            </div>
          </div>

          {/* Seção: Refine sua ideia */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Refine sua ideia (opcional)
            </div>

            <div className="grid gap-5 rounded-xl bg-white/[0.02] p-5 ring-1 ring-white/5 sm:grid-cols-3">
              {renderChipGroup('style', styleChips, selectedStyle, 'Qual a aparência?')}
              {renderChipGroup('light', lightChips, selectedLight, 'Como é a luz?')}
              {renderChipGroup('framing', framingChips, selectedFraming, 'De que ângulo?')}
            </div>
          </div>

          {/* Configurações em linha */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Proporção */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Proporção</span>
              <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                {aspectRatioOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('aspect_ratio', option.value, { shouldValidate: true })}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all',
                      aspectRatio === option.value
                        ? 'bg-white/10 text-white'
                        : 'text-gray-500 hover:text-white',
                    )}
                  >
                    <div
                      className={clsx(
                        'rounded-sm border border-current',
                        option.shape === 'square' && 'h-3 w-3',
                        option.shape === 'landscape' && 'h-2 w-3.5',
                        option.shape === 'portrait' && 'h-3.5 w-2',
                      )}
                    />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Avançado toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all',
                showAdvanced
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-gray-500 hover:text-white',
              )}
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
              Avançado
            </button>
          </div>

          {/* Opções avançadas */}
          {showAdvanced && (
            <div className="grid gap-4 rounded-xl bg-white/[0.02] p-5 ring-1 ring-white/5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-400" htmlFor="negative_prompt">
                  Evitar na imagem
                </label>
                <input
                  id="negative_prompt"
                  type="text"
                  className="w-full rounded-lg bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  placeholder="blur, text, lowres..."
                  {...register('negative_prompt')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400" htmlFor="seed">
                  Seed
                </label>
                <input
                  id="seed"
                  type="number"
                  min={0}
                  className="w-full rounded-lg bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  placeholder="Aleatório"
                  {...register('seed')}
                />
                {errors.seed && (
                  <p className="mt-1 text-xs text-red-400">{errors.seed.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Botão de gerar */}
          <button
            type="submit"
            disabled={isPending}
            className="group relative mt-2 flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            {isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Gerando sua imagem...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                <span>Gerar imagem</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">-2</span>
              </>
            )}
          </button>

          {/* Skeleton placeholder enquanto gera */}
          {isPending && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-48 w-48 animate-pulse rounded-xl bg-white/5" />
              <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
            </div>
          )}

          {/* Status */}
          {queue.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
              {queue.length} {queue.length === 1 ? 'imagem' : 'imagens'} em fila
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-3 text-center text-sm text-red-400 ring-1 ring-red-500/20">
              Erro ao gerar. Verifique sua conta e tente novamente.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { imagesApi } from '@/features/images/api';
import type { GenerateImagePayload, ImageRecord } from '@/features/images/types';
import { QUERY_KEYS } from '@/lib/constants';

const schema = z.object({
  prompt: z.string().min(10, 'Descreva melhor o que deseja gerar'),
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
    { label: '2:1', value: '2:1', shape: 'landscape' },
    { label: '3:2', value: '3:2', shape: 'landscape' },
  ];

const samplePrompts = [
  'Um astronauta meditando em um jardim zen flutuante, luz dourada, estilo cinematográfico, 8k, volumetric lighting',
  'Retrato hiper-realista de uma inventora steampunk com óculos de latão, fumaça ao fundo, lente 85mm',
  'Cidade cyberpunk submersa à noite, letreiros neon refletindo na água, chuva leve, render octane',
];

const formatAspectRatio = (value: string) => value.replace(':', '×');

export const GenerateImagePage = () => {
  const [showNegative, setShowNegative] = useState(false);
  const [guidance, setGuidance] = useState(7.5);
  const [steps, setSteps] = useState(40);
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
      prompt: '',
      negative_prompt: '',
      aspect_ratio: '1:1',
      seed: '',
    },
  });

  const aspectRatio = watch('aspect_ratio');

  const { data: myImagesResponse, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });

  const myImages: ImageRecord[] = myImagesResponse?.results ?? [];
  const queue = myImages.filter((image) => image.status === 'GENERATING');
  const latestReady = myImages.find((image) => image.status === 'READY');

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: GenerateImagePayload) => imagesApi.generate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() });
      reset({ prompt: '', negative_prompt: '', aspect_ratio: '1:1', seed: '' });
      setShowNegative(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: GenerateImagePayload = {
      prompt: values.prompt,
      negative_prompt: values.negative_prompt,
      aspect_ratio: values.aspect_ratio,
      seed: values.seed ? Number(values.seed) : undefined,
    };
    void mutateAsync(payload);
  };

  const handleRandomPrompt = () => {
    const random = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setValue('prompt', random, { shouldValidate: true });
  };

  const handleRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 100000).toString();
    setValue('seed', randomSeed, { shouldValidate: true });
  };

  const handleReset = () => {
    reset({ prompt: '', negative_prompt: '', aspect_ratio: '1:1', seed: '' });
    setGuidance(7.5);
    setSteps(40);
    setShowNegative(false);
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background-dark text-white font-display">
      <div className="relative flex min-h-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#264532] bg-[#122017]/90 px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button className="text-gray-400 transition-colors hover:text-white md:hidden" type="button" aria-label="Abrir menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
              <h1 className="text-lg font-semibold leading-none text-white">Novo Projeto</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-[#264532] bg-panel-dark px-3 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-xs font-medium text-gray-300">
                {queue.length ? `${queue.length} em processamento` : 'GPU pronta'}
              </span>
            </div>
            <button className="text-gray-400 transition-colors hover:text-white" type="button" aria-label="Ajuda">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto p-4 md:p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-end justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300" htmlFor="prompt">
                    <span className="material-symbols-outlined text-[18px] text-primary">terminal</span>
                    Prompt de comando
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomPrompt}
                    className="flex items-center gap-1 text-xs font-semibold text-purple-300 transition-colors hover:text-purple-200"
                  >
                    <span className="material-symbols-outlined text-[16px]">shuffle</span>
                    Aleatório
                  </button>
                </div>

                <div className="relative rounded-xl border border-[#2a4034] bg-terminal-dark shadow-xl shadow-black/20">
                  <textarea
                    id="prompt"
                    className="h-44 w-full resize-none rounded-xl bg-transparent p-5 font-mono text-base leading-relaxed text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Descreva sua imaginação aqui..."
                    {...register('prompt')}
                  />
                  {errors.prompt ? (
                    <p className="absolute left-5 top-2 text-xs text-red-300">{errors.prompt.message}</p>
                  ) : null}

                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNegative((prev) => !prev)}
                      className={clsx(
                        'flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-colors',
                        showNegative
                          ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                          : 'border-[#264532] bg-panel-dark text-gray-400 hover:border-gray-500 hover:text-white',
                      )}
                    >
                      <span className="material-symbols-outlined text-[14px]">remove_circle</span>
                      Prompt negativo
                    </button>
                  </div>
                </div>

                {showNegative ? (
                  <div className="rounded-xl border border-[#2a4034] bg-panel-dark px-4 py-3">
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-400" htmlFor="negative_prompt">
                      <span className="material-symbols-outlined text-[16px] text-purple-accent">shield</span>
                      Evite na imagem
                    </label>
                    <textarea
                      id="negative_prompt"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-[#264532] bg-terminal-dark p-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Elementos a evitar (ex.: blurry, text, lowres)"
                      {...register('negative_prompt')}
                    />
                    {errors.negative_prompt ? (
                      <p className="mt-1 text-xs text-red-300">{errors.negative_prompt.message}</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="group flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 px-4 py-3 text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.01] hover:from-purple-600 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined transition-transform group-hover:rotate-12">auto_awesome</span>
                    <span className="text-lg font-bold tracking-wide">
                      {isPending ? 'Gerando...' : 'Gerar imagem'}
                    </span>
                    <span className="ml-2 rounded bg-white/20 px-2 py-0.5 text-xs font-medium">-2 Créditos</span>
                  </button>
                  <button
                    type="button"
                    className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#264532] bg-panel-dark text-gray-400 transition-colors hover:border-gray-500 hover:text-white"
                    title="Salvar prompt"
                    onClick={handleRandomPrompt}
                  >
                    <span className="material-symbols-outlined">bookmark</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Preview
                </h3>
                <div className="flex flex-1 min-h-[240px] items-center justify-center rounded-2xl border-2 border-dashed border-[#264532] bg-[#15251c] p-6 text-center transition-colors hover:border-primary/30">
                  {latestReady ? (
                    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
                      <div className="w-full overflow-hidden rounded-xl border border-[#264532] bg-panel-dark shadow-lg shadow-black/30">
                        <img
                          src={latestReady.image_url ?? ''}
                          alt={latestReady.prompt}
                          className="h-auto w-full max-h-[520px] object-cover"
                        />
                      </div>
                      <div className="flex w-full flex-wrap items-center justify-between gap-2 text-left text-sm text-gray-300">
                        <div className="flex-1">
                          <p className="font-semibold text-white line-clamp-2">{latestReady.prompt}</p>
                          <span className="text-xs text-gray-500">Aspecto {formatAspectRatio(latestReady.aspect_ratio)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="rounded-full bg-white/5 px-2 py-1">Likes {latestReady.like_count}</span>
                          <span className="rounded-full bg-white/5 px-2 py-1">
                            Downloads {latestReady.download_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex max-w-md flex-col items-center gap-3 text-gray-400">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-panel-dark shadow-lg shadow-black/20">
                        <span className="material-symbols-outlined text-4xl text-gray-600">image</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white">Aguardando criação</h4>
                      <p className="text-sm text-gray-500">
                        Suas imagens geradas aparecerão aqui. Experimente descrever uma cena detalhada acima.
                      </p>
                      {isLoading ? <span className="text-xs text-gray-500">Carregando suas últimas criações...</span> : null}
                    </div>
                  )}
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  Não foi possível criar a tarefa. Verifique se sua conta está verificada e dentro da cota diária.
                </div>
              ) : null}
            </div>

            <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto rounded-2xl border border-[#264532] bg-[#15251c] lg:flex">
              <div className="border-b border-[#264532] p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <span className="material-symbols-outlined text-gray-400">tune</span>
                  Configurações
                </h3>
              </div>

              <div className="flex flex-col gap-8 p-6">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-gray-300" htmlFor="aspect_ratio">
                    Dimensões
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {aspectRatioOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setValue('aspect_ratio', option.value, { shouldValidate: true })}
                        className={clsx(
                          'flex flex-col items-center justify-center gap-2 rounded-lg border p-2 text-gray-400 transition-colors',
                          aspectRatio === option.value
                            ? 'border-purple-500 bg-purple-500/10 text-purple-200'
                            : 'border-[#264532] bg-panel-dark hover:border-gray-500 hover:text-white',
                        )}
                      >
                        <div
                          className={clsx(
                            'border-2 border-current rounded-sm',
                            option.shape === 'square' && 'h-6 w-6',
                            option.shape === 'landscape' && 'h-5 w-8',
                            option.shape === 'portrait' && 'h-8 w-5',
                          )}
                        />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.aspect_ratio ? (
                    <p className="text-xs text-red-300">{errors.aspect_ratio.message}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300" htmlFor="guidance">
                        Guidance Scale
                      </label>
                      <span className="rounded border border-[#264532] bg-panel-dark px-2 py-1 font-mono text-xs text-purple-400">
                        {guidance.toFixed(1)}
                      </span>
                    </div>
                    <input
                      id="guidance"
                      type="range"
                      min={1}
                      max={20}
                      step={0.5}
                      value={guidance}
                      onChange={(event) => setGuidance(Number(event.target.value))}
                      className="w-full accent-purple-accent"
                    />
                    <p className="text-xs text-gray-500">Quanto a IA deve seguir seu prompt.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300" htmlFor="steps">
                        Steps
                      </label>
                      <span className="rounded border border-[#264532] bg-panel-dark px-2 py-1 font-mono text-xs text-purple-400">
                        {steps}
                      </span>
                    </div>
                    <input
                      id="steps"
                      type="range"
                      min={10}
                      max={100}
                      step={1}
                      value={steps}
                      onChange={(event) => setSteps(Number(event.target.value))}
                      className="w-full accent-purple-accent"
                    />
                    <p className="text-xs text-gray-500">Qualidade vs velocidade de geração.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex items-center justify-between text-sm font-medium text-gray-300" htmlFor="seed">
                      Seed
                      <button
                        type="button"
                        onClick={handleRandomSeed}
                        className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[14px]">casino</span>
                        Aleatório
                      </button>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="seed"
                        type="number"
                        min={0}
                        placeholder="-1"
                        className="w-full rounded-lg border border-[#264532] bg-panel-dark p-2.5 font-mono text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        {...register('seed')}
                      />
                    </div>
                    {errors.seed ? <p className="text-xs text-red-300">{errors.seed.message}</p> : null}
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t border-[#264532] p-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-lg border border-[#264532] py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-panel-dark hover:text-white"
                >
                  Restaurar padrões
                </button>
              </div>
            </aside>
          </form>
        </div>
      </div>
    </div>
  );
};

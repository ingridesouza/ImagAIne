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
  ];

const samplePrompts = [
  'Um astronauta meditando em um jardim zen flutuante, luz dourada, estilo cinematográfico',
  'Retrato hiper-realista de uma inventora steampunk com óculos de latão, fumaça ao fundo',
  'Cidade cyberpunk submersa à noite, letreiros neon refletindo na água, chuva leve',
];

export const GenerateImagePage = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {/* Card do prompt */}
          <div className="group relative rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/10 transition-all focus-within:bg-white/[0.05] focus-within:ring-purple-500/50">
            <textarea
              id="prompt"
              rows={4}
              className="w-full resize-none border-0 bg-transparent text-lg leading-relaxed text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
              placeholder="Descreva sua imaginação em detalhes..."
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
                  className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-purple-400"
                >
                  <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                  Me inspire
                </button>
              ) : (
                <span className="text-xs text-gray-600">{promptValue.length} caracteres</span>
              )}

              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="material-symbols-outlined text-[14px]">keyboard</span>
                Enter para gerar
              </div>
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
              <span className="material-symbols-outlined text-[16px]">tune</span>
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

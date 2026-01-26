import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { imagesApi } from '@/features/images/api';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import type { GenerateImagePayload } from '@/features/images/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { QUERY_KEYS } from '@/lib/constants';

const schema = z.object({
  prompt: z.string().min(10, 'Descreva melhor o que deseja gerar'),
  negative_prompt: z.string().optional(),
  aspect_ratio: z.enum(['1:1', '16:9', '4:3', '9:16', '3:2']),
  seed: z
    .string()
    .optional()
    .refine((value) => !value || Number(value) >= 0, { message: 'Seed deve ser um número positivo' }),
});

type FormValues = z.infer<typeof schema>;

const aspectRatioOptions = [
  { label: 'Quadrado 1:1', value: '1:1' },
  { label: 'Paisagem 16:9', value: '16:9' },
  { label: 'Paisagem clássica 4:3', value: '4:3' },
  { label: 'Retrato 9:16', value: '9:16' },
  { label: 'Dourado 3:2', value: '3:2' },
];

export const GenerateImageForm = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
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

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: GenerateImagePayload) => imagesApi.generate(payload),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() });
      reset({ prompt: '', negative_prompt: '', aspect_ratio: '1:1', seed: '' });
      // Refresh user profile to update credits count
      const updatedProfile = await authApi.fetchProfile();
      setUser(updatedProfile);
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: GenerateImagePayload = {
      prompt: values.prompt,
      negative_prompt: values.negative_prompt,
      aspect_ratio: values.aspect_ratio,
      seed: values.seed ? Number(values.seed) : undefined,
    };
    mutateAsync(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="generate-form">
      <div className="form-group">
        <label htmlFor="prompt">Prompt *</label>
        <Textarea id="prompt" rows={4} placeholder="Descreva a cena que deseja ver" {...register('prompt')} />
        {errors.prompt ? <span className="form-error">{errors.prompt.message}</span> : null}
      </div>

      <div className="form-group">
        <label htmlFor="negative_prompt">Prompt negativo</label>
        <Textarea
          id="negative_prompt"
          rows={2}
          placeholder="Elementos a evitar (ex.: blurry, text)"
          {...register('negative_prompt')}
        />
        {errors.negative_prompt ? <span className="form-error">{errors.negative_prompt.message}</span> : null}
      </div>

      <div className="grid --two">
        <div className="form-group">
          <label htmlFor="aspect_ratio">Proporção</label>
          <Select id="aspect_ratio" {...register('aspect_ratio')}>
            {aspectRatioOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="form-group">
          <label htmlFor="seed">Seed (opcional)</label>
          <Input id="seed" type="number" min={0} placeholder="Número para repetir o resultado" {...register('seed')} />
          {errors.seed ? <span className="form-error">{errors.seed.message}</span> : null}
        </div>
      </div>

      {error ? (
        <div className="form-alert form-alert--error">
          Não foi possível criar a tarefa. Verifique se sua conta está verificada e dentro da cota diária.
        </div>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enfileirando...' : 'Adicionar à fila'}
      </Button>
    </form>
  );
};

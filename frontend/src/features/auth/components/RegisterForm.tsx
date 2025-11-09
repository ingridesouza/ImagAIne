import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/features/auth/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const schema = z
  .object({
    email: z.string().email('Informe um e-mail válido'),
    username: z.string().min(3, 'Usuário deve ter ao menos 3 caracteres'),
    first_name: z.string().min(2, 'Informe seu nome'),
    last_name: z.string().min(2, 'Informe seu sobrenome'),
    bio: z.string().max(180).optional(),
    password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
    password2: z.string().min(8, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.password2, {
    message: 'As senhas precisam coincidir',
    path: ['password2'],
  });

type FormValues = z.infer<typeof schema>;

export const RegisterForm = () => {
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      username: '',
      first_name: '',
      last_name: '',
      bio: '',
      password: '',
      password2: '',
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      setServerMessage(response.detail ?? 'Cadastro efetuado! Confira seu e-mail.');
      reset();
    },
    onError: (error: any) => {
      const detail =
        error?.response?.data?.detail ??
        error?.response?.data?.email?.[0] ??
        'Não foi possível concluir o cadastro.';
      setError('email', { type: 'manual', message: detail });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutateAsync(values);
  };

  return (
    <form className="grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-group">
        <label htmlFor="email">E-mail</label>
        <Input id="email" type="email" placeholder="nome@exemplo.com" {...register('email')} />
        {errors.email ? (
          <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>{errors.email.message}</span>
        ) : null}
      </div>
      <div className="form-group">
        <label htmlFor="username">Usuário</label>
        <Input id="username" placeholder="seu_usuario" {...register('username')} />
        {errors.username ? (
          <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>{errors.username.message}</span>
        ) : null}
      </div>

      <div className="grid --two">
        <div className="form-group">
          <label htmlFor="first_name">Nome</label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name ? (
            <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>{errors.first_name.message}</span>
          ) : null}
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Sobrenome</label>
          <Input id="last_name" {...register('last_name')} />
          {errors.last_name ? (
            <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>{errors.last_name.message}</span>
          ) : null}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <Textarea id="bio" rows={3} placeholder="Conte algo sobre você" {...register('bio')} />
        {errors.bio ? (
          <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>{errors.bio.message}</span>
        ) : null}
      </div>

      <div className="grid --two">
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          {errors.password ? (
            <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>{errors.password.message}</span>
          ) : null}
        </div>
        <div className="form-group">
          <label htmlFor="password2">Confirmar senha</label>
          <Input
            id="password2"
            type="password"
            autoComplete="new-password"
            {...register('password2')}
          />
          {errors.password2 ? (
            <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>{errors.password2.message}</span>
          ) : null}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Processando...' : 'Criar conta'}
      </Button>

      {serverMessage ? (
        <div style={{ background: '#ecfccb', padding: '0.75rem', borderRadius: '0.75rem', color: '#4d7c0f' }}>
          {serverMessage}
        </div>
      ) : null}
    </form>
  );
};

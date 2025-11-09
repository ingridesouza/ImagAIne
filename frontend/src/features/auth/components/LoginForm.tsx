import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/features/auth/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/features/auth/store';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'Senha obrigatória'),
});

type FormValues = z.infer<typeof schema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string })?.from ?? '/';
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession({
        accessToken: data.access,
        refreshToken: data.refresh,
        user: data.user,
      });
      navigate(redirectTo, { replace: true });
    },
    onError: (error: any) => {
      const detail =
        error?.response?.data?.detail || 'Credenciais inválidas ou usuário não verificado.';
      setError('password', { type: 'manual', message: detail });
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
        <label htmlFor="password">Senha</label>
        <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
        {errors.password ? (
          <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>{errors.password.message}</span>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Entrando...' : 'Acessar painel'}
      </Button>
    </form>
  );
};

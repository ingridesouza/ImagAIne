import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { authApi } from '@/features/auth/api';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/features/auth/store';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'Senha obrigatória'),
});

type FormValues = z.infer<typeof schema>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
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
    onError: (error: AxiosError<{ detail?: string }>) => {
      const detail = error.response?.data?.detail || 'Credenciais inválidas ou usuário não verificado.';
      setError('password', { type: 'manual', message: detail });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutateAsync(values);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="auth-field">
        <label htmlFor="email">E-mail</label>
        <div className="auth-input">
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="username"
            className="auth-input__field"
            {...register('email')}
          />
        </div>
        {errors.email ? <span className="auth-error">{errors.email.message}</span> : null}
      </div>

      <div className="auth-field">
        <label htmlFor="password">Senha</label>
        <div className="auth-input">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            className="auth-input__field"
            {...register('password')}
          />
          <button
            type="button"
            className="auth-input__action"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <span className="material-symbols-outlined" aria-hidden>
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        <div className="auth-field__meta">
          <a className="auth-link--subtle" href="#">
            Esqueceu sua senha?
          </a>
        </div>
        {errors.password ? <span className="auth-error">{errors.password.message}</span> : null}
      </div>

      <button className="auth-submit" type="submit" disabled={isPending}>
        <span>{isPending ? 'Entrando...' : 'Entrar'}</span>
        <span className="material-symbols-outlined auth-submit__icon" aria-hidden>
          arrow_forward
        </span>
      </button>
    </form>
  );
};

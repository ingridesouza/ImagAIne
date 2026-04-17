import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { authApi } from '@/features/auth/api';
import { CheckCircle, XCircle, Eye, EyeOff, Lock } from 'lucide-react';

type FormData = {
  new_password: string;
  new_password_confirm: string;
};

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Token de redefinição não encontrado.');
      return;
    }

    setLoading(true);
    try {
      await authApi.confirmPasswordReset({
        token,
        new_password: data.new_password,
        new_password_confirm: data.new_password_confirm,
      });
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      const error = err as { response?: { data?: { detail?: string } } };
      setErrorMessage(
        error.response?.data?.detail || 'Token inválido ou expirado.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle={status === 'form' ? 'Escolha uma nova senha para sua conta.' : undefined}
      footer={
        <span>
          <Link to="/login">Voltar para o login</Link>
        </span>
      }
    >
      {status === 'success' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <CheckCircle className="h-12 w-12 text-success" />
          <p className="text-fg">Senha redefinida com sucesso!</p>
          <Link
            to="/login"
            className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-fg-inv transition-colors hover:bg-accent-hover"
          >
            Fazer login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <XCircle className="h-12 w-12 text-danger" />
          <p className="text-fg">{errorMessage}</p>
          <Link
            to="/forgot-password"
            className="mt-2 text-sm text-accent-text hover:text-accent"
          >
            Solicitar novo link
          </Link>
        </div>
      )}

      {status === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="new_password" className="mb-1.5 block text-sm font-medium text-fg-sec">
              Nova senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <input
                id="new_password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-[var(--radius-md)] border border-border bg-inset py-2.5 pl-10 pr-10 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                {...register('new_password', {
                  required: 'Senha é obrigatória',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-sec"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.new_password && (
              <p className="mt-1 text-xs text-danger">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-fg-sec">
              Confirmar nova senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repita a senha"
                className="w-full rounded-[var(--radius-md)] border border-border bg-inset py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                {...register('new_password_confirm', {
                  required: 'Confirmação é obrigatória',
                  validate: (val) =>
                    val === watch('new_password') || 'As senhas não coincidem',
                })}
              />
            </div>
            {errors.new_password_confirm && (
              <p className="mt-1 text-xs text-danger">{errors.new_password_confirm.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-accent py-2.5 text-sm font-medium text-fg-inv transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { authApi } from '@/features/auth/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

type FormData = { email: string };

export const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.requestPasswordReset({ email: data.email });
    } catch {
      // Silently succeed — don't reveal if email exists
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu email para receber o link de redefinição."
      footer={
        <span>
          <Link to="/login" className="inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </span>
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <CheckCircle className="h-12 w-12 text-success" />
          <p className="text-fg">
            Se uma conta com esse email existir, você receberá um link para
            redefinir sua senha.
          </p>
          <Link
            to="/login"
            className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-fg-inv transition-colors hover:bg-accent-hover"
          >
            Voltar para o login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-fg-sec">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="w-full rounded-[var(--radius-md)] border border-border bg-inset py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-accent py-2.5 text-sm font-medium text-fg-inv transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { authApi } from '@/features/auth/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }

    authApi.verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.detail);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.detail || 'Token inválido ou expirado.'
        );
      });
  }, [token]);

  return (
    <AuthLayout
      title="Verificação de email"
      footer={
        <span>
          <Link to="/login">Voltar para o login</Link>
        </span>
      }
    >
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="text-fg-sec">Verificando seu email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="text-fg">{message}</p>
            <Link
              to="/login"
              className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-fg-inv transition-colors hover:bg-accent-hover"
            >
              Fazer login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-danger" />
            <p className="text-fg">{message}</p>
            <Link
              to="/register"
              className="mt-2 text-sm text-accent-text hover:text-accent"
            >
              Criar nova conta
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

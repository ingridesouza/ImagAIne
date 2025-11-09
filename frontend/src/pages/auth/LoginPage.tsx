import { Link } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

export const LoginPage = () => (
  <AuthLayout
    title="Bem-vindo de volta"
    subtitle="Use sua conta verificada para acessar o estúdio."
    footer={
      <span>
        Ainda sem conta? <Link to="/register">Crie agora</Link>
      </span>
    }
  >
    <LoginForm />
  </AuthLayout>
);

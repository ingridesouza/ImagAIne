import { Link } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

export const RegisterPage = () => (
  <AuthLayout
    title="Crie sua conta"
    subtitle="Valide seu e-mail para liberar a geração de imagens."
    footer={
      <span>
        Já possui acesso? <Link to="/login">Entre aqui</Link>
      </span>
    }
  >
    <RegisterForm />
  </AuthLayout>
);

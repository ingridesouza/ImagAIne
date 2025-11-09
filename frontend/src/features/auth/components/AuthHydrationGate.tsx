import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/features/auth/store';

type Props = {
  children: ReactNode;
};

export const AuthHydrationGate = ({ children }: Props) => {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  if (!hasHydrated) {
    return (
      <div className="auth-gate">
        <Spinner label="Sincronizando sessão..." />
      </div>
    );
  }
  return <>{children}</>;
};

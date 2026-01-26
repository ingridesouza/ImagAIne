import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { AuthHydrationGate } from '@/features/auth/components/AuthHydrationGate';
import { AuthBootstrapper } from '@/features/auth/components/AuthBootstrapper';

type Props = {
  children: ReactNode;
};

export const AppProviders = ({ children }: Props) => (
  <QueryClientProvider client={queryClient}>
    <AuthHydrationGate>
      {children}
      <AuthBootstrapper />
    </AuthHydrationGate>
  </QueryClientProvider>
);

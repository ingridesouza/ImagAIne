import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
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
    <Toaster
      position="bottom-right"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'rgba(15, 15, 20, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
        },
      }}
    />
  </QueryClientProvider>
);

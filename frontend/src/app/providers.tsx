import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { AuthHydrationGate } from '@/features/auth/components/AuthHydrationGate';
import { AuthBootstrapper } from '@/features/auth/components/AuthBootstrapper';
import { useThemeStore } from '@/hooks/useTheme';

type Props = {
  children: ReactNode;
};

export const AppProviders = ({ children }: Props) => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrationGate>
        {children}
        <AuthBootstrapper />
      </AuthHydrationGate>
      <Toaster
        position="bottom-right"
        theme={theme}
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'var(--color-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </QueryClientProvider>
  );
};

'use client';

import { QueryClient, QueryClientProvider as TanstackQueryProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <TanstackQueryProvider client={queryClient}>
      {children}
    </TanstackQueryProvider>
  );
}

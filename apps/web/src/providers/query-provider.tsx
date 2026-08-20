'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Never retry client 4xx errors
              const status = error?.status || error?.statusCode;
              if (status >= 400 && status < 500) {
                return false;
              }
              // Only 1 retry for 5xx or transient network errors
              return failureCount < 1;
            },
          },
          mutations: {
            retry: false, // Never automatically retry mutations to ensure idempotency
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

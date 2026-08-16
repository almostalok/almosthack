import { ApiClient, RequestOptions } from '@almosthack/api-client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  timeout: 10000,
});

/**
 * TanStack Query compatibility helper for building queryFn functions.
 *
 * Example usage:
 * queryFn: createFetcher<HealthResponse>('/health/liveness')
 */
export function createFetcher<T>(path: string, options?: RequestOptions) {
  return async (): Promise<T> => {
    return apiClient.get<T>(path, options);
  };
}

/**
 * TanStack Query compatibility helper for building mutationFn functions.
 *
 * Example usage:
 * mutationFn: createMutation<InputDto, OutputDto>('/endpoint', 'POST')
 */
export function createMutationFetcher<TVariables, TData>(
  path: string | ((variables: TVariables) => string),
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: RequestOptions
) {
  return async (variables: TVariables): Promise<TData> => {
    const targetPath = typeof path === 'function' ? path(variables) : path;
    return apiClient.request<TData>(targetPath, {
      ...options,
      method,
      body: variables,
    });
  };
}

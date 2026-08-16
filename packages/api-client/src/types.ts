export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  fetch?: typeof fetch;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
  requestId?: string;
  signal?: AbortSignal;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

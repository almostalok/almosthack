import { ApiClientConfig, RequestOptions, ApiSuccessResponse, ApiErrorResponse } from './types';
import { ApiClientError } from './errors';

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly credentials?: RequestCredentials;
  private readonly fetchImpl: typeof fetch;

  constructor(config: ApiClientConfig) {
    if (!config || !config.baseUrl) {
      throw new Error('ApiClient requires a valid baseUrl in configuration.');
    }
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.defaultHeaders = config.defaultHeaders || {};
    this.timeoutMs = config.timeout ?? 10000;
    this.credentials = config.credentials ?? 'include';
    const rawFetch = config.fetch || (typeof fetch !== 'undefined' ? fetch : (globalThis.fetch as typeof fetch));
    this.fetchImpl = rawFetch ? rawFetch.bind(typeof window !== 'undefined' ? window : globalThis) : rawFetch;

    if (!this.fetchImpl) {
      throw new Error('No global fetch implementation found. Pass a fetch implementation in ApiClientConfig.');
    }
  }

  private generateRequestId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private buildUrl(path: string, params?: RequestOptions['params']): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fullUrl.searchParams.append(key, String(value));
        }
      });
    }

    return fullUrl.toString();
  }

  public async request<T>(
    path: string,
    options: RequestOptions & { method: string; body?: unknown }
  ): Promise<T> {
    const requestId = options.requestId || this.generateRequestId();
    const url = this.buildUrl(path, options.params);
    const timeout = options.timeout ?? this.timeoutMs;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...this.defaultHeaders,
      ...options.headers,
    };

    const controller = new AbortController();
    let isTimedOut = false;

    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      controller.abort();
    }, timeout);

    // Merge caller signal if provided
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await this.fetchImpl(url, {
        method: options.method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        credentials: options.credentials ?? this.credentials ?? 'include',
      });

      clearTimeout(timeoutId);

      const responseRequestId = response.headers.get('x-request-id') || requestId;

      let responseData: unknown = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else {
        const text = await response.text();
        if (text) {
          try {
            responseData = JSON.parse(text);
          } catch {
            responseData = text;
          }
        }
      }

      if (!response.ok) {
        let code = 'HTTP_ERROR';
        let message = `Request failed with status ${response.status}`;
        let details: unknown = undefined;

        if (responseData && typeof responseData === 'object') {
          const errObj = responseData as ApiErrorResponse;
          if (errObj.error && typeof errObj.error === 'object') {
            code = errObj.error.code || code;
            message = errObj.error.message || message;
            details = errObj.error.details;
          }
        }

        throw new ApiClientError({
          status: response.status,
          code,
          message,
          requestId: responseRequestId,
          details,
        });
      }

      // Check if response conforms to Standard ApiSuccessResponse { success: true, data: T }
      if (
        responseData &&
        typeof responseData === 'object' &&
        'success' in responseData &&
        (responseData as ApiSuccessResponse<T>).success === true &&
        'data' in responseData
      ) {
        return (responseData as ApiSuccessResponse<T>).data;
      }

      return responseData as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ApiClientError) {
        throw err;
      }

      if (isTimedOut || (err instanceof Error && err.name === 'AbortError')) {
        throw new ApiClientError({
          status: 408,
          code: 'REQUEST_TIMEOUT',
          message: `Request timed out after ${timeout}ms`,
          requestId,
        });
      }

      throw new ApiClientError({
        status: 0,
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network request failed',
        requestId,
      });
    }
  }

  public get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  public getProfile<T = any>(options?: RequestOptions): Promise<T> {
    return this.get<T>('/users/me', options);
  }

  public updateProfile<T = any>(body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>('/users/me', body, options);
  }

  // Organization Domain APIs
  public createOrganization<T = any>(body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>('/organizations', body, options);
  }

  public getUserOrganizations<T = any>(options?: RequestOptions): Promise<T> {
    return this.get<T>('/organizations/me', options);
  }

  public getOrganization<T = any>(organizationId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/organizations/${organizationId}`, options);
  }

  public updateOrganization<T = any>(organizationId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/organizations/${organizationId}`, body, options);
  }

  public deleteOrganization<T = any>(organizationId: string, body: { confirmation: string }, options?: RequestOptions): Promise<T> {
    return this.request<T>(`/organizations/${organizationId}`, { ...options, method: 'DELETE', body });
  }

  public getOrganizationMembers<T = any>(organizationId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/organizations/${organizationId}/members`, options);
  }

  public addOrganizationMember<T = any>(organizationId: string, body: { userId: string; role?: string }, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/organizations/${organizationId}/members`, body, options);
  }

  public updateOrganizationMemberRole<T = any>(organizationId: string, userId: string, body: { role: string }, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/organizations/${organizationId}/members/${userId}`, body, options);
  }

  public removeOrganizationMember<T = any>(organizationId: string, userId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/organizations/${organizationId}/members/${userId}`, options);
  }

  public transferOrganizationOwnership<T = any>(organizationId: string, body: { newOwnerId: string }, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/organizations/${organizationId}/transfer-ownership`, body, options);
  }
}



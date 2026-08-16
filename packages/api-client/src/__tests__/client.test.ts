import { ApiClient } from '../client';
import { ApiClientError, isApiClientError } from '../errors';

describe('ApiClient', () => {
  const baseUrl = 'https://api.test.almosthack.org';

  it('should initialize with base URL without trailing slash', () => {
    const client = new ApiClient({ baseUrl: 'https://api.test.almosthack.org///' });
    expect((client as any).baseUrl).toBe('https://api.test.almosthack.org');
  });

  it('should perform successful GET request and unwrap success response envelope', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
        'x-request-id': 'resp-req-123',
      }),
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { status: 'healthy' },
      }),
    });

    const client = new ApiClient({ baseUrl, fetch: mockFetch });
    const result = await client.get<{ status: string }>('/health');

    expect(result).toEqual({ status: 'healthy' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.test.almosthack.org/health');
    expect(init.method).toBe('GET');
    expect(init.headers['X-Request-ID']).toBeDefined();
  });

  it('should perform successful POST request with custom request ID and payload', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({
        'content-type': 'application/json',
        'x-request-id': 'custom-req-id-777',
      }),
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { id: 'job_100', enqueued: true },
      }),
    });

    const client = new ApiClient({ baseUrl, fetch: mockFetch });
    const result = await client.post<{ id: string; enqueued: boolean }>(
      '/jobs',
      { name: 'test-job' },
      { requestId: 'custom-req-id-777' }
    );

    expect(result).toEqual({ id: 'job_100', enqueued: true });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers['X-Request-ID']).toBe('custom-req-id-777');
    expect(JSON.parse(init.body)).toEqual({ name: 'test-job' });
  });

  it('should normalize non-2xx responses into ApiClientError', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({
        'content-type': 'application/json',
        'x-request-id': 'err-req-999',
      }),
      json: jest.fn().mockResolvedValue({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Target resource does not exist',
          requestId: 'err-req-999',
        },
      }),
    });

    const client = new ApiClient({ baseUrl, fetch: mockFetch });

    try {
      await client.get('/missing-resource');
      fail('Should have thrown ApiClientError');
    } catch (err: unknown) {
      expect(isApiClientError(err)).toBe(true);
      if (err instanceof ApiClientError) {
        expect(err.status).toBe(404);
        expect(err.code).toBe('RESOURCE_NOT_FOUND');
        expect(err.message).toBe('Target resource does not exist');
        expect(err.requestId).toBe('err-req-999');
      }
    }
  });

  it('should handle request timeout', async () => {
    const mockFetch = jest.fn().mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    });

    const client = new ApiClient({ baseUrl, timeout: 50, fetch: mockFetch });

    await expect(client.get('/slow-endpoint')).rejects.toThrow(ApiClientError);
    try {
      await client.get('/slow-endpoint');
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        expect(err.status).toBe(408);
        expect(err.code).toBe('REQUEST_TIMEOUT');
      }
    }
  });
});

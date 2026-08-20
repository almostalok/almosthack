import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard (S7)', () => {
  let guard: RateLimitGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RateLimitGuard(reflector);
  });

  const createMockContext = (ip = '127.0.0.1', path = '/api/v1/auth/login'): ExecutionContext => {
    const headers: Record<string, string> = { 'x-forwarded-for': ip };
    const responseHeaders = new Map<string, any>();

    const req: any = {
      headers,
      path,
      method: 'POST',
      socket: { remoteAddress: ip },
      requestId: 'test_req_123',
    };

    const res: any = {
      setHeader: jest.fn((k, v) => responseHeaders.set(k, v)),
      getHeader: jest.fn((k) => responseHeaders.get(k)),
    };

    return {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('should allow requests within limit and set rate limit headers', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ max: 3, windowMs: 60000 });

    const ctx = createMockContext('10.0.0.1');
    const allowed = guard.canActivate(ctx);

    expect(allowed).toBe(true);
    const res = ctx.switchToHttp().getResponse();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 3);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 2);
  });

  it('should reject requests exceeding limit with 429 Too Many Requests', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ max: 2, windowMs: 60000 });

    const ctx1 = createMockContext('10.0.0.2');
    const ctx2 = createMockContext('10.0.0.2');
    const ctx3 = createMockContext('10.0.0.2');

    expect(guard.canActivate(ctx1)).toBe(true);
    expect(guard.canActivate(ctx2)).toBe(true);

    try {
      guard.canActivate(ctx3);
      fail('Expected HttpException 429');
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(err.getResponse().error.code).toBe('TOO_MANY_REQUESTS');
    }
  });
});

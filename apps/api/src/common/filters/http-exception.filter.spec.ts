import { ArgumentsHost, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter (S7)', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  const createMockHost = (requestId = 'req_filter_123'): { host: ArgumentsHost; res: any } => {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      getHeader: jest.fn().mockReturnValue(undefined),
      setHeader: jest.fn(),
    };

    const req: any = {
      requestId,
      method: 'GET',
      url: '/api/v1/test',
      headers: { 'x-request-id': requestId },
    };

    const host = {
      switchToHttp: () => ({
        getResponse: () => res,
        getRequest: () => req,
      }),
    } as unknown as ArgumentsHost;

    return { host, res };
  };

  it('should format HttpException into standard error envelope with requestId', () => {
    const { host, res } = createMockHost('req_custom_999');
    const exception = new NotFoundException('Resource not found');

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Resource not found',
          requestId: 'req_custom_999',
        }),
      })
    );
  });

  it('should sanitize 500 error in production environment', () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { host, res } = createMockHost('req_prod_500');
    const exception = new Error('Database password leak in stack trace');

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected internal error occurred',
          requestId: 'req_prod_500',
        }),
      })
    );

    process.env.NODE_ENV = prevEnv;
  });
});

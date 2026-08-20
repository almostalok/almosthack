import { StructuredLoggerService } from './structured-logger.service';

describe('StructuredLoggerService (S7)', () => {
  let logger: StructuredLoggerService;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new StructuredLoggerService('TestContext');
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should emit structured JSON format on log()', () => {
    logger.log('Server started successfully', 'Bootstrap');

    expect(logSpy).toHaveBeenCalled();
    const rawOutput = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(rawOutput);

    expect(parsed).toHaveProperty('timestamp');
    expect(parsed).toHaveProperty('level', 'info');
    expect(parsed).toHaveProperty('service', 'almosthack-api');
    expect(parsed).toHaveProperty('context', 'Bootstrap');
    expect(parsed).toHaveProperty('message', 'Server started successfully');
  });

  it('should automatically redact sensitive metadata in info()', () => {
    logger.info('User login event', 'Auth', {
      userId: 'usr_123',
      password: 'myPassword!',
      token: 'jwt_token_here',
    });

    expect(logSpy).toHaveBeenCalled();
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);

    expect(parsed.metadata.userId).toBe('usr_123');
    expect(parsed.metadata.password).toBe('[REDACTED]');
    expect(parsed.metadata.token).toBe('[REDACTED]');
  });

  it('should format and emit security events via logSecurityEvent()', () => {
    logger.logSecurityEvent('AUTH_LOGIN_FAILED', {
      requestId: 'req_xyz_123',
      ip: '192.168.1.1',
      resource: '/api/v1/auth/login',
      reason: 'Invalid password',
      metadata: { password: 'wrongPassword' },
    });

    expect(warnSpy).toHaveBeenCalled();
    const parsed = JSON.parse(warnSpy.mock.calls[0][0]);

    expect(parsed.securityEvent).toBe('AUTH_LOGIN_FAILED');
    expect(parsed.requestId).toBe('req_xyz_123');
    expect(parsed.ip).toBe('192.168.1.1');
    expect(parsed.metadata.password).toBe('[REDACTED]');
  });

  it('should emit structured JSON format on error()', () => {
    logger.error('Database connection failed', 'stack_trace_here', 'Database');

    expect(errorSpy).toHaveBeenCalled();
    const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('Database connection failed');
  });
});

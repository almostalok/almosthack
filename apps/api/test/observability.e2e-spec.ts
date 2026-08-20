import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Reflector } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';
import { MetricsService } from '../src/modules/metrics/metrics.service';
import { StructuredLoggerService } from '../src/common/logger/structured-logger.service';
import { RedisHealthIndicator } from '../src/infrastructure/redis/redis.health';

jest.setTimeout(30000);

describe('S7 Observability, Reliability & Production Hardening (E2E)', () => {
  let app: INestApplication;
  let metricsService: MetricsService;
  let userCookie: string;

  beforeAll(async () => {
    const mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockImplementation((key: string) => {
        return Promise.resolve({ [key]: { status: 'up' } });
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisHealthIndicator)
      .useValue(mockRedisHealthIndicator)
      .compile();

    app = moduleFixture.createNestApplication();
    metricsService = app.get(MetricsService);

    // Replicate main.ts bootstrap pipeline
    app.use(cookieParser());
    app.use(requestIdMiddleware);
    app.use(helmet());

    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
    });

    const reflector = app.get(Reflector);
    const structuredLogger = new StructuredLoggerService('E2E');
    app.useGlobalInterceptors(
      new LoggingInterceptor(structuredLogger, metricsService),
      new TransformInterceptor(reflector)
    );
    app.useGlobalFilters(new HttpExceptionFilter(structuredLogger, metricsService));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    app.setGlobalPrefix('api', {
      exclude: [
        'health',
        'health/live',
        'health/ready',
        'health/liveness',
        'health/readiness',
        'health/version',
        'metrics',
        'metrics/prometheus',
      ],
    });

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();

    // Register a test user for authenticated checks
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `s7_obs_${Date.now()}@almosthack.com`,
        password: 'Password123!',
        name: 'S7 Observability User',
      });
    userCookie = regRes.get('Set-Cookie')?.[0] || '';
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('1. Health & Readiness Probes', () => {
    it('GET /health/live should return 200 OK without database dependency', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('uptimeSeconds');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('GET /health/liveness alias should return 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/liveness')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ok');
    });

    it('GET /health/ready should check database and return status', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/ready');

      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('info');
    });

    it('GET /health/readiness alias should return valid probe result', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/readiness');

      expect([200, 503]).toContain(res.status);
    });

    it('GET /health overview should return service metadata', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('service', 'almosthack-api');
      expect(res.body).toHaveProperty('endpoints');
    });

    it('GET /health/version should return build metadata without secrets', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/version')
        .expect(200);

      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('commitSha');
      expect(res.body).toHaveProperty('environment');
      expect(res.body).toHaveProperty('buildTimestamp');
      expect(res.body).toHaveProperty('service', 'almosthack-api');
      expect(res.body).not.toHaveProperty('databaseUrl');
      expect(res.body).not.toHaveProperty('jwtSecret');
    });
  });

  describe('2. Metrics & Observability Telemetry', () => {
    it('GET /metrics should return structured JSON metrics summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(res.body).toHaveProperty('uptimeSeconds');
      expect(res.body).toHaveProperty('process');
      expect(res.body).toHaveProperty('requests');
      expect(res.body).toHaveProperty('latency');
      expect(res.body).toHaveProperty('errors');
    });

    it('GET /metrics/prometheus should return Prometheus text format', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics/prometheus')
        .expect(200);

      expect(res.header['content-type']).toContain('text/plain');
      expect(res.text).toContain('process_uptime_seconds');
      expect(res.text).toContain('http_requests_total');
    });
  });

  describe('3. Request Correlation & X-Request-ID Propagation', () => {
    it('should generate and return X-Request-ID header when not supplied by client', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);

      expect(res.headers).toHaveProperty('x-request-id');
      expect(typeof res.headers['x-request-id']).toBe('string');
      expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
    });

    it('should echo custom X-Request-ID supplied by client', async () => {
      const customId = 'client-trace-id-abc-123';
      const res = await request(app.getHttpServer())
        .get('/health/live')
        .set('X-Request-ID', customId)
        .expect(200);

      expect(res.headers['x-request-id']).toBe(customId);
    });

    it('should include X-Request-ID in error response body and headers', async () => {
      const customId = 'err-trace-id-999';
      const res = await request(app.getHttpServer())
        .get('/api/v1/non-existent-endpoint')
        .set('X-Request-ID', customId)
        .expect(404);

      expect(res.headers['x-request-id']).toBe(customId);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('requestId', customId);
    });
  });

  describe('4. Security Headers & CORS Enforcement', () => {
    it('should include Helmet security headers in HTTP responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);

      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(res.headers).toHaveProperty('x-frame-options');
    });

    it('should allow approved CORS origin and return credentials header', async () => {
      const res = await request(app.getHttpServer())
        .options('/api/v1/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('5. Error Classification & Standard Envelope', () => {
    it('should return 400 with VALIDATION_ERROR envelope on malformed body', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error).toHaveProperty('requestId');
    });

    it('should return 401 UNAUTHORIZED envelope on unauthenticated protected route', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(res.body.error).toHaveProperty('requestId');
    });

    it('should return 404 NOT_FOUND envelope on missing resource', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/missing-resource-route')
        .expect(404);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });
});

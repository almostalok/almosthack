import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';
import { PrismaService } from '../src/database/prisma.service';
import { RedisHealthIndicator } from '../src/infrastructure/redis/redis.health';
import { QueueService } from '../src/infrastructure/queue/queue.service';

describe('Backend Infrastructure (E2E)', () => {
  let app: INestApplication;
  let mockPrismaService: Partial<PrismaService>;
  let mockRedisHealthIndicator: Partial<RedisHealthIndicator>;
  let mockQueueService: Partial<QueueService>;

  beforeAll(async () => {
    mockPrismaService = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    };

    mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    mockQueueService = {
      addJob: jest.fn().mockResolvedValue({ id: 'mocked_job_id_123' } as any),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(RedisHealthIndicator)
      .useValue(mockRedisHealthIndicator)
      .overrideProvider(QueueService)
      .useValue(mockQueueService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Re-apply same pipeline as main.ts
    app.use(requestIdMiddleware);
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor(reflector));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    app.setGlobalPrefix('api', {
      exclude: ['health/liveness', 'health/readiness'],
    });
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health Endpoints', () => {
    it('GET /health/liveness should return 200 OK with unwrapped status', async () => {
      const res = await request(app.getHttpServer()).get('/health/liveness').expect(200);

      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.headers['x-request-id']).toBeDefined();
    });

    it('GET /health/readiness should check PostgreSQL and return status', async () => {
      const res = await request(app.getHttpServer()).get('/health/readiness');

      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
      expect(res.headers['x-request-id']).toBeDefined();
    });
  });

  describe('Request ID propagation', () => {
    it('should generate X-Request-ID when not provided by client', async () => {
      const res = await request(app.getHttpServer()).get('/health/liveness').expect(200);

      expect(res.headers['x-request-id']).toBeDefined();
      expect(typeof res.headers['x-request-id']).toBe('string');
      expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
    });

    it('should validate and reuse client-provided X-Request-ID header', async () => {
      const customId = 'custom-request-id-999';
      const res = await request(app.getHttpServer())
        .get('/health/liveness')
        .set('X-Request-ID', customId)
        .expect(200);

      expect(res.headers['x-request-id']).toBe(customId);
    });
  });

  describe('Standardized Error Format', () => {
    it('should return standardized JSON error structure on 404', async () => {
      const res = await request(app.getHttpServer()).get('/non-existent-route').expect(404);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error).toHaveProperty('requestId');
      expect(res.headers['x-request-id']).toBe(res.body.error.requestId);
    });
  });

  describe('Infrastructure Queue Endpoint', () => {
    it('POST /api/v1/infrastructure-test/enqueue should enqueue job and propagate request correlation ID', async () => {
      const customId = 'req_e2e_test_123';
      const res = await request(app.getHttpServer())
        .post('/api/v1/infrastructure-test/enqueue')
        .set('X-Request-ID', customId)
        .send({ message: 'e2e test message', jobId: 'e2e_job_1' })
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('enqueued', true);
      expect(res.body.data).toHaveProperty('jobId', 'mocked_job_id_123');
      expect(res.body.data).toHaveProperty('correlationId', customId);
      expect(res.body.data).toHaveProperty('queue', 'infrastructure-test');
    });
  });
});

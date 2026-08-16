import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';
import { PrismaService } from '../src/database/prisma.service';
import { RedisHealthIndicator } from '../src/infrastructure/redis/redis.health';
import { QueueService } from '../src/infrastructure/queue/queue.service';

describe('Authentication & Identity E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    name: 'E2E Participant',
    email: `e2e_${Date.now()}@almosthack.org`,
    password: 'SecurePassword123!',
  };

  let sessionCookie: string;

  beforeAll(async () => {
    const mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    const mockQueueService = {
      addJob: jest.fn().mockResolvedValue({ id: 'mocked_job_id_123' } as any),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisHealthIndicator)
      .useValue(mockRedisHealthIndicator)
      .overrideProvider(QueueService)
      .useValue(mockQueueService)
      .compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get<PrismaService>(PrismaService);

    app.use(cookieParser());
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
    if (prisma) {
      // Clean up test data if needed
      await prisma.user.deleteMany({ where: { email: { startsWith: 'e2e_' } } });
    }
    if (app) {
      await app.close();
    }
  });

  it('1. GET /api/v1/auth/me should reject unauthenticated request with 401', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code');
  });

  it('2. POST /api/v1/auth/register should register new participant user and set HttpOnly session cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('email', testUser.email.toLowerCase());
    expect(res.body.data).toHaveProperty('name', testUser.name);
    expect(res.body.data).toHaveProperty('roles', ['PARTICIPANT']);
    expect(res.body.data).not.toHaveProperty('passwordHash');

    // Verify Set-Cookie header
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieHeader = Array.isArray(cookies) ? cookies.join(';') : cookies;
    expect(cookieHeader).toContain('almosthack_session=');
    expect(cookieHeader).toContain('HttpOnly');

    sessionCookie = cookieHeader;
  });

  it('3. POST /api/v1/auth/register duplicate email should return 409 EMAIL_ALREADY_EXISTS', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Another Name',
        email: testUser.email,
        password: 'Password123!',
      })
      .expect(409);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'EMAIL_ALREADY_EXISTS');
  });

  it('4. GET /api/v1/auth/me with valid session cookie should return user identity', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', [sessionCookie])
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('email', testUser.email.toLowerCase());
    expect(res.body.data).toHaveProperty('roles', ['PARTICIPANT']);
  });

  it('5. POST /api/v1/auth/login with invalid password should return 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      })
      .expect(401);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
  });

  it('6. POST /api/v1/auth/login with valid credentials should rotate session and return 200 OK', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('email', testUser.email.toLowerCase());

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieHeader = Array.isArray(cookies) ? cookies.join(';') : cookies;
    expect(cookieHeader).toContain('almosthack_session=');

    // Update cookie reference
    sessionCookie = cookieHeader;
  });

  it('7. POST /api/v1/infrastructure-test/enqueue when authenticated should succeed', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/infrastructure-test/enqueue')
      .set('Cookie', [sessionCookie])
      .send({ message: 'e2e authenticated job', jobId: 'auth_e2e_job_1' })
      .expect(201);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('enqueued', true);
  });

  it('8. POST /api/v1/auth/logout should revoke session and clear cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', [sessionCookie])
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
  });

  it('9. GET /api/v1/auth/me after logout should return 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', [sessionCookie])
      .expect(401);

    expect(res.body).toHaveProperty('success', false);
  });
});

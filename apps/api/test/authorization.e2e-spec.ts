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
import { RoleName } from '@almosthack/types';

describe('RBAC & Authorization E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    name: 'Auth E2E User',
    email: `auth_e2e_${Date.now()}@almosthack.org`,
    password: 'SecurePassword123!',
  };

  let sessionCookie: string;
  let userId: string;

  beforeAll(async () => {
    const mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    const mockQueueService = {
      addJob: jest.fn().mockResolvedValue({ id: 'mocked_job_id_auth_e2e' } as any),
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

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    });

    await app.init();

    // Register user to obtain credentials and session
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    userId = regRes.body.data.id;
    const cookies = regRes.headers['set-cookie'];
    sessionCookie = Array.isArray(cookies) ? cookies.join(';') : cookies;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.userRole.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await app.close();
  });

  describe('Unauthenticated Request Protection', () => {
    it('GET /api/v1/users/me -> 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('GET /api/v1/auth/test/authenticated -> 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/test/authenticated')
        .expect(401);
    });

    it('GET /api/v1/auth/test/admin-only -> 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/test/admin-only')
        .expect(401);
    });
  });

  describe('Authenticated Participant Authorization', () => {
    it('GET /api/v1/users/me -> 200 OK (with PROFILE_READ_SELF)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .expect(200);

      expect(res.body.data).toHaveProperty('id', userId);
      expect(res.body.data.roles).toContain(RoleName.PARTICIPANT);
    });

    it('PATCH /api/v1/users/me -> 200 OK (with PROFILE_UPDATE_SELF)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .send({ bio: 'Updated bio for authorization test' })
        .expect(200);

      expect(res.body.data.bio).toBe('Updated bio for authorization test');
    });

    it('GET /api/v1/auth/test/authenticated -> 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/test/authenticated')
        .set('Cookie', [sessionCookie])
        .expect(200);

      expect(res.body.data.status).toBe('success');
    });

    it('GET /api/v1/auth/test/admin-only -> 403 Forbidden for PARTICIPANT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/test/admin-only')
        .set('Cookie', [sessionCookie])
        .expect(403);

      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('GET /api/v1/auth/test/organizer-only -> 403 Forbidden for PARTICIPANT', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/test/organizer-only')
        .set('Cookie', [sessionCookie])
        .expect(403);
    });

    it('GET /api/v1/auth/test/permission-required -> 403 Forbidden (missing SYSTEM_HEALTH_READ)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/test/permission-required')
        .set('Cookie', [sessionCookie])
        .expect(403);
    });

    it('GET /api/v1/auth/test/multiple-permissions-and -> 200 OK (has both PROFILE_READ_SELF & PROFILE_UPDATE_SELF)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/test/multiple-permissions-and')
        .set('Cookie', [sessionCookie])
        .expect(200);

      expect(res.body.data.status).toBe('success');
    });

    it('GET /api/v1/auth/test/scope-contract/hackathon-101 -> 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/test/scope-contract/hackathon-101')
        .set('Cookie', [sessionCookie])
        .expect(200);

      expect(res.body.data.scope.id).toBe('hackathon-101');
    });
  });

  describe('Role Escalation & Admin Role Authorization', () => {
    it('assign ADMIN role in DB and grant admin access', async () => {
      const adminRole = await prisma.role.findUnique({ where: { name: RoleName.ADMIN } });
      if (adminRole) {
        await prisma.userRole.create({
          data: {
            userId,
            roleId: adminRole.id,
          },
        });

        const res = await request(app.getHttpServer())
          .get('/api/v1/auth/test/admin-only')
          .set('Cookie', [sessionCookie])
          .expect(200);

        expect(res.body.data.status).toBe('success');
      }
    });
  });

  describe('Production Protection Safety', () => {
    it('returns 403 Forbidden when NODE_ENV is set to production', async () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await request(app.getHttpServer())
          .get('/api/v1/auth/test/authenticated')
          .set('Cookie', [sessionCookie])
          .expect(403);
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });
  });
});

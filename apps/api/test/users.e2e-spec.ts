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

describe('Users & Profile E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    name: 'Profile E2E User',
    email: `profile_e2e_${Date.now()}@almosthack.org`,
    password: 'SecurePassword123!',
  };

  let sessionCookie: string;

  beforeAll(async () => {
    const mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    const mockQueueService = {
      addJob: jest.fn().mockResolvedValue({ id: 'mocked_job_id_users_e2e' } as any),
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

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();

    // Clean up test user if pre-existing
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });

    // Register user & obtain session cookie
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    const cookies = res.headers['set-cookie'];
    sessionCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/v1/users/me', () => {
    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should return authenticated user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.name).toBe(testUser.name);
      expect(res.body.data.roles).toContain('PARTICIPANT');
      expect(res.body.data.passwordHash).toBeUndefined();
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update user profile with valid payload and persist to PostgreSQL', async () => {
      const patchData = {
        name: 'Updated Profile Name',
        bio: 'Building transparent hackathon tools',
        college: 'Stanford University',
        branch: 'Computer Science',
        graduationYear: 2026,
        skills: ['React', 'NestJS', 'PostgreSQL'],
        githubUsername: 'octocat',
        linkedinUrl: 'https://linkedin.com/in/octocat',
        portfolioUrl: 'https://octocat.dev',
      };

      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .send(patchData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(patchData.name);
      expect(res.body.data.bio).toBe(patchData.bio);
      expect(res.body.data.college).toBe(patchData.college);
      expect(res.body.data.branch).toBe(patchData.branch);
      expect(res.body.data.graduationYear).toBe(patchData.graduationYear);
      expect(res.body.data.skills).toEqual(patchData.skills);
      expect(res.body.data.githubUsername).toBe(patchData.githubUsername);
      expect(res.body.data.linkedinUrl).toBe(patchData.linkedinUrl);
      expect(res.body.data.portfolioUrl).toBe(patchData.portfolioUrl);

      // Verify persistence via GET
      const getRes = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .expect(200);

      expect(getRes.body.data.name).toBe(patchData.name);
      expect(getRes.body.data.bio).toBe(patchData.bio);
    });

    it('should perform partial update without overwriting un-supplied fields', async () => {
      const partialData = {
        name: 'Renamed User Only',
      };

      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .send(partialData)
        .expect(200);

      expect(res.body.data.name).toBe('Renamed User Only');
      // Bio and college from previous test should remain intact
      expect(res.body.data.bio).toBe('Building transparent hackathon tools');
      expect(res.body.data.college).toBe('Stanford University');
    });

    it('should reject attempt to update forbidden field "email"', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .send({ email: 'hacked@forbidden.com' })
        .expect(400);
    });

    it('should reject attempt to update forbidden field "roles"', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .send({ roles: ['ADMIN'] })
        .expect(400);
    });

    it('should reject malformed or javascript: URLs', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .send({ avatarUrl: 'javascript:alert(1)' })
        .expect(400);
    });

    it('should reject out-of-bounds graduation year', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .send({ graduationYear: 1800 })
        .expect(400);
    });

    it('should reject oversized bio', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', [sessionCookie])
        .send({ bio: 'a'.repeat(501) })
        .expect(400);
    });
  });
});

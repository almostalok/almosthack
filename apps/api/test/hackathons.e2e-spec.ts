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

describe('Hackathon Domain & Lifecycle E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();

  const userA = {
    name: 'Org A Owner User',
    email: `hackathon_owner_a_${timestamp}@almosthack.org`,
    password: 'SecurePassword123!',
  };
  let cookieUserA: string;
  let userAId: string;
  let orgAId: string;

  const userB = {
    name: 'Org B Owner User',
    email: `hackathon_owner_b_${timestamp}@almosthack.org`,
    password: 'SecurePassword123!',
  };
  let cookieUserB: string;
  let userBId: string;
  let orgBId: string;

  let hackathonAId: string;
  let hackathonBId: string;

  beforeAll(async () => {
    const mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    const mockQueueService = {
      addJob: jest.fn().mockResolvedValue({ id: 'mocked_job_id_hackathon_e2e' } as any),
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

    // 1. Register User A & Create Organization A
    const resA = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(userA)
      .expect(201);
    cookieUserA = resA.get('Set-Cookie')?.[0] || '';
    userAId = resA.body.data.id;

    const orgResA = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Cookie', cookieUserA)
      .send({
        name: `Organization Alpha ${timestamp}`,
        description: 'Alpha organization for hackathons',
      })
      .expect(201);
    orgAId = orgResA.body.data.id;

    // 2. Register User B & Create Organization B
    const resB = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(userB)
      .expect(201);
    cookieUserB = resB.get('Set-Cookie')?.[0] || '';
    userBId = resB.body.data.id;

    const orgResB = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Cookie', cookieUserB)
      .send({
        name: `Organization Beta ${timestamp}`,
        description: 'Beta organization for hackathons',
      })
      .expect(201);
    orgBId = orgResB.body.data.id;
  });

  afterAll(async () => {
    if (prisma) {
      if (hackathonAId) {
        await prisma.hackathon.deleteMany({ where: { id: hackathonAId } });
      }
      if (hackathonBId) {
        await prisma.hackathon.deleteMany({ where: { id: hackathonBId } });
      }
      if (orgAId) {
        await prisma.organizationMember.deleteMany({ where: { organizationId: orgAId } });
        await prisma.organization.deleteMany({ where: { id: orgAId } });
      }
      if (orgBId) {
        await prisma.organizationMember.deleteMany({ where: { organizationId: orgBId } });
        await prisma.organization.deleteMany({ where: { id: orgBId } });
      }
      if (userAId) {
        await prisma.userRole.deleteMany({ where: { userId: userAId } });
        await prisma.user.deleteMany({ where: { id: userAId } });
      }
      if (userBId) {
        await prisma.userRole.deleteMany({ where: { userId: userBId } });
        await prisma.user.deleteMany({ where: { id: userBId } });
      }
    }
    await app.close();
  });

  describe('1. Hackathon Creation & Initial DRAFT State', () => {
    it('should allow Org A Owner (User A) to create a hackathon in Org A', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${orgAId}/hackathons`)
        .set('Cookie', cookieUserA)
        .send({
          name: `Alpha Global Hackathon ${timestamp}`,
          description: 'A global hackathon event for alpha organization',
          timezone: 'Asia/Kolkata',
          registrationStartsAt: '2026-09-01T00:00:00.000Z',
          registrationEndsAt: '2026-09-10T00:00:00.000Z',
          startsAt: '2026-09-15T00:00:00.000Z',
          endsAt: '2026-09-20T00:00:00.000Z',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(`Alpha Global Hackathon ${timestamp}`);
      expect(res.body.data.status).toBe('DRAFT');
      expect(res.body.data.visibility).toBe('PRIVATE');
      expect(res.body.data.timezone).toBe('Asia/Kolkata');

      hackathonAId = res.body.data.id;
    });

    it('should reject creation with invalid chronological date order', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/organizations/${orgAId}/hackathons`)
        .set('Cookie', cookieUserA)
        .send({
          name: 'Invalid Hackathon',
          timezone: 'UTC',
          registrationStartsAt: '2026-09-10T00:00:00.000Z',
          registrationEndsAt: '2026-09-01T00:00:00.000Z',
          startsAt: '2026-09-15T00:00:00.000Z',
          endsAt: '2026-09-20T00:00:00.000Z',
        })
        .expect(400);
    });

    it('should list hackathon under organization', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/organizations/${orgAId}/hackathons`)
        .set('Cookie', cookieUserA)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((h: any) => h.id === hackathonAId);
      expect(found).toBeDefined();
    });
  });

  describe('2. Hackathon Details & Update', () => {
    it('should get hackathon details by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}`)
        .set('Cookie', cookieUserA)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(hackathonAId);
    });

    it('should allow modifying allowed configuration fields', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}`)
        .set('Cookie', cookieUserA)
        .send({
          description: 'Updated hackathon description',
          websiteUrl: 'https://alpha-hackathon.example.com',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Updated hackathon description');
      expect(res.body.data.websiteUrl).toBe('https://alpha-hackathon.example.com');
    });

    it('should reject generic update attempts to mutate status directly', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}`)
        .set('Cookie', cookieUserA)
        .send({
          status: 'LIVE',
        })
        .expect(400);
    });
  });

  describe('3. Publishing & Lifecycle Endpoint', () => {
    it('should publish DRAFT hackathon to PUBLISHED status', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/publish`)
        .set('Cookie', cookieUserA)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PUBLISHED');
      expect(res.body.data.visibility).toBe('PUBLIC');
      expect(res.body.data.publishedAt).not.toBeNull();
    });

    it('should return derived lifecycle and registration status via GET /lifecycle', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/lifecycle`)
        .set('Cookie', cookieUserA)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.hackathonId).toBe(hackathonAId);
      expect(res.body.data.hackathonStatus).toBeDefined();
      expect(res.body.data.registrationStatus).toBeDefined();
      expect(res.body.data.now).toBeDefined();
      expect(res.body.data.timezone).toBe('Asia/Kolkata');
    });

    it('should reject re-publishing an already PUBLISHED hackathon', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/publish`)
        .set('Cookie', cookieUserA)
        .expect(409);
    });
  });

  describe('4. Archiving Rules', () => {
    it('should reject archiving a PUBLISHED/LIVE hackathon', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/archive`)
        .set('Cookie', cookieUserA)
        .expect(409);
    });
  });

  describe('5. Cross-Organization Access Isolation (Critical Requirement)', () => {
    it('should create Hackathon B in Org B owned by User B', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${orgBId}/hackathons`)
        .set('Cookie', cookieUserB)
        .send({
          name: `Beta Security Challenge ${timestamp}`,
          timezone: 'America/New_York',
          registrationStartsAt: '2026-10-01T00:00:00.000Z',
          registrationEndsAt: '2026-10-10T00:00:00.000Z',
          startsAt: '2026-10-15T00:00:00.000Z',
          endsAt: '2026-10-20T00:00:00.000Z',
        })
        .expect(201);

      hackathonBId = res.body.data.id;
    });

    it('should block User A (non-member of Org B) from listing Org B hackathons', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/organizations/${orgBId}/hackathons`)
        .set('Cookie', cookieUserA)
        .expect(403);
    });

    it('should block User A from fetching Hackathon B details', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonBId}`)
        .set('Cookie', cookieUserA)
        .expect(403);
    });

    it('should block User A from modifying Hackathon B', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonBId}`)
        .set('Cookie', cookieUserA)
        .send({ name: 'Hacked Hackathon Name' })
        .expect(403);
    });

    it('should block User A from publishing Hackathon B', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/publish`)
        .set('Cookie', cookieUserA)
        .expect(403);
    });

    it('should block User A from archiving Hackathon B', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/archive`)
        .set('Cookie', cookieUserA)
        .expect(403);
    });
  });

  describe('6. Security, Public Access, and Forbidden Field Attacks', () => {
    it('should reject PATCH requests attempting to mutate status directly', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}`)
        .set('Cookie', cookieUserA)
        .send({ status: 'LIVE' })
        .expect(400);
    });

    it('should reject PATCH requests attempting to mutate organizationId', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}`)
        .set('Cookie', cookieUserA)
        .send({ organizationId: orgBId })
        .expect(400);
    });

    it('should reject PATCH requests attempting to mutate publishedAt timestamp', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}`)
        .set('Cookie', cookieUserA)
        .send({ publishedAt: new Date().toISOString() })
        .expect(400);
    });

    it('should allow User B to read Hackathon A because it is PUBLISHED and PUBLIC', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}`)
        .set('Cookie', cookieUserB)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(hackathonAId);
      expect(res.body.data.visibility).toBe('PUBLIC');
    });

    it('should block User A from reading Hackathon B while it is DRAFT (even if visibility is PUBLIC)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonBId}`)
        .set('Cookie', cookieUserA)
        .expect(403);
    });
  });
});

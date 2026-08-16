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

describe('Organization Domain & Scoped Authorization E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();

  const userA = {
    name: 'User Alpha',
    email: `user_a_${timestamp}@almosthack.org`,
    password: 'SecurePassword123!',
  };
  let cookieUserA: string;
  let userAId: string;

  const userB = {
    name: 'User Beta',
    email: `user_b_${timestamp}@almosthack.org`,
    password: 'SecurePassword123!',
  };
  let cookieUserB: string;
  let userBId: string;

  let createdOrgId: string;
  let createdOrgSlug: string;

  let orgBId: string;

  beforeAll(async () => {
    const mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    const mockQueueService = {
      addJob: jest.fn().mockResolvedValue({ id: 'mocked_job_id_org_e2e' } as any),
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

    // Register User A
    const resA = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(userA)
      .expect(201);
    cookieUserA = resA.get('Set-Cookie')?.[0] || '';
    userAId = resA.body.data.id;

    // Register User B
    const resB = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(userB)
      .expect(201);
    cookieUserB = resB.get('Set-Cookie')?.[0] || '';
    userBId = resB.body.data.id;
  });

  afterAll(async () => {
    if (prisma) {
      if (createdOrgId) {
        await prisma.organizationMember.deleteMany({ where: { organizationId: createdOrgId } });
        await prisma.organization.deleteMany({ where: { id: createdOrgId } });
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

  describe('1. Organization Creation & Initial Ownership', () => {
    it('should create an organization and assign creator as OWNER', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .set('Cookie', cookieUserA)
        .send({
          name: `Alpha Innovations ${timestamp}`,
          description: 'Leading hackathon organization',
          websiteUrl: 'https://alpha.example.com',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(`Alpha Innovations ${timestamp}`);
      expect(res.body.data.slug).toContain('alpha-innovations');
      createdOrgId = res.body.data.id;
      createdOrgSlug = res.body.data.slug;
    });

    it('should list organization in /organizations/me as OWNER', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/organizations/me')
        .set('Cookie', cookieUserA)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const myOrg = res.body.data.find((item: any) => item.organization.id === createdOrgId);
      expect(myOrg).toBeDefined();
      expect(myOrg.role).toBe('OWNER');
    });

    it('should reject organization creation with duplicate slug', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .set('Cookie', cookieUserB)
        .send({
          name: 'Duplicate Org',
          slug: createdOrgSlug,
        })
        .expect(409);
    });
  });

  describe('2. Member Addition & Role Management', () => {
    it('should allow OWNER to add User B as MEMBER', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${createdOrgId}/members`)
        .set('Cookie', cookieUserA)
        .send({
          userId: userBId,
          role: 'MEMBER',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe(userBId);
      expect(res.body.data.role).toBe('MEMBER');
    });

    it('should list User B in user organizations/me', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/organizations/me')
        .set('Cookie', cookieUserB)
        .expect(200);

      const orgItem = res.body.data.find((item: any) => item.organization.id === createdOrgId);
      expect(orgItem).toBeDefined();
      expect(orgItem.role).toBe('MEMBER');
    });

    it('should allow OWNER to promote User B to ADMIN', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/organizations/${createdOrgId}/members/${userBId}`)
        .set('Cookie', cookieUserA)
        .send({ role: 'ADMIN' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('ADMIN');
    });
  });

  describe('3. Ownership Transfer & Last Owner Protection', () => {
    it('should allow current OWNER to transfer ownership to User B', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${createdOrgId}/transfer-ownership`)
        .set('Cookie', cookieUserA)
        .send({ newOwnerId: userBId })
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify User B is now OWNER and User A is ADMIN
      const membersRes = await request(app.getHttpServer())
        .get(`/api/v1/organizations/${createdOrgId}/members`)
        .set('Cookie', cookieUserB)
        .expect(200);

      const newOwner = membersRes.body.data.find((m: any) => m.userId === userBId);
      const formerOwner = membersRes.body.data.find((m: any) => m.userId === userAId);
      expect(newOwner.role).toBe('OWNER');
      expect(formerOwner.role).toBe('ADMIN');
    });

    it('should enforce Last Owner Invariant when attempting to remove sole OWNER', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/organizations/${createdOrgId}/members/${userBId}`)
        .set('Cookie', cookieUserB)
        .expect(409);
    });
  });

  describe('4. Cross-Organization Access Isolation (Critical Requirement)', () => {
    it('should create Organization B owned by User B', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .set('Cookie', cookieUserB)
        .send({
          name: `Beta Security Corp ${timestamp}`,
        })
        .expect(201);

      orgBId = res.body.data.id;
    });

    it('should block User A (non-member) from accessing Organization B details', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/organizations/${orgBId}`)
        .set('Cookie', cookieUserA)
        .expect(403);
    });

    it('should block User A from modifying Organization B settings', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/organizations/${orgBId}`)
        .set('Cookie', cookieUserA)
        .send({ name: 'Hacked Org Name' })
        .expect(403);
    });

    it('should block User A from deleting Organization B', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/organizations/${orgBId}`)
        .set('Cookie', cookieUserA)
        .send({ confirmation: 'beta-security-corp' })
        .expect(403);
    });
  });

  describe('5. Organization Deletion', () => {
    it('should allow current OWNER (User B) to delete Organization A with slug confirmation', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/organizations/${createdOrgId}`)
        .set('Cookie', cookieUserB)
        .send({ confirmation: createdOrgSlug })
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify org is no longer accessible
      const checkRes = await request(app.getHttpServer())
        .get(`/api/v1/organizations/${createdOrgId}`)
        .set('Cookie', cookieUserB);

      expect([403, 404]).toContain(checkRes.status);
    });
  });
});

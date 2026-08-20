import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { RoleName } from '@almosthack/types';

describe('Audit Logs API (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let participantCookie: string;
  let adminCookie: string;
  let adminUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    app.use(cookieParser());
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

    // 1. Register normal participant user
    const partEmail = `part_audit_${Date.now()}@almosthack.com`;
    const partRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: partEmail,
        password: 'Password123!',
        name: 'Participant Auditor',
      });
    participantCookie = partRes.get('Set-Cookie')?.[0] || '';

    // 2. Register admin user
    const adminEmail = `admin_audit_${Date.now()}@almosthack.com`;
    const adminRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: adminEmail,
        password: 'Password123!',
        name: 'Admin Auditor',
      });
    adminCookie = adminRes.get('Set-Cookie')?.[0] || '';
    adminUserId = adminRes.body?.id || adminRes.body?.data?.user?.id || adminRes.body?.data?.id;

    // Elevate admin user to ADMIN role in database
    const adminRole = await prisma.role.upsert({
      where: { name: RoleName.ADMIN },
      update: {},
      create: {
        name: RoleName.ADMIN,
        description: 'System Administrator',
      },
    });
    await prisma.userRole.create({
      data: {
        userId: adminUserId,
        roleId: adminRole.id,
      },
    });

    // Seed test audit logs
    await prisma.auditLog.createMany({
      data: [
        {
          actorId: adminUserId,
          actorEmail: adminEmail,
          action: 'hackathon.created',
          targetEntity: 'Hackathon',
          targetId: 'hack_test_1',
          metadata: { name: 'Audit Test Hackathon' },
        },
        {
          actorId: adminUserId,
          actorEmail: adminEmail,
          action: 'submission.finalized',
          targetEntity: 'Submission',
          targetId: 'sub_test_1',
          metadata: { title: 'Audit Test Submission' },
        },
      ],
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/v1/audit-logs', () => {
    it('should reject unauthenticated caller with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .expect(401);
    });

    it('should reject standard participant caller with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Cookie', participantCookie)
        .expect(403);
    });

    it('should allow admin caller to query audit logs with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Cookie', adminCookie)
        .query({ page: 1, limit: 10 })
        .expect(200);

      const payload = res.body?.data || res.body;
      expect(payload).toHaveProperty('items');
      expect(payload).toHaveProperty('pagination');
      expect(Array.isArray(payload.items)).toBe(true);
      expect(payload.items.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter audit logs by action', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Cookie', adminCookie)
        .query({ action: 'hackathon.created' })
        .expect(200);

      const payload = res.body?.data || res.body;
      expect(payload.items.length).toBeGreaterThanOrEqual(1);
      for (const item of payload.items) {
        expect(item.action).toBe('hackathon.created');
      }
    });

    it('should filter audit logs by targetEntity', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Cookie', adminCookie)
        .query({ targetEntity: 'Submission' })
        .expect(200);

      const payload = res.body?.data || res.body;
      expect(payload.items.length).toBeGreaterThanOrEqual(1);
      for (const item of payload.items) {
        expect(item.targetEntity).toBe('Submission');
      }
    });
  });
});

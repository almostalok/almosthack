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

  describe('7. Hackathon Configuration Management (S2-02)', () => {
    it('should retrieve auto-provisioned default configuration for Hackathon B', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonBId}/configuration`)
        .set('Cookie', cookieUserB)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.hackathonId).toBe(hackathonBId);
      expect(res.body.data.participationMode).toBe('BOTH');
      expect(res.body.data.minTeamSize).toBe(1);
      expect(res.body.data.maxTeamSize).toBe(4);
      expect(res.body.data.eligibilityType).toBe('OPEN');
      expect(res.body.data.aiUsagePolicy).toBe('ALLOWED');
      expect(res.body.data.aiDisclosureRequired).toBe(false);
      expect(res.body.data.preExistingCodePolicy).toBe('PROHIBITED');
      expect(res.body.data.openSourcePolicy).toBe('ALLOWED_WITH_ATTRIBUTION');
      expect(res.body.data.githubRequired).toBe(true);
      expect(res.body.data.repositoryPolicy).toBe('PLATFORM_MANAGED');
    });

    it('should update Hackathon B configuration with full policy set in DRAFT state', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/hackathons/${hackathonBId}/configuration`)
        .set('Cookie', cookieUserB)
        .send({
          participationMode: 'TEAM',
          minTeamSize: 2,
          maxTeamSize: 6,
          eligibilityType: 'STUDENTS_ONLY',
          allowedBranches: [' CSE ', 'cse', 'ECE'],
          allowedColleges: ['Stanford University', 'MIT'],
          graduationYearFrom: 2024,
          graduationYearTo: 2028,
          aiUsagePolicy: 'RESTRICTED',
          aiDisclosureRequired: true,
          preExistingCodePolicy: 'ALLOWED_WITH_DISCLOSURE',
          openSourcePolicy: 'RESTRICTED',
          githubRequired: false,
          repositoryPolicy: 'EXTERNAL_ALLOWED',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.participationMode).toBe('TEAM');
      expect(res.body.data.minTeamSize).toBe(2);
      expect(res.body.data.maxTeamSize).toBe(6);
      expect(res.body.data.eligibilityType).toBe('STUDENTS_ONLY');
      expect(res.body.data.allowedBranches).toEqual(['CSE', 'ECE']);
      expect(res.body.data.allowedColleges).toEqual(['Stanford University', 'MIT']);
      expect(res.body.data.graduationYearFrom).toBe(2024);
      expect(res.body.data.graduationYearTo).toBe(2028);
      expect(res.body.data.aiUsagePolicy).toBe('RESTRICTED');
      expect(res.body.data.aiDisclosureRequired).toBe(true);
      expect(res.body.data.preExistingCodePolicy).toBe('ALLOWED_WITH_DISCLOSURE');
      expect(res.body.data.openSourcePolicy).toBe('RESTRICTED');
      expect(res.body.data.githubRequired).toBe(false);
      expect(res.body.data.repositoryPolicy).toBe('EXTERNAL_ALLOWED');
    });

    it('should normalize minTeamSize and maxTeamSize to null when INDIVIDUAL mode is selected', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/hackathons/${hackathonBId}/configuration`)
        .set('Cookie', cookieUserB)
        .send({
          participationMode: 'INDIVIDUAL',
          minTeamSize: 3,
          maxTeamSize: 5,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.participationMode).toBe('INDIVIDUAL');
      expect(res.body.data.minTeamSize).toBeNull();
      expect(res.body.data.maxTeamSize).toBeNull();
    });

    it('should reject invalid team size invariant (min > max)', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/hackathons/${hackathonBId}/configuration`)
        .set('Cookie', cookieUserB)
        .send({
          participationMode: 'TEAM',
          minTeamSize: 6,
          maxTeamSize: 2,
        })
        .expect(400);
    });

    it('should reject invalid graduation year invariant (from > to)', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/hackathons/${hackathonBId}/configuration`)
        .set('Cookie', cookieUserB)
        .send({
          graduationYearFrom: 2029,
          graduationYearTo: 2024,
        })
        .expect(400);
    });

    it('should reject invalid enum values in configuration payload', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/hackathons/${hackathonBId}/configuration`)
        .set('Cookie', cookieUserB)
        .send({
          aiUsagePolicy: 'INVALID_AI_POLICY',
        })
        .expect(400);
    });

    it('should block cross-organization configuration access (User A accessing Hackathon B)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonBId}/configuration`)
        .set('Cookie', cookieUserA)
        .expect(403);

      await request(app.getHttpServer())
        .put(`/api/v1/hackathons/${hackathonBId}/configuration`)
        .set('Cookie', cookieUserA)
        .send({ participationMode: 'INDIVIDUAL' })
        .expect(403);
    });
  });

  describe('8. Hackathon Participant Rules Management (S2-02)', () => {
    it('should retrieve rules summary for Hackathon B', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonBId}/rules`)
        .set('Cookie', cookieUserB)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.hackathonId).toBe(hackathonBId);
      expect(res.body.data.hackathonName).toBeDefined();
      expect(res.body.data.participationMode).toBeDefined();
    });

    it('should update rules markdown in DRAFT state for Hackathon B', async () => {
      const markdown = '# Official Hackathon Guidelines\n\n- All code must be written during the event.\n- Be respectful to other participants.';
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonBId}/rules`)
        .set('Cookie', cookieUserB)
        .send({
          rulesMarkdown: markdown,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.rulesMarkdown).toBe(markdown);
    });

    it('should reject rules markdown exceeding 100,000 characters', async () => {
      const hugeMarkdown = 'A'.repeat(100001);
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonBId}/rules`)
        .set('Cookie', cookieUserB)
        .send({
          rulesMarkdown: hugeMarkdown,
        })
        .expect(400);
    });

    it('should block cross-org rules mutation (User A modifying Hackathon B rules)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonBId}/rules`)
        .set('Cookie', cookieUserA)
        .send({
          rulesMarkdown: 'Unauthorized rules edit',
        })
        .expect(403);
    });

    it('should reject unauthenticated anonymous access to rules', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/rules`)
        .expect(401);
    });

    it('should allow authenticated User B to read rules for Hackathon A (which is PUBLISHED and PUBLIC)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/rules`)
        .set('Cookie', cookieUserB)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.hackathonId).toBe(hackathonAId);
    });
  });

  // =========================================================================
  // Section 9: Hackathon Tracks Management (S2-03)
  // =========================================================================
  describe('9. Hackathon Tracks Management', () => {
    let track1Id: string;
    let track2Id: string;

    it('should create a track with auto-generated slug and display order', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'AI & Machine Learning',
          shortDescription: 'Build next-gen agents',
          description: 'Detailed description of the AI track.',
          isActive: true,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('AI & Machine Learning');
      expect(res.body.data.slug).toBe('ai-machine-learning');
      expect(res.body.data.displayOrder).toBe(1);
      track1Id = res.body.data.id;
    });

    it('should create a second track with next incremental display order', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Web3 & Security',
          slug: 'web3-sec',
          isActive: true,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('web3-sec');
      expect(res.body.data.displayOrder).toBe(2);
      track2Id = res.body.data.id;
    });

    it('should list tracks for hackathon', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserB)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should reject duplicate track slug inside same hackathon with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Another AI Track',
          slug: 'ai-machine-learning',
        })
        .expect(409);
    });

    it('should update track metadata and slug', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonBId}/tracks/${track1Id}`)
        .set('Cookie', cookieUserB)
        .send({
          shortDescription: 'Updated AI track description',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.shortDescription).toBe('Updated AI track description');
    });

    it('should reorder tracks atomically', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonBId}/tracks/reorder`)
        .set('Cookie', cookieUserB)
        .send({
          items: [
            { id: track2Id, displayOrder: 1 },
            { id: track1Id, displayOrder: 2 },
          ],
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should block cross-org track creation (User A creating track in Hackathon B)', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserA)
        .send({
          name: 'Malicious Track',
        })
        .expect(403);
    });

    it('should reject parent mismatch (accessing track under wrong hackathon ID)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}/tracks/${track1Id}`)
        .set('Cookie', cookieUserA)
        .send({
          name: 'Mismatch update',
        })
        .expect(404);
    });
  });

  // =========================================================================
  // Section 10: Hackathon Challenges Management (S2-03)
  // =========================================================================
  describe('10. Hackathon Challenges Management', () => {
    let testTrackId: string;
    let challenge1Id: string;
    let challenge2Id: string;

    beforeAll(async () => {
      // Create dedicated track for challenge tests
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'FinTech Innovation',
          shortDescription: 'Next gen finance',
        });
      testTrackId = res.body.data.id;
    });

    it('should create a challenge with problem statement and resources', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/tracks/${testTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Automated Fraud Detector',
          problemStatement: 'Detect fraudulent transactions using machine learning with <50ms latency.',
          requirements: 'Real-time inference API',
          constraints: 'Memory under 512MB',
          expectedOutcome: 'Containerized service',
          resources: [
            { title: 'Transactions Dataset', url: 'https://example.com/data.csv' },
          ],
          status: 'PUBLISHED',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Automated Fraud Detector');
      expect(res.body.data.slug).toBe('automated-fraud-detector');
      expect(res.body.data.status).toBe('PUBLISHED');
      expect(res.body.data.resources.length).toBe(1);
      challenge1Id = res.body.data.id;
    });

    it('should create a second challenge in same track', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/tracks/${testTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Algorithmic Arbitrage Bot',
          problemStatement: 'Execute market making strategies on mock exchange.',
          status: 'DRAFT',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      challenge2Id = res.body.data.id;
    });

    it('should reject challenge creation with dangerous javascript: URL protocol in resource', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/tracks/${testTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'XSS Challenge',
          problemStatement: 'Problem statement text',
          resources: [
            { title: 'Exploit', url: 'javascript:alert(1)' },
          ],
        })
        .expect(400);
    });

    it('should reject duplicate challenge slug within same track', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/tracks/${testTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Duplicate Fraud',
          slug: 'automated-fraud-detector',
          problemStatement: 'Another problem statement',
        })
        .expect(409);
    });

    it('should list challenges for track', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tracks/${testTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should reorder challenges atomically', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/tracks/${testTrackId}/challenges/reorder`)
        .set('Cookie', cookieUserB)
        .send({
          items: [
            { id: challenge2Id, displayOrder: 1 },
            { id: challenge1Id, displayOrder: 2 },
          ],
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should block cross-org challenge creation (User A creating challenge in Hackathon B track)', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/tracks/${testTrackId}/challenges`)
        .set('Cookie', cookieUserA)
        .send({
          name: 'Malicious Challenge',
          problemStatement: 'Unauthorized attempt',
        })
        .expect(403);
    });

    it('should delete a challenge', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/tracks/${testTrackId}/challenges/${challenge2Id}`)
        .set('Cookie', cookieUserB)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should cascade delete challenges when parent track is deleted', async () => {
      // Delete testTrackId
      await request(app.getHttpServer())
        .delete(`/api/v1/hackathons/${hackathonBId}/tracks/${testTrackId}`)
        .set('Cookie', cookieUserB)
        .expect(200);

      // Verify challenge1Id is gone
      await request(app.getHttpServer())
        .get(`/api/v1/tracks/${testTrackId}/challenges/${challenge1Id}`)
        .set('Cookie', cookieUserB)
        .expect(404);
    });
  });

  // =========================================================================
  // Section 11: S2-03 Adversarial Security, Lifecycle & Boundary Hardening Audit
  // =========================================================================
  describe('11. S2-03 Adversarial Security & Invariant Audit', () => {
    let auditTrackId: string;
    let auditChallengeId: string;

    beforeAll(async () => {
      const resTrack = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Security Audit Track',
          shortDescription: 'Track for adversarial testing',
        });
      auditTrackId = resTrack.body.data.id;

      const resChallenge = await request(app.getHttpServer())
        .post(`/api/v1/tracks/${auditTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Audit Challenge',
          problemStatement: 'Valid problem statement for testing.',
          status: 'DRAFT',
        });
      auditChallengeId = resChallenge.body.data.id;
    });

    it('should reject nested parent confusion (Track under wrong Hackathon)', async () => {
      // User A (member of Hackathon A) tries to access auditTrackId (which belongs to Hackathon B) under Hackathon A URL
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/tracks/${auditTrackId}`)
        .set('Cookie', cookieUserA)
        .expect(404);

      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}/tracks/${auditTrackId}`)
        .set('Cookie', cookieUserA)
        .send({ name: 'Confused Patch' })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/api/v1/hackathons/${hackathonAId}/tracks/${auditTrackId}`)
        .set('Cookie', cookieUserA)
        .expect(404);

      // User B (non-member of Org A) tries to mutate Hackathon A -> 403 Forbidden
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonAId}/tracks/${auditTrackId}`)
        .set('Cookie', cookieUserB)
        .send({ name: 'Cross Org Confusion' })
        .expect(403);
    });

    it('should reject nested parent confusion (Challenge under wrong Track)', async () => {
      // Create a dummy second track
      const resDummy = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({ name: 'Dummy Track' });
      const dummyTrackId = resDummy.body.data.id;

      // Access auditChallengeId (belongs to auditTrackId) via dummyTrackId
      await request(app.getHttpServer())
        .get(`/api/v1/tracks/${dummyTrackId}/challenges/${auditChallengeId}`)
        .set('Cookie', cookieUserB)
        .expect(404);

      await request(app.getHttpServer())
        .patch(`/api/v1/tracks/${dummyTrackId}/challenges/${auditChallengeId}`)
        .set('Cookie', cookieUserB)
        .send({ name: 'Hacked Name' })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/api/v1/tracks/${dummyTrackId}/challenges/${auditChallengeId}`)
        .set('Cookie', cookieUserB)
        .expect(404);
    });

    it('should reject reorder payload with foreign IDs or duplicates', async () => {
      // Empty items
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonBId}/tracks/reorder`)
        .set('Cookie', cookieUserB)
        .send({ items: [] })
        .expect(400);

      // Duplicate IDs in array
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonBId}/tracks/reorder`)
        .set('Cookie', cookieUserB)
        .send({
          items: [
            { id: auditTrackId, displayOrder: 1 },
            { id: auditTrackId, displayOrder: 2 },
          ],
        })
        .expect(400);

      // Duplicate displayOrders in array
      await request(app.getHttpServer())
        .patch(`/api/v1/tracks/${auditTrackId}/challenges/reorder`)
        .set('Cookie', cookieUserB)
        .send({
          items: [
            { id: auditChallengeId, displayOrder: 1 },
            { id: auditChallengeId, displayOrder: 1 },
          ],
        })
        .expect(400);

      // Non-existent or foreign ID
      await request(app.getHttpServer())
        .patch(`/api/v1/tracks/${auditTrackId}/challenges/reorder`)
        .set('Cookie', cookieUserB)
        .send({
          items: [
            { id: '00000000-0000-0000-0000-000000000000', displayOrder: 1 },
          ],
        })
        .expect(400);
    });

    it('should reject validation boundary violations', async () => {
      // Track name < 2 chars
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({ name: 'A' })
        .expect(400);

      // Track name > 150 chars
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonBId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({ name: 'A'.repeat(151) })
        .expect(400);

      // Challenge problemStatement < 5 chars
      await request(app.getHttpServer())
        .post(`/api/v1/tracks/${auditTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .send({ name: 'Valid Name', problemStatement: 'Tiny' })
        .expect(400);

      // Challenge resources > 20 items
      const manyResources = Array.from({ length: 21 }, (_, i) => ({
        title: `Resource ${i}`,
        url: `https://example.com/res${i}`,
      }));
      await request(app.getHttpServer())
        .post(`/api/v1/tracks/${auditTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Too Many Resources',
          problemStatement: 'Valid problem statement',
          resources: manyResources,
        })
        .expect(400);

      // Dangerous resource URL protocols
      const dangerousProtocols = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'file:///etc/passwd',
        'vbscript:msgbox(1)',
      ];
      for (const dangerousUrl of dangerousProtocols) {
        await request(app.getHttpServer())
          .post(`/api/v1/tracks/${auditTrackId}/challenges`)
          .set('Cookie', cookieUserB)
          .send({
            name: 'Dangerous URL Test',
            problemStatement: 'Valid problem statement',
            resources: [{ title: 'Exploit', url: dangerousUrl }],
          })
          .expect(400);
      }
    });

    it('should enforce that DRAFT challenges are hidden from non-org public users', async () => {
      // In Hackathon A (which is PUBLISHED and PUBLIC), create a track and 1 DRAFT + 1 PUBLISHED challenge
      const resTrackA = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/tracks`)
        .set('Cookie', cookieUserA)
        .send({ name: 'Public Track In A' });
      const trackAId = resTrackA.body.data.id;

      const resPubChallenge = await request(app.getHttpServer())
        .post(`/api/v1/tracks/${trackAId}/challenges`)
        .set('Cookie', cookieUserA)
        .send({
          name: 'Published Challenge',
          problemStatement: 'Visible to everyone.',
          status: 'PUBLISHED',
        });
      const pubChallengeId = resPubChallenge.body.data.id;

      const resDraftChallenge = await request(app.getHttpServer())
        .post(`/api/v1/tracks/${trackAId}/challenges`)
        .set('Cookie', cookieUserA)
        .send({
          name: 'Draft Secret Challenge',
          problemStatement: 'Hidden from public viewers.',
          status: 'DRAFT',
        });
      const draftChallengeId = resDraftChallenge.body.data.id;

      // User B (non-member of Org A) reads track challenges
      const resUserBList = await request(app.getHttpServer())
        .get(`/api/v1/tracks/${trackAId}/challenges`)
        .set('Cookie', cookieUserB)
        .expect(200);

      const challengeIdsSeenByUserB = resUserBList.body.data.map((c: any) => c.id);
      expect(challengeIdsSeenByUserB).toContain(pubChallengeId);
      expect(challengeIdsSeenByUserB).not.toContain(draftChallengeId);

      // User B attempts direct GET of draft challenge
      await request(app.getHttpServer())
        .get(`/api/v1/tracks/${trackAId}/challenges/${draftChallengeId}`)
        .set('Cookie', cookieUserB)
        .expect(404);

      // User A (member of Org A) sees both
      const resUserAList = await request(app.getHttpServer())
        .get(`/api/v1/tracks/${trackAId}/challenges`)
        .set('Cookie', cookieUserA)
        .expect(200);

      const challengeIdsSeenByUserA = resUserAList.body.data.map((c: any) => c.id);
      expect(challengeIdsSeenByUserA).toContain(pubChallengeId);
      expect(challengeIdsSeenByUserA).toContain(draftChallengeId);
    });

    it('should enforce lifecycle locking when Hackathon effective status is LIVE or COMPLETED', async () => {
      // 1. Create a hackathon
      const futureStart = new Date(Date.now() + 3600 * 1000).toISOString();
      const futureEnd = new Date(Date.now() + 7200 * 1000).toISOString();
      const resLiveHack = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${orgBId}/hackathons`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Live Locked Hackathon',
          registrationStartsAt: new Date(Date.now() + 1000 * 60).toISOString(),
          registrationEndsAt: new Date(Date.now() + 1000 * 1800).toISOString(),
          startsAt: futureStart,
          endsAt: futureEnd,
        });
      const liveHackathonId = resLiveHack.body.data.id;

      // 2. Create track and challenge while in DRAFT
      const resTrack = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${liveHackathonId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({ name: 'Track In Live Hackathon' });
      const liveTrackId = resTrack.body.data.id;

      const resChallenge = await request(app.getHttpServer())
        .post(`/api/v1/tracks/${liveTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Challenge In Live Hackathon',
          problemStatement: 'Problem statement text for testing.',
        });
      const liveChallengeId = resChallenge.body.data.id;

      // 3. Publish it
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${liveHackathonId}/publish`)
        .set('Cookie', cookieUserB)
        .expect(200);

      // 4. Force dates in DB to make effective status LIVE
      await prisma.hackathon.update({
        where: { id: liveHackathonId },
        data: {
          startsAt: new Date(Date.now() - 3600 * 1000),
          endsAt: new Date(Date.now() + 3600 * 1000),
        },
      });

      // Attempt Track creation on LIVE hackathon -> 409
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${liveHackathonId}/tracks`)
        .set('Cookie', cookieUserB)
        .send({ name: 'Forbidden Live Track' })
        .expect(409);

      // Attempt Track update on LIVE hackathon -> 409
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${liveHackathonId}/tracks/${liveTrackId}`)
        .set('Cookie', cookieUserB)
        .send({ name: 'Mutated Track' })
        .expect(409);

      // Attempt Track delete on LIVE hackathon -> 409
      await request(app.getHttpServer())
        .delete(`/api/v1/hackathons/${liveHackathonId}/tracks/${liveTrackId}`)
        .set('Cookie', cookieUserB)
        .expect(409);

      // Attempt Track reorder on LIVE hackathon -> 409
      await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${liveHackathonId}/tracks/reorder`)
        .set('Cookie', cookieUserB)
        .send({ items: [{ id: liveTrackId, displayOrder: 1 }] })
        .expect(409);

      // Attempt Challenge creation on LIVE hackathon -> 409
      await request(app.getHttpServer())
        .post(`/api/v1/tracks/${liveTrackId}/challenges`)
        .set('Cookie', cookieUserB)
        .send({
          name: 'Forbidden Live Challenge',
          problemStatement: 'Problem statement text for testing.',
        })
        .expect(409);

      // Attempt Challenge update on LIVE hackathon -> 409
      await request(app.getHttpServer())
        .patch(`/api/v1/tracks/${liveTrackId}/challenges/${liveChallengeId}`)
        .set('Cookie', cookieUserB)
        .send({ name: 'Mutated Challenge' })
        .expect(409);

      // Attempt Challenge delete on LIVE hackathon -> 409
      await request(app.getHttpServer())
        .delete(`/api/v1/tracks/${liveTrackId}/challenges/${liveChallengeId}`)
        .set('Cookie', cookieUserB)
        .expect(409);

      // Attempt Challenge reorder on LIVE hackathon -> 409
      await request(app.getHttpServer())
        .patch(`/api/v1/tracks/${liveTrackId}/challenges/reorder`)
        .set('Cookie', cookieUserB)
        .send({ items: [{ id: liveChallengeId, displayOrder: 1 }] })
        .expect(409);
    });
  });
});




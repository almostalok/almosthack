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
import { GitHubProviderService } from '../src/modules/repositories/github-provider.service';

describe('Submissions E2E (S3)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let mockGitHubProvider: any;

  const timestamp = Date.now();
  let captainCookie: string;
  let outsiderCookie: string;
  let organizerCookie: string;

  let orgId: string;
  let hackathonId: string;
  let teamId: string;

  let captainUserId: string;
  let outsiderUserId: string;
  let organizerUserId: string;
  let createdSubmissionId: string;

  beforeAll(async () => {
    mockGitHubProvider = {
      getRepository: jest.fn().mockResolvedValue({
        id: 123456,
        name: 'test-team-repo',
        full_name: 'captaingithub/test-team-repo',
        html_url: 'https://github.com/captaingithub/test-team-repo',
        default_branch: 'main',
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisHealthIndicator)
      .useValue({ isHealthy: jest.fn().mockResolvedValue(true) })
      .overrideProvider(QueueService)
      .useValue({
        addJob: jest.fn().mockResolvedValue(true),
        getQueueStats: jest.fn().mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0 }),
      })
      .overrideProvider(GitHubProviderService)
      .useValue(mockGitHubProvider)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.use(requestIdMiddleware);
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor(reflector));
    await app.init();

    prisma = app.get(PrismaService);

    // Setup Test Data
    const captainRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `captain_sub_${timestamp}@test.com`,
        password: 'Password123!',
        name: 'Captain Sub',
      })
      .expect(201);
    captainCookie = captainRes.get('Set-Cookie')?.[0] || '';
    captainUserId = captainRes.body.data.id;

    const outsiderRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `outsider_sub_${timestamp}@test.com`,
        password: 'Password123!',
        name: 'Outsider Sub',
      })
      .expect(201);
    outsiderCookie = outsiderRes.get('Set-Cookie')?.[0] || '';
    outsiderUserId = outsiderRes.body.data.id;

    const organizerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `organizer_sub_${timestamp}@test.com`,
        password: 'Password123!',
        name: 'Organizer Sub',
      })
      .expect(201);
    organizerCookie = organizerRes.get('Set-Cookie')?.[0] || '';
    organizerUserId = organizerRes.body.data.id;

    // Create Organization & Hackathon
    const org = await prisma.organization.create({
      data: {
        name: `Org Sub ${timestamp}`,
        slug: `org-sub-${timestamp}`,
        members: { create: { userId: organizerUserId, role: 'OWNER', status: 'ACTIVE' } },
      },
    });
    orgId = org.id;

    const now = new Date();
    const hackathon = await prisma.hackathon.create({
      data: {
        organizationId: orgId,
        name: `Hackathon Sub ${timestamp}`,
        slug: `hackathon-sub-${timestamp}`,
        status: 'LIVE',
        visibility: 'PUBLIC',
        registrationStartsAt: new Date(now.getTime() - 100000),
        registrationEndsAt: new Date(now.getTime() + 100000),
        startsAt: new Date(now.getTime() - 50000),
        endsAt: new Date(now.getTime() + 50000),
      },
    });
    hackathonId = hackathon.id;

    // Register Captain & Create Team
    await prisma.participantRegistration.create({
      data: { hackathonId, userId: captainUserId, status: 'REGISTERED' },
    });

    const team = await prisma.team.create({
      data: {
        hackathonId,
        name: `Team Sub ${timestamp}`,
        slug: `team-sub-${timestamp}`,
        createdByUserId: captainUserId,
        members: { create: { userId: captainUserId, role: 'CAPTAIN', status: 'ACTIVE' } },
      },
    });
    teamId = team.id;

    // Connect Team Repository
    await prisma.teamRepository.create({
      data: {
        teamId,
        provider: 'GITHUB',
        providerRepositoryId: '123456',
        ownerLogin: 'captaingithub',
        repositoryName: 'test-team-repo',
        repositoryFullName: 'captaingithub/test-team-repo',
        repositoryUrl: 'https://github.com/captaingithub/test-team-repo',
        defaultBranch: 'main',
        status: 'CONNECTED',
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.submission.deleteMany({ where: { hackathonId } });
      await prisma.teamRepository.deleteMany({ where: { teamId } });
      await prisma.teamMember.deleteMany({ where: { teamId } });
      await prisma.team.deleteMany({ where: { id: teamId } });
      await prisma.participantRegistration.deleteMany({ where: { hackathonId } });
      await prisma.hackathon.deleteMany({ where: { id: hackathonId } });
      await prisma.organizationMember.deleteMany({ where: { organizationId: orgId } });
      await prisma.organization.deleteMany({ where: { id: orgId } });
      await prisma.user.deleteMany({
        where: { id: { in: [captainUserId, outsiderUserId, organizerUserId] } },
      });
      await prisma.$disconnect();
    }
    if (app) await app.close();
  });

  describe('POST /api/v1/teams/:teamId/submissions (Draft Lifecycle)', () => {
    it('should reject non-team members from creating a draft (403)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamId}/submissions`)
        .set('Cookie', [outsiderCookie])
        .send({ title: 'Unauthorised Project' });

      expect(res.status).toBe(403);
    });

    it('should allow team captain to create draft submission (201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamId}/submissions`)
        .set('Cookie', [captainCookie])
        .send({
          title: 'Awesome AlmostHack Project',
          description: 'A revolutionary hackathon project',
          demoUrl: 'https://demo.almosthack.dev',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe('Awesome AlmostHack Project');
      expect(res.body.data.status).toBe('DRAFT');

      createdSubmissionId = res.body.data.id;
    });

    it('should allow team captain to update existing draft submission (201/200)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamId}/submissions`)
        .set('Cookie', [captainCookie])
        .send({
          title: 'Awesome AlmostHack Project V2',
          description: 'Updated description',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Awesome AlmostHack Project V2');
      expect(res.body.data.status).toBe('DRAFT');
    });
  });

  describe('GET /api/v1/teams/:teamId/submission', () => {
    it('should return team submission for active team member (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/teams/${teamId}/submission`)
        .set('Cookie', [captainCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdSubmissionId);
    });
  });

  describe('POST /api/v1/submissions/:submissionId/finalize', () => {
    it('should finalize submission and capture repository state (200/201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/submissions/${createdSubmissionId}/finalize`)
        .set('Cookie', [captainCookie])
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('FINALIZED');
      expect(res.body.data.finalizedAt).toBeDefined();
      expect(res.body.data.repository).toBeDefined();
    });

    it('should prevent creating/updating draft after finalization (409 Conflict)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamId}/submissions`)
        .set('Cookie', [captainCookie])
        .send({ title: 'Post Finalization Attempt' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/hackathons/:hackathonId/submissions', () => {
    it('should allow organizer to fetch all hackathon submissions (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonId}/submissions`)
        .set('Cookie', [organizerCookie]);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should forbid non-organizers from fetching all submissions (403)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonId}/submissions`)
        .set('Cookie', [outsiderCookie]);

      expect(res.status).toBe(403);
    });
  });
});

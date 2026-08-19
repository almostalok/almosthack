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

describe('Judging & Rubrics E2E (S3)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();
  let organizerCookie: string;
  let judgeCookie: string;

  let organizerUserId: string;
  let judgeUserId: string;
  let teamMemberJudgeUserId: string;

  let orgId: string;
  let hackathonId: string;
  let teamId: string;
  let submissionId: string;
  let criterionId1: string;
  let criterionId2: string;
  let assignmentId: string;

  beforeAll(async () => {
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

    // Register Users
    const orgRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `org_jdg_${timestamp}@test.com`, password: 'Password123!', name: 'Org Admin' })
      .expect(201);
    organizerCookie = orgRes.get('Set-Cookie')?.[0] || '';
    organizerUserId = orgRes.body.data.id;

    const judgeRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `judge_jdg_${timestamp}@test.com`, password: 'Password123!', name: 'Independent Judge' })
      .expect(201);
    judgeCookie = judgeRes.get('Set-Cookie')?.[0] || '';
    judgeUserId = judgeRes.body.data.id;

    const memberRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `member_jdg_${timestamp}@test.com`, password: 'Password123!', name: 'Team Member Judge' })
      .expect(201);
    teamMemberJudgeUserId = memberRes.body.data.id;

    // Create Organization & Hackathon
    const org = await prisma.organization.create({
      data: {
        name: `Org Judging ${timestamp}`,
        slug: `org-judging-${timestamp}`,
        members: { create: { userId: organizerUserId, role: 'OWNER', status: 'ACTIVE' } },
      },
    });
    orgId = org.id;

    const now = new Date();
    const hackathon = await prisma.hackathon.create({
      data: {
        organizationId: orgId,
        name: `Hackathon Judging ${timestamp}`,
        slug: `hackathon-judging-${timestamp}`,
        status: 'LIVE',
        visibility: 'PUBLIC',
        registrationStartsAt: new Date(now.getTime() - 100000),
        registrationEndsAt: new Date(now.getTime() + 100000),
        startsAt: new Date(now.getTime() - 50000),
        endsAt: new Date(now.getTime() + 50000),
      },
    });
    hackathonId = hackathon.id;

    // Create Team (including teamMemberJudgeUserId)
    const team = await prisma.team.create({
      data: {
        hackathonId,
        name: `Team Judging ${timestamp}`,
        slug: `team-judging-${timestamp}`,
        createdByUserId: teamMemberJudgeUserId,
        members: { create: { userId: teamMemberJudgeUserId, role: 'CAPTAIN', status: 'ACTIVE' } },
      },
    });
    teamId = team.id;

    // Create Submission
    const sub = await prisma.submission.create({
      data: {
        hackathonId,
        teamId,
        title: 'Judging Test Submission',
        description: 'Submission for testing judging workflow',
        status: 'SUBMITTED',
      },
    });
    submissionId = sub.id;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.evaluationScore.deleteMany({});
      await prisma.judgeEvaluation.deleteMany({});
      await prisma.judgeAssignment.deleteMany({ where: { hackathonId } });
      await prisma.judgingCriterion.deleteMany({ where: { hackathonId } });
      await prisma.submission.deleteMany({ where: { hackathonId } });
      await prisma.teamMember.deleteMany({ where: { teamId } });
      await prisma.team.deleteMany({ where: { id: teamId } });
      await prisma.hackathon.deleteMany({ where: { id: hackathonId } });
      await prisma.organizationMember.deleteMany({ where: { organizationId: orgId } });
      await prisma.organization.deleteMany({ where: { id: orgId } });
      await prisma.user.deleteMany({
        where: { id: { in: [organizerUserId, judgeUserId, teamMemberJudgeUserId] } },
      });
      await prisma.$disconnect();
    }
    if (app) await app.close();
  });

  describe('Judging Criteria Management', () => {
    it('should allow organizer to create judging criteria (201)', async () => {
      const res1 = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/judging-criteria`)
        .set('Cookie', [organizerCookie])
        .send({ name: 'Technical Execution', weight: 2.0, maxScore: 10 });

      expect(res1.status).toBe(201);
      expect(res1.body.data.name).toBe('Technical Execution');
      criterionId1 = res1.body.data.id;

      const res2 = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/judging-criteria`)
        .set('Cookie', [organizerCookie])
        .send({ name: 'Innovation & Design', weight: 1.0, maxScore: 10 });

      expect(res2.status).toBe(201);
      criterionId2 = res2.body.data.id;
    });

    it('should list judging criteria for hackathon (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonId}/judging-criteria`)
        .set('Cookie', [organizerCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('Judge Assignment & Conflict of Interest Guard', () => {
    it('should REJECT assigning a judge to evaluate their own team (403 COI)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/submissions/${submissionId}/judges`)
        .set('Cookie', [organizerCookie])
        .send({ judgeUserId: teamMemberJudgeUserId, submissionId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CONFLICT_OF_INTEREST');
    });

    it('should successfully assign independent judge to submission (201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/submissions/${submissionId}/judges`)
        .set('Cookie', [organizerCookie])
        .send({ judgeUserId, submissionId });

      expect(res.status).toBe(201);
      expect(res.body.data.judgeUserId).toBe(judgeUserId);
      assignmentId = res.body.data.id;
    });

    it('should allow assigned judge to retrieve their assigned submissions (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/judge-assignments')
        .set('Cookie', [judgeCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].id).toBe(assignmentId);
    });
  });

  describe('Evaluation Submission & Score Calculation', () => {
    it('should allow assigned judge to save evaluation draft (201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/judge-assignments/${assignmentId}/evaluation`)
        .set('Cookie', [judgeCookie])
        .send({
          generalFeedback: 'Great draft concept',
          scores: [
            { criterionId: criterionId1, score: 8, comment: 'Good tech' },
            { criterionId: criterionId2, score: 7, comment: 'Nice UI' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('should submit final evaluation and calculate deterministic total score (201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/judge-assignments/${assignmentId}/evaluation/submit`)
        .set('Cookie', [judgeCookie])
        .send({
          generalFeedback: 'Excellent work overall',
          scores: [
            { criterionId: criterionId1, score: 9, comment: 'Solid tech execution' },
            { criterionId: criterionId2, score: 8, comment: 'Sleek design' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('SUBMITTED');
      expect(res.body.data.totalScore).toBe(86.67); // (9*2 + 8*1)/(10*2 + 10*1) * 100 = 26/30 * 100 = 86.67
    });

    it('should prevent modifying submitted evaluation (409 Conflict)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/judge-assignments/${assignmentId}/evaluation`)
        .set('Cookie', [judgeCookie])
        .send({
          generalFeedback: 'Tampering attempt',
          scores: [{ criterionId: criterionId1, score: 10 }],
        });

      expect(res.status).toBe(409);
    });
  });
});

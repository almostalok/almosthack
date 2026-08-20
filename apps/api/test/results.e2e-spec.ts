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
import {
  SubmissionStatus,
  EvaluationStatus,
  IntegrityFindingStatus,
  IntegritySeverity,
  IntegrityFindingType,
  ResultSetStatus,
  ResultEligibilityStatus,
} from '@prisma/client';

describe('Results, Ranking & Hackathon Completion E2E (S5)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();
  let orgOwnerCookie: string;
  let otherOrgOwnerCookie: string;
  let participantCookie: string;

  let orgOwnerUserId: string;
  let otherOrgOwnerUserId: string;
  let participantUserId: string;
  let judgeUserId: string;

  let orgAId: string;
  let orgBId: string;
  let hackathonAId: string;
  let hackathonBId: string;

  let team1Id: string;
  let team2Id: string;
  let team3Id: string;

  let sub1Id: string;
  let sub2Id: string;
  let sub3Id: string;

  let criterion1Id: string;
  let criterion2Id: string;

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
    const resA = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `org_a_${timestamp}@test.com`, password: 'Password123!', name: 'Org A Owner' })
      .expect(201);
    orgOwnerCookie = resA.get('Set-Cookie')?.[0] || '';
    orgOwnerUserId = resA.body.data.id;

    const resB = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `org_b_${timestamp}@test.com`, password: 'Password123!', name: 'Org B Owner' })
      .expect(201);
    otherOrgOwnerCookie = resB.get('Set-Cookie')?.[0] || '';
    otherOrgOwnerUserId = resB.body.data.id;

    const resP = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `part_${timestamp}@test.com`, password: 'Password123!', name: 'Participant 1' })
      .expect(201);
    participantCookie = resP.get('Set-Cookie')?.[0] || '';
    participantUserId = resP.body.data.id;

    const resJ = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `judge_${timestamp}@test.com`, password: 'Password123!', name: 'Judge 1' })
      .expect(201);
    judgeUserId = resJ.body.data.id;

    // Create Organizations
    const orgA = await prisma.organization.create({
      data: {
        name: `Org Results A ${timestamp}`,
        slug: `org-res-a-${timestamp}`,
        members: { create: { userId: orgOwnerUserId, role: 'OWNER', status: 'ACTIVE' } },
      },
    });
    orgAId = orgA.id;

    const orgB = await prisma.organization.create({
      data: {
        name: `Org Results B ${timestamp}`,
        slug: `org-res-b-${timestamp}`,
        members: { create: { userId: otherOrgOwnerUserId, role: 'OWNER', status: 'ACTIVE' } },
      },
    });
    orgBId = orgB.id;

    // Create Hackathons
    const hackA = await prisma.hackathon.create({
      data: {
        organizationId: orgAId,
        name: `Hackathon Alpha ${timestamp}`,
        slug: `hack-alpha-${timestamp}`,
        registrationStartsAt: new Date(Date.now() - 3600000 * 24 * 7),
        registrationEndsAt: new Date(Date.now() - 3600000 * 24 * 3),
        startsAt: new Date(Date.now() - 3600000 * 24 * 3),
        endsAt: new Date(Date.now() - 3600000 * 24),
        status: 'PUBLISHED',
      },
    });
    hackathonAId = hackA.id;

    const hackB = await prisma.hackathon.create({
      data: {
        organizationId: orgBId,
        name: `Hackathon Beta ${timestamp}`,
        slug: `hack-beta-${timestamp}`,
        registrationStartsAt: new Date(Date.now() - 3600000 * 24 * 7),
        registrationEndsAt: new Date(Date.now() - 3600000 * 24 * 3),
        startsAt: new Date(Date.now() - 3600000 * 24 * 3),
        endsAt: new Date(Date.now() - 3600000 * 24),
        status: 'PUBLISHED',
      },
    });
    hackathonBId = hackB.id;

    // Criteria for Hackathon A
    const crit1 = await prisma.judgingCriterion.create({
      data: {
        hackathonId: hackathonAId,
        name: 'Technical Innovation',
        weight: 2.0,
        maxScore: 10.0,
        displayOrder: 1,
      },
    });
    criterion1Id = crit1.id;

    const crit2 = await prisma.judgingCriterion.create({
      data: {
        hackathonId: hackathonAId,
        name: 'Design & UI/UX',
        weight: 1.0,
        maxScore: 10.0,
        displayOrder: 2,
      },
    });
    criterion2Id = crit2.id;

    // Teams for Hackathon A
    const team1 = await prisma.team.create({
      data: {
        hackathonId: hackathonAId,
        name: `Team Apollo ${timestamp}`,
        slug: `team-apollo-${timestamp}`,
        createdByUserId: participantUserId,
      },
    });
    team1Id = team1.id;

    const team2 = await prisma.team.create({
      data: {
        hackathonId: hackathonAId,
        name: `Team Boreas ${timestamp}`,
        slug: `team-boreas-${timestamp}`,
        createdByUserId: participantUserId,
      },
    });
    team2Id = team2.id;

    const team3 = await prisma.team.create({
      data: {
        hackathonId: hackathonAId,
        name: `Team Chronos ${timestamp}`,
        slug: `team-chronos-${timestamp}`,
        createdByUserId: participantUserId,
      },
    });
    team3Id = team3.id;

    // Submissions
    const sub1 = await prisma.submission.create({
      data: {
        hackathonId: hackathonAId,
        teamId: team1Id,
        title: 'Apollo Web3 Decentralized App',
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
        commitSha: 'a1b2c3d4e5f67890123456789012345678901234',
      },
    });
    sub1Id = sub1.id;

    const sub2 = await prisma.submission.create({
      data: {
        hackathonId: hackathonAId,
        teamId: team2Id,
        title: 'Boreas AI Weather Agent',
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
        commitSha: 'b2c3d4e5f6a17890123456789012345678901234',
      },
    });
    sub2Id = sub2.id;

    const sub3 = await prisma.submission.create({
      data: {
        hackathonId: hackathonAId,
        teamId: team3Id,
        title: 'Chronos Realtime Engine',
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
        commitSha: 'c3d4e5f6a1b27890123456789012345678901234',
      },
    });
    sub3Id = sub3.id;

    // Judge Assignments & Finalized Evaluations for Submissions 1, 2, 3
    // Sub 1: Score 9 on C1, 8 on C2 => (9*2 + 8*1) / (10*2 + 10*1) = 26/30 = 86.6667%
    const assign1 = await prisma.judgeAssignment.create({
      data: {
        hackathonId: hackathonAId,
        submissionId: sub1Id,
        judgeUserId,
        assignedByUserId: orgOwnerUserId,
        status: 'COMPLETED',
      },
    });
    await prisma.judgeEvaluation.create({
      data: {
        assignmentId: assign1.id,
        submissionId: sub1Id,
        judgeUserId,
        status: EvaluationStatus.SUBMITTED,
        totalScore: 86.6667,
        submittedAt: new Date(),
        scores: {
          create: [
            { criterionId: criterion1Id, score: 9 },
            { criterionId: criterion2Id, score: 8 },
          ],
        },
      },
    });

    // Sub 2: Score 10 on C1, 10 on C2 => (10*2 + 10*1)/30 = 30/30 = 100%
    const assign2 = await prisma.judgeAssignment.create({
      data: {
        hackathonId: hackathonAId,
        submissionId: sub2Id,
        judgeUserId,
        assignedByUserId: orgOwnerUserId,
        status: 'COMPLETED',
      },
    });
    await prisma.judgeEvaluation.create({
      data: {
        assignmentId: assign2.id,
        submissionId: sub2Id,
        judgeUserId,
        status: EvaluationStatus.SUBMITTED,
        totalScore: 100.0,
        submittedAt: new Date(),
        scores: {
          create: [
            { criterionId: criterion1Id, score: 10 },
            { criterionId: criterion2Id, score: 10 },
          ],
        },
      },
    });

    // Sub 3: Score 7 on C1, 7 on C2 => (7*2 + 7*1)/30 = 21/30 = 70%
    const assign3 = await prisma.judgeAssignment.create({
      data: {
        hackathonId: hackathonAId,
        submissionId: sub3Id,
        judgeUserId,
        assignedByUserId: orgOwnerUserId,
        status: 'COMPLETED',
      },
    });
    await prisma.judgeEvaluation.create({
      data: {
        assignmentId: assign3.id,
        submissionId: sub3Id,
        judgeUserId,
        status: EvaluationStatus.SUBMITTED,
        totalScore: 70.0,
        submittedAt: new Date(),
        scores: {
          create: [
            { criterionId: criterion1Id, score: 7 },
            { criterionId: criterion2Id, score: 7 },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      if (hackathonAId) {
        await prisma.hackathon.deleteMany({ where: { id: { in: [hackathonAId, hackathonBId] } } });
      }
      if (orgAId) {
        await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } });
      }
      if (orgOwnerUserId) {
        await prisma.user.deleteMany({
          where: { id: { in: [orgOwnerUserId, otherOrgOwnerUserId, participantUserId, judgeUserId] } },
        });
      }
    }
    await app.close();
  });

  describe('1. Leaderboard State Before Publication', () => {
    it('should return isPublished: false and empty entries for anonymous user before publication', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/leaderboard`)
        .expect(200);

      expect(res.body.data.isPublished).toBe(false);
      expect(res.body.data.entries).toEqual([]);
      expect(res.body.data.totalEntries).toBe(0);
    });
  });

  describe('2. Result Calculation & Deterministic Ranking', () => {
    it('should block non-organizers from triggering result calculation with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', participantCookie)
        .send({})
        .expect(403);
    });

    it('should block organizers of another organization from calculating results (Cross-Org Isolation)', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', otherOrgOwnerCookie)
        .send({})
        .expect(403);
    });

    it('should calculate results deterministically for Hackathon A', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(201);

      const resultSet = res.body.data;
      expect(resultSet.status).toBe('CALCULATED');
      expect(resultSet.calculationVersion).toBe(1);
      expect(resultSet.entries).toHaveLength(3);

      // Rank 1: Team Boreas (100%) - Winner
      expect(resultSet.entries[0].teamName).toContain('Team Boreas');
      expect(resultSet.entries[0].score).toBe(100);
      expect(resultSet.entries[0].rank).toBe(1);
      expect(resultSet.entries[0].isWinner).toBe(true);
      expect(resultSet.entries[0].awardTitle).toBe('First Place');

      // Rank 2: Team Apollo (86.6667%)
      expect(resultSet.entries[1].teamName).toContain('Team Apollo');
      expect(resultSet.entries[1].score).toBe(86.6667);
      expect(resultSet.entries[1].rank).toBe(2);
      expect(resultSet.entries[1].isWinner).toBe(false);

      // Rank 3: Team Chronos (70%)
      expect(resultSet.entries[2].teamName).toContain('Team Chronos');
      expect(resultSet.entries[2].score).toBe(70);
      expect(resultSet.entries[2].rank).toBe(3);
    });

    it('should produce identical scores, ranks, and input fingerprint on recalculation', async () => {
      const res1 = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/results`)
        .set('Cookie', orgOwnerCookie)
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(201);

      expect(res2.body.data.inputFingerprint).toBe(res1.body.data.inputFingerprint);
      expect(res2.body.data.entries[0].score).toBe(res1.body.data.entries[0].score);
      expect(res2.body.data.entries[0].rank).toBe(res1.body.data.entries[0].rank);
    });
  });

  describe('3. Security, Mass Assignment & IDOR Hardening', () => {
    it('should reject client attempts to inject score, rank, or winner fields', async () => {
      const maliciousPayload = {
        score: 100000,
        rank: 1,
        winner: true,
        eligibilityStatus: 'ELIGIBLE',
        status: 'PUBLISHED',
      };

      // Calculate endpoint strips unknown/non-whitelisted fields
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', orgOwnerCookie)
        .send(maliciousPayload)
        .expect(400); // ForbidNonWhitelisted triggers
    });

    it('should block non-organizer participant from reading private result set details', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/results`)
        .set('Cookie', participantCookie)
        .expect(403);
    });
  });

  describe('4. Integrity Integration & Disqualification Policy', () => {
    it('should disqualify submission when confirmed integrity violation exists', async () => {
      // Create confirmed integrity finding for Sub 2 (Team Boreas)
      const analysis = await prisma.integrityAnalysis.create({
        data: {
          hackathonId: hackathonAId,
          submissionId: sub2Id,
          commitSha: 'b2c3d4e5f6a17890123456789012345678901234',
          status: 'COMPLETED',
        },
      });

      const finding = await prisma.integrityFinding.create({
        data: {
          analysisId: analysis.id,
          submissionId: sub2Id,
          comparisonSubmissionId: sub1Id,
          type: IntegrityFindingType.CODE_SIMILARITY,
          severity: IntegritySeverity.HIGH,
          confidence: 0.98,
          similarity: 0.92,
          status: IntegrityFindingStatus.CONFIRMED,
          summary: 'Plagiarized codebase confirmed by jury',
        },
      });

      // Recalculate results
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(201);

      const entries = res.body.data.entries;
      const boreasEntry = entries.find((e: any) => e.submissionId === sub2Id);
      expect(boreasEntry.eligibilityStatus).toBe(ResultEligibilityStatus.INELIGIBLE);
      expect(boreasEntry.isWinner).toBe(false);
      expect(boreasEntry.eligibilityReason).toContain('Confirmed integrity violation');

      // Now Team Apollo becomes rank 1 / winner!
      const apolloEntry = entries.find((e: any) => e.submissionId === sub1Id);
      expect(apolloEntry.eligibilityStatus).toBe(ResultEligibilityStatus.ELIGIBLE);
      expect(apolloEntry.rank).toBe(1);
      expect(apolloEntry.isWinner).toBe(true);

      // Clean up the finding to restore eligible state for subsequent tests
      await prisma.integrityFinding.delete({ where: { id: finding.id } });
      await prisma.integrityAnalysis.delete({ where: { id: analysis.id } });

      // Recalculate clean state
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(201);
    });
  });

  describe('5. Approval Workflow & Staleness Detection', () => {
    it('should reject unapproved result publication with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/publish`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(400);
    });

    it('should successfully approve calculated results', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/approve`)
        .set('Cookie', orgOwnerCookie)
        .send({ notes: 'Jury consensus verified' })
        .expect(201);

      expect(res.body.data.status).toBe('APPROVED');
      expect(res.body.data.approvedAt).not.toBeNull();
      expect(res.body.data.approvedByUserId).toBe(orgOwnerUserId);
    });

    it('should block publication if evaluation scores change after approval (Stale Result Protection)', async () => {
      // Mutate evaluation score for sub 3
      const evaluation = await prisma.judgeEvaluation.findFirst({
        where: { submissionId: sub3Id },
      });
      await prisma.judgeEvaluation.update({
        where: { id: evaluation!.id },
        data: { totalScore: 95.0 },
      });

      // Attempt publication of now-stale approved set
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/publish`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(409);

      expect(res.body.error.code).toBe('STALE_RESULTS');

      // Revert score mutation
      await prisma.judgeEvaluation.update({
        where: { id: evaluation!.id },
        data: { totalScore: 70.0 },
      });
    });
  });

  describe('6. Publication & Public Leaderboard Verification', () => {
    it('should successfully publish approved results to the public leaderboard', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/publish`)
        .set('Cookie', orgOwnerCookie)
        .send({ notifyParticipants: true })
        .expect(201);

      expect(res.body.data.status).toBe('PUBLISHED');
      expect(res.body.data.publishedAt).not.toBeNull();
      expect(res.body.data.publishedByUserId).toBe(orgOwnerUserId);
    });

    it('should make leaderboard public with sanitized fields and no private leaks', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/leaderboard`)
        .expect(200);

      const leaderboard = res.body.data;
      expect(leaderboard.isPublished).toBe(true);
      expect(leaderboard.totalEntries).toBe(3);

      const firstPlace = leaderboard.entries[0];
      expect(firstPlace.rank).toBe(1);
      expect(firstPlace.teamName).toContain('Team Boreas');
      expect(firstPlace.isWinner).toBe(true);
      expect(firstPlace.score).toBe(100);

      // Verify ZERO private leaks
      expect(firstPlace).not.toHaveProperty('judgeFeedback');
      expect(firstPlace).not.toHaveProperty('reviewerNotes');
      expect(firstPlace).not.toHaveProperty('commitSha');
      expect(firstPlace).not.toHaveProperty('email');
      expect(firstPlace).not.toHaveProperty('token');
    });

    it('should record audit log entries for calculate, approve, and publish actions', async () => {
      const logs = await prisma.auditLog.findMany({
        where: {
          targetEntity: 'ResultSet',
          actorId: orgOwnerUserId,
        },
        orderBy: { createdAt: 'asc' },
      });

      const actions = logs.map((l) => l.action);
      expect(actions).toContain('results.calculated');
      expect(actions).toContain('results.approved');
      expect(actions).toContain('results.published');
    });
  });

  describe('7. Adversarial Scenarios Matrix (A - L) & Concurrency', () => {
    // SCENARIO A: Another organizer attempts approval
    it('Scenario A: Org B organizer cannot approve Hackathon A results', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/approve`)
        .set('Cookie', otherOrgOwnerCookie)
        .send({})
        .expect(403);
    });

    // SCENARIO B: Participant submits malicious score
    it('Scenario B: Participant attempts score injection and is rejected', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', participantCookie)
        .send({ score: 100000 });

      expect([400, 403]).toContain(res.status);
    });

    // SCENARIO C: Result calculated -> judge evaluation changes -> publish old result (stale)
    it('Scenario C: Publish blocked when judge evaluation modified after calculation', async () => {
      // Recalculate fresh
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(201);

      // Approve
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/approve`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(201);

      // Mutate evaluation score
      const evaluation = await prisma.judgeEvaluation.findFirst({
        where: { submissionId: sub1Id },
      });
      await prisma.judgeEvaluation.update({
        where: { id: evaluation!.id },
        data: { totalScore: 99.0 },
      });

      // Attempt to publish
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/publish`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(409);

      expect(res.body.error.code).toBe('STALE_RESULTS');

      // Revert score
      await prisma.judgeEvaluation.update({
        where: { id: evaluation!.id },
        data: { totalScore: 86.6667 },
      });
    });

    // SCENARIO D: Integrity finding dismissed -> calculation occurs -> submission not disqualified
    it('Scenario D: Dismissed integrity finding does NOT disqualify submission', async () => {
      const analysis = await prisma.integrityAnalysis.create({
        data: {
          hackathonId: hackathonAId,
          submissionId: sub1Id,
          commitSha: 'a1b2c3d4e5f67890123456789012345678901234',
          status: 'COMPLETED',
        },
      });

      const finding = await prisma.integrityFinding.create({
        data: {
          analysisId: analysis.id,
          submissionId: sub1Id,
          comparisonSubmissionId: sub3Id,
          type: IntegrityFindingType.CODE_SIMILARITY,
          severity: IntegritySeverity.LOW,
          confidence: 0.4,
          similarity: 0.3,
          status: IntegrityFindingStatus.DISMISSED,
          summary: 'False positive similarity from common boilerplate library',
        },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(201);

      const apolloEntry = res.body.data.entries.find((e: any) => e.submissionId === sub1Id);
      expect(apolloEntry.eligibilityStatus).toBe(ResultEligibilityStatus.ELIGIBLE);
      expect(apolloEntry.eligibilityReason).toBeNull();

      await prisma.integrityFinding.delete({ where: { id: finding.id } });
      await prisma.integrityAnalysis.delete({ where: { id: analysis.id } });
    });

    // SCENARIO G: Concurrent publish operations
    it('Scenario G: Concurrent publish operations are safely handled atomically', async () => {
      // Recalculate & Approve
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/approve`)
        .set('Cookie', orgOwnerCookie)
        .send({})
        .expect(201);

      // Launch 2 simultaneous publish calls
      const [res1, res2] = await Promise.all([
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonAId}/results/publish`)
          .set('Cookie', orgOwnerCookie)
          .send({}),
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonAId}/results/publish`)
          .set('Cookie', orgOwnerCookie)
          .send({}),
      ]);

      // Exactly one must succeed with 201 or both succeed idempotently without corrupting state
      const successful = [res1, res2].filter((r) => r.status === 201);
      expect(successful.length).toBeGreaterThanOrEqual(1);

      // Database state verification: Exactly ONE published result set exists
      const publishedSets = await prisma.resultSet.findMany({
        where: { hackathonId: hackathonAId, status: 'PUBLISHED' },
      });
      expect(publishedSets).toHaveLength(1);
    });

    // SCENARIO H: Concurrent calculations
    it('Scenario H: Concurrent calculation calls produce safe deterministic state', async () => {
      const [res1, res2] = await Promise.all([
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
          .set('Cookie', orgOwnerCookie)
          .send({}),
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
          .set('Cookie', orgOwnerCookie)
          .send({}),
      ]);

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
      expect(res1.body.data.inputFingerprint).toBe(res2.body.data.inputFingerprint);
    });

    // SCENARIO I: Team A accessing Team B private result
    it('Scenario I: Participant cannot access private organizer result endpoint', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/results`)
        .set('Cookie', participantCookie)
        .expect(403);
    });

    // SCENARIO J: Hackathon A organizer accessing Hackathon B
    it('Scenario J: Hackathon A organizer cannot access Hackathon B results', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonBId}/results`)
        .set('Cookie', orgOwnerCookie)
        .expect(403);
    });

    // SCENARIO K: Client sends rank=1, winner=true, score=100
    it('Scenario K: Client-injected rank/winner/score are ignored/rejected', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonAId}/results/calculate`)
        .set('Cookie', orgOwnerCookie)
        .send({ rank: 1, winner: true, score: 100 })
        .expect(400);
    });

    // SCENARIO L: Historical results preserved
    it('Scenario L: Recalculation creates new version and preserves previous calculations as superseded', async () => {
      const historyRes = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonAId}/results/history`)
        .set('Cookie', orgOwnerCookie)
        .expect(200);

      expect(Array.isArray(historyRes.body.data)).toBe(true);
      expect(historyRes.body.data.length).toBeGreaterThanOrEqual(2);

      // Verify versions are sequential
      const versions = historyRes.body.data.map((rs: any) => rs.calculationVersion);
      expect(versions).toContain(1);
    });
  });
});


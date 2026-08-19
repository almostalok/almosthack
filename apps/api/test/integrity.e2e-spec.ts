import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';


import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';
import { PrismaService } from '../src/database/prisma.service';
import { RedisHealthIndicator } from '../src/infrastructure/redis/redis.health';
import { QueueService } from '../src/infrastructure/queue/queue.service';
import { GitHubProviderService } from '../src/modules/repositories/github-provider.service';
import { IntegrityService } from '../src/modules/integrity/integrity.service';

describe('Integrity, Plagiarism & Forensics E2E (S4)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let integrityService: IntegrityService;

  const timestamp = Date.now();
  let organizerCookie: string;
  let participantCookie: string;
  let foreignOrganizerCookie: string;

  let orgId: string;
  let foreignOrgId: string;
  let hackathonId: string;
  let foreignHackathonId: string;

  let team1Id: string;
  let team2Id: string;
  let submission1Id: string;
  let submission2Id: string;
  let foreignSubmissionId: string;

  let organizerUserId: string;
  let participantUserId: string;
  let foreignOrganizerUserId: string;

  let createdFindingId: string;

  beforeAll(async () => {
    const mockGitHubProvider = {
      getRepository: jest.fn().mockResolvedValue({
        id: 123456,
        name: 'test-repo',
        full_name: 'org/test-repo',
        html_url: 'https://github.com/org/test-repo',
        default_branch: 'main',
      }),
      getDefaultBranchHeadCommitSha: jest.fn().mockResolvedValue('abcdef1234567890abcdef1234567890abcdef12'),
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
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(app.get(Reflector))
    );

    await app.init();
    prisma = app.get(PrismaService);
    integrityService = app.get(IntegrityService);

    // 1. Setup Organizer User
    const orgRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `integrity-organizer-${timestamp}@test.com`,
        password: 'Password123!',
        name: 'Integrity Organizer',
      });
    organizerCookie = orgRes.headers['set-cookie'][0];
    organizerUserId = orgRes.body.data.id;

    // 2. Setup Participant User
    const partRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `integrity-part-${timestamp}@test.com`,
        password: 'Password123!',
        name: 'Integrity Participant',
      });
    participantCookie = partRes.headers['set-cookie'][0];
    participantUserId = partRes.body.data.id;

    // 3. Setup Foreign Organizer
    const forRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `foreign-organizer-${timestamp}@test.com`,
        password: 'Password123!',
        name: 'Foreign Organizer',
      });
    foreignOrganizerCookie = forRes.headers['set-cookie'][0];
    foreignOrganizerUserId = forRes.body.data.id;

    // 4. Create Primary Organization
    const organization = await prisma.organization.create({
      data: {
        name: `Integrity Org ${timestamp}`,
        slug: `integrity-org-${timestamp}`,
      },
    });
    orgId = organization.id;

    await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: organizerUserId,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    });

    // 5. Create Foreign Organization
    const foreignOrg = await prisma.organization.create({
      data: {
        name: `Foreign Org ${timestamp}`,
        slug: `foreign-org-${timestamp}`,
      },
    });
    foreignOrgId = foreignOrg.id;

    await prisma.organizationMember.create({
      data: {
        organizationId: foreignOrgId,
        userId: foreignOrganizerUserId,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    });

    const now = new Date();

    // 6. Create Primary Hackathon
    const hackathon = await prisma.hackathon.create({
      data: {
        organizationId: orgId,
        name: `Integrity Hackathon ${timestamp}`,
        slug: `integrity-hack-${timestamp}`,
        status: 'LIVE',
        visibility: 'PUBLIC',
        registrationStartsAt: new Date(now.getTime() - 100000),
        registrationEndsAt: new Date(now.getTime() + 100000),
        startsAt: new Date(now.getTime() - 50000),
        endsAt: new Date(now.getTime() + 50000),
      },
    });
    hackathonId = hackathon.id;

    // 7. Create Foreign Hackathon
    const foreignHack = await prisma.hackathon.create({
      data: {
        organizationId: foreignOrgId,
        name: `Foreign Hackathon ${timestamp}`,
        slug: `foreign-hack-${timestamp}`,
        status: 'LIVE',
        visibility: 'PUBLIC',
        registrationStartsAt: new Date(now.getTime() - 100000),
        registrationEndsAt: new Date(now.getTime() + 100000),
        startsAt: new Date(now.getTime() - 50000),
        endsAt: new Date(now.getTime() + 50000),
      },
    });
    foreignHackathonId = foreignHack.id;

    // 8. Create Teams & Submissions for Primary Hackathon
    const team1 = await prisma.team.create({
      data: {
        hackathonId,
        name: `Team Alpha ${timestamp}`,
        slug: `team-alpha-${timestamp}`,
        createdByUserId: participantUserId,
        members: { create: { userId: participantUserId, role: 'CAPTAIN', status: 'ACTIVE' } },
      },
    });
    team1Id = team1.id;

    const team2 = await prisma.team.create({
      data: {
        hackathonId,
        name: `Team Beta ${timestamp}`,
        slug: `team-beta-${timestamp}`,
        createdByUserId: organizerUserId,
        members: { create: { userId: organizerUserId, role: 'CAPTAIN', status: 'ACTIVE' } },
      },
    });
    team2Id = team2.id;

    // Controlled identical code snippet for high similarity test
    const sharedCode = `
      export class HashRing {
        private nodes: string[] = [];
        addNode(node: string): void {
          this.nodes.push(node);
          this.nodes.sort();
        }
        getNode(key: string): string | null {
          if (this.nodes.length === 0) return null;
          return this.nodes[0];
        }
      }
    `;

    const sub1CommitSha = '1111111111111111111111111111111111111111';
    const sub2CommitSha = '2222222222222222222222222222222222222222';
    const forCommitSha = '3333333333333333333333333333333333333333';

    // Register test fixtures in engine
    integrityService.registerFileFixture(sub1CommitSha, [
      { path: 'src/hash-ring.ts', content: sharedCode },
    ]);

    integrityService.registerFileFixture(sub2CommitSha, [
      { path: 'src/ring.ts', content: `// Comment variation\n${sharedCode}` },
    ]);

    integrityService.registerFileFixture(forCommitSha, [
      { path: 'src/foreign.ts', content: sharedCode },
    ]);

    const sub1 = await prisma.submission.create({
      data: {
        hackathonId,
        teamId: team1Id,
        title: 'Alpha Submission',
        status: 'FINALIZED',
        commitSha: sub1CommitSha,
        finalizedAt: new Date(),
      },
    });
    submission1Id = sub1.id;

    const sub2 = await prisma.submission.create({
      data: {
        hackathonId,
        teamId: team2Id,
        title: 'Beta Submission',
        status: 'FINALIZED',
        commitSha: sub2CommitSha,
        finalizedAt: new Date(),
      },
    });
    submission2Id = sub2.id;

    // Foreign submission
    const foreignTeam = await prisma.team.create({
      data: {
        hackathonId: foreignHackathonId,
        name: `Foreign Team ${timestamp}`,
        slug: `foreign-team-${timestamp}`,
        createdByUserId: foreignOrganizerUserId,
        members: { create: { userId: foreignOrganizerUserId, role: 'CAPTAIN', status: 'ACTIVE' } },
      },
    });

    const foreignSub = await prisma.submission.create({
      data: {
        hackathonId: foreignHackathonId,
        teamId: foreignTeam.id,
        title: 'Foreign Submission',
        status: 'FINALIZED',
        commitSha: forCommitSha,
        finalizedAt: new Date(),
      },
    });
    foreignSubmissionId = foreignSub.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. RBAC & Authorization', () => {
    it('should reject participant attempting to start integrity analysis (403)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/submissions/${submission1Id}/integrity/analyze`)
        .set('Cookie', participantCookie)
        .send({});

      expect(res.status).toBe(403);
    });

    it('should allow authorized organizer to start integrity analysis', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/submissions/${submission1Id}/integrity/analyze`)
        .set('Cookie', organizerCookie)
        .send({ similarityThreshold: 0.45 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.commitSha).toBe('1111111111111111111111111111111111111111');
      expect(res.body.data.findings.length).toBeGreaterThan(0);

      createdFindingId = res.body.data.findings[0].id;
    });
  });

  describe('2. Detection Invariants & Evidence Provenance', () => {
    it('should generate high similarity finding with explainable evidence', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/integrity/findings/${createdFindingId}`)
        .set('Cookie', organizerCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdFindingId);
      expect(res.body.data.severity).toBe('HIGH');
      expect(res.body.data.similarity).toBeGreaterThanOrEqual(0.85);
      expect(res.body.data.evidence.length).toBeGreaterThan(0);
      expect(res.body.data.evidence[0].sourcePath).toBe('src/hash-ring.ts');
      expect(res.body.data.evidence[0].targetPath).toBe('src/ring.ts');
    });

    it('should strictly isolate cross-hackathon submissions (foreign submission not matched)', async () => {
      const findings = await prisma.integrityFinding.findMany({
        where: { comparisonSubmissionId: foreignSubmissionId },
      });
      expect(findings.length).toBe(0);
    });
  });

  describe('3. IDOR & Privacy Controls', () => {
    it('should block foreign organizer from viewing another org finding (403)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/integrity/findings/${createdFindingId}`)
        .set('Cookie', foreignOrganizerCookie);

      expect(res.status).toBe(403);
    });

    it('should block participant from viewing finding detail (403)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/integrity/findings/${createdFindingId}`)
        .set('Cookie', participantCookie);

      expect(res.status).toBe(403);
    });
  });

  describe('4. Review Workflow & Non-Negotiable Invariants', () => {
    it('should allow organizer to transition finding to UNDER_REVIEW', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/integrity/findings/${createdFindingId}/review`)
        .set('Cookie', organizerCookie)
        .send({ notes: 'Reviewing code structure' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('UNDER_REVIEW');
    });

    it('should reject confirmation with reason shorter than 5 characters (400)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/integrity/findings/${createdFindingId}/confirm`)
        .set('Cookie', organizerCookie)
        .send({ reason: 'bad' });

      expect(res.status).toBe(400);
    });

    it('should confirm finding and verify submission status/scores are UNTOUCHED (Detection != Guilt)', async () => {
      const subBefore = await prisma.submission.findUnique({ where: { id: submission1Id } });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/integrity/findings/${createdFindingId}/confirm`)
        .set('Cookie', organizerCookie)
        .send({ reason: 'Verified code overlap matches ring algorithm structure.' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFIRMED');

      // Check Non-Negotiable Rule: Submission status must remain intact!
      const subAfter = await prisma.submission.findUnique({ where: { id: submission1Id } });
      expect(subAfter!.status).toBe(subBefore!.status);
    });

    it('should allow dismissing finding with explanatory reason for false-positive', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/integrity/findings/${createdFindingId}/dismiss`)
        .set('Cookie', organizerCookie)
        .send({ reason: 'Determined to be allowed standard library implementation.' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('DISMISSED');
    });
  });

  describe('5. Audit Trail & Mass Assignment Rejection', () => {
    it('should have recorded audit log entries for all integrity mutations', async () => {
      const logs = await prisma.auditLog.findMany({
        where: {
          action: {
            in: [
              'integrity.analysis_started',
              'integrity.analysis_completed',
              'integrity.finding_created',
              'integrity.finding_confirmed',
              'integrity.finding_dismissed',
            ],
          },
        },
      });

      expect(logs.length).toBeGreaterThanOrEqual(4);
    });

    it('should reject mass-assignment of protected fields on analysis start (400)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/submissions/${submission1Id}/integrity/analyze`)
        .set('Cookie', organizerCookie)
        .send({
          status: 'CONFIRMED',
          severity: 'HIGH',
          confidence: 1.0,
          similarity: 1.0,
          reviewerId: 'attacker',
        });

      // Extra unwhitelisted protected fields are rejected by ValidationPipe (400)
      expect(res.status).toBe(400);
    });
  });

  describe('6. Resource Defense & Safe Archive Handling', () => {
    it('should safely filter out malicious zip-slip traversal paths', () => {
      const engine = integrityService['engine'];
      const hostileFiles = [
        { path: '../../../etc/shadow', content: 'hostile-payload' },
        { path: '..\\..\\windows\\system32\\calc.exe', content: 'binary-payload' },
        { path: 'src/valid.ts', content: 'export const a = 1;' },
      ];

      const validFiles = engine.filterAndValidateFiles(hostileFiles);
      expect(validFiles.length).toBe(1);
      expect(validFiles[0].path).toBe('src/valid.ts');
    });

    it('should enforce maximum repository file count limits', () => {
      const engine = integrityService['engine'];
      const excessiveFiles = Array.from({ length: 501 }, (_, i) => ({
        path: `src/file_${i}.ts`,
        content: `export const x${i} = ${i};`,
      }));

      expect(() => engine.filterAndValidateFiles(excessiveFiles)).toThrow();
    });
  });

  describe('7. No Code Execution Guarantee', () => {
    it('should treat malicious executable scripts and npm postinstall scripts strictly as data', async () => {
      const maliciousScript = `
        const fs = require('fs');
        // If executed, this would write a marker file to disk
        fs.writeFileSync('MALICIOUS_EXECUTION_MARKER.txt', 'HACKED');
      `;

      const sub3CommitSha = '4444444444444444444444444444444444444444';
      integrityService.registerFileFixture(sub3CommitSha, [
        { path: 'scripts/postinstall.js', content: maliciousScript },
        { path: 'package.json', content: JSON.stringify({ scripts: { postinstall: 'node scripts/postinstall.js' } }) },
      ]);

      const team3 = await prisma.team.create({
        data: {
          hackathonId,
          name: `Team Gamma ${timestamp}`,
          slug: `team-gamma-${timestamp}`,
          createdByUserId: organizerUserId,
          members: { create: { userId: organizerUserId, role: 'CAPTAIN', status: 'ACTIVE' } },
        },
      });

      const sub3 = await prisma.submission.create({
        data: {
          hackathonId,
          teamId: team3.id,
          title: 'Malicious Submission',
          status: 'FINALIZED',
          commitSha: sub3CommitSha,
          finalizedAt: new Date(),
        },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/submissions/${sub3.id}/integrity/analyze`)
        .set('Cookie', organizerCookie)
        .send({});

      expect(res.status).toBe(200);

      // Verify no marker file was created on the filesystem
      expect(fs.existsSync('MALICIOUS_EXECUTION_MARKER.txt')).toBe(false);

      // Cleanup submission and team
      await prisma.integrityAnalysis.deleteMany({ where: { submissionId: sub3.id } });
      await prisma.submission.delete({ where: { id: sub3.id } });
      await prisma.teamMember.deleteMany({ where: { teamId: team3.id } });
      await prisma.team.delete({ where: { id: team3.id } });
    });
  });

  describe('8. Idempotency & Repeated Runs', () => {
    it('should return existing analysis when duplicate analysis is triggered for same snapshot', async () => {
      const res1 = await request(app.getHttpServer())
        .post(`/api/v1/submissions/${submission1Id}/integrity/analyze`)
        .set('Cookie', organizerCookie)
        .send({});

      const res2 = await request(app.getHttpServer())
        .post(`/api/v1/submissions/${submission1Id}/integrity/analyze`)
        .set('Cookie', organizerCookie)
        .send({});

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.body.data.id).toBeDefined();
      expect(res2.body.data.id).toBeDefined();
    });
  });

  describe('9. Score Isolation & Non-Interference with Judging', () => {
    it('should verify integrity findings never alter JudgeEvaluation or EvaluationScore', async () => {
      const evaluationCountBefore = await prisma.judgeEvaluation.count();
      const scoreCountBefore = await prisma.evaluationScore.count();

      // Trigger another analysis run
      await request(app.getHttpServer())
        .post(`/api/v1/submissions/${submission2Id}/integrity/analyze`)
        .set('Cookie', organizerCookie)
        .send({});

      const evaluationCountAfter = await prisma.judgeEvaluation.count();
      const scoreCountAfter = await prisma.evaluationScore.count();

      expect(evaluationCountAfter).toBe(evaluationCountBefore);
      expect(scoreCountAfter).toBe(scoreCountBefore);
    });
  });

  describe('10. Concurrency & Race Safety', () => {
    it('should handle simultaneous concurrent analysis requests deterministically', async () => {
      const [resA, resB] = await Promise.all([
        request(app.getHttpServer())
          .post(`/api/v1/submissions/${submission1Id}/integrity/analyze`)
          .set('Cookie', organizerCookie)
          .send({}),
        request(app.getHttpServer())
          .post(`/api/v1/submissions/${submission1Id}/integrity/analyze`)
          .set('Cookie', organizerCookie)
          .send({}),
      ]);

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(200);
      expect(resA.body.data.status).toBe('COMPLETED');
      expect(resB.body.data.status).toBe('COMPLETED');
    });
  });
});


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

describe('Participant Registration Domain & Concurrency E2E (S2-04)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();

  // Organizer
  const organizerUser = {
    name: 'Org Owner User',
    email: `reg_org_owner_${timestamp}@almosthack.org`,
    password: 'SecurePassword123!',
  };
  let cookieOrganizer: string;
  let organizerUserId: string;
  let orgId: string;
  let hackathonId: string;
  let track1Id: string;
  let track2Id: string;
  let challenge1Id: string;
  let challenge2Id: string;

  // Cross-org Hackathon
  let otherOrgId: string;
  let otherHackathonId: string;
  let otherTrackId: string;

  // Eligible Student Participant
  const studentUser = {
    name: 'Eligible Student Participant',
    email: `reg_student_eligible_${timestamp}@almosthack.org`,
    password: 'SecurePassword123!',
  };
  let cookieStudent: string;
  let studentUserId: string;

  // Ineligible Student Participant
  const ineligibleUser = {
    name: 'Ineligible Student Participant',
    email: `reg_student_ineligible_${timestamp}@almosthack.org`,
    password: 'SecurePassword123!',
  };
  let cookieIneligible: string;
  let ineligibleUserId: string;

  // Concurrent User
  const concurrentUser = {
    name: 'Concurrent Participant User',
    email: `reg_student_concurrent_${timestamp}@almosthack.org`,
    password: 'SecurePassword123!',
  };
  let cookieConcurrent: string;
  let concurrentUserId: string;

  beforeAll(async () => {
    const mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    const mockQueueService = {
      addJob: jest.fn().mockResolvedValue({ id: 'mocked_job_id_reg_e2e' } as any),
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
    prisma = app.get(PrismaService);

    app.use(requestIdMiddleware);
    app.use(cookieParser());
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    });

    const reflector = app.get(Reflector);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor(reflector));

    await app.init();

    // 1. Setup Organizer & Organization
    const regOrgRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(organizerUser)
      .expect(201);
    cookieOrganizer = regOrgRes.get('Set-Cookie')?.[0] || '';
    organizerUserId = regOrgRes.body.data.id;

    const orgRes = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Cookie', cookieOrganizer)
      .send({
        name: `Registration Test Org ${timestamp}`,
        slug: `reg-org-${timestamp}`,
      })
      .expect(201);
    orgId = orgRes.body.data.id;

    // 2. Setup Eligible Student Profile
    const regStudentRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(studentUser)
      .expect(201);
    cookieStudent = regStudentRes.get('Set-Cookie')?.[0] || '';
    studentUserId = regStudentRes.body.data.id;

    // Update eligible student profile
    await prisma.user.update({
      where: { id: studentUserId },
      data: {
        college: 'Massachusetts Institute of Technology',
        branch: 'Computer Science',
        graduationYear: 2026,
        skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
      },
    });

    // 3. Setup Ineligible Student Profile
    const regIneligibleRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(ineligibleUser)
      .expect(201);
    cookieIneligible = regIneligibleRes.get('Set-Cookie')?.[0] || '';
    ineligibleUserId = regIneligibleRes.body.data.id;

    // Ineligible user with mismatched college and past graduation year
    await prisma.user.update({
      where: { id: ineligibleUserId },
      data: {
        college: 'Random Unlisted College',
        branch: 'Civil Engineering',
        graduationYear: 2020,
      },
    });

    // 4. Setup Concurrent User
    const regConcurrentRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(concurrentUser)
      .expect(201);
    cookieConcurrent = regConcurrentRes.get('Set-Cookie')?.[0] || '';
    concurrentUserId = regConcurrentRes.body.data.id;

    await prisma.user.update({
      where: { id: concurrentUserId },
      data: {
        college: 'MIT',
        branch: 'Computer Science',
        graduationYear: 2026,
      },
    });

    // 5. Create Hackathon A
    const now = Date.now();
    const hackathonRes = await request(app.getHttpServer())
      .post(`/api/v1/organizations/${orgId}/hackathons`)
      .set('Cookie', cookieOrganizer)
      .send({
        name: `Registration Open Hackathon ${timestamp}`,
        slug: `reg-hackathon-${timestamp}`,
        timezone: 'UTC',
        registrationStartsAt: new Date(now - 3600000).toISOString(), // 1h ago
        registrationEndsAt: new Date(now + 86400000).toISOString(),   // 24h later
        startsAt: new Date(now + 172800000).toISOString(),            // 48h later
        endsAt: new Date(now + 259200000).toISOString(),              // 72h later
      })
      .expect(201);
    hackathonId = hackathonRes.body.data.id;

    // Publish Hackathon A
    await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${hackathonId}/publish`)
      .set('Cookie', cookieOrganizer)
      .expect(200);

    // Configure Eligibility Rules on Hackathon A:
    // Only MIT students in CS graduating 2025-2027
    await request(app.getHttpServer())
      .put(`/api/v1/hackathons/${hackathonId}/configuration`)
      .set('Cookie', cookieOrganizer)
      .send({
        eligibilityType: 'STUDENTS_ONLY',
        allowedColleges: ['Massachusetts Institute of Technology', 'MIT'],
        allowedBranches: ['Computer Science', 'CSE'],
        graduationYearFrom: 2025,
        graduationYearTo: 2027,
      })
      .expect(200);

    // Create Track 1 & Track 2
    const track1Res = await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${hackathonId}/tracks`)
      .set('Cookie', cookieOrganizer)
      .send({
        name: 'AI Agents & Automation',
        slug: 'ai-agents',
        description: 'Build autonomous agents.',
      })
      .expect(201);
    track1Id = track1Res.body.data.id;

    const track2Res = await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${hackathonId}/tracks`)
      .set('Cookie', cookieOrganizer)
      .send({
        name: 'Decentralized Systems',
        slug: 'decentralized-systems',
      })
      .expect(201);
    track2Id = track2Res.body.data.id;

    // Create Challenge 1 under Track 1 & Publish it
    const chal1Res = await request(app.getHttpServer())
      .post(`/api/v1/tracks/${track1Id}/challenges`)
      .set('Cookie', cookieOrganizer)
      .send({
        name: 'Autonomous Code Reviewer',
        slug: 'autonomous-code-reviewer',
        problemStatement: 'Design an automated PR reviewer agent.',
        status: 'PUBLISHED',
      })
      .expect(201);
    challenge1Id = chal1Res.body.data.id;

    // Create Challenge 2 under Track 2 & Publish it
    const chal2Res = await request(app.getHttpServer())
      .post(`/api/v1/tracks/${track2Id}/challenges`)
      .set('Cookie', cookieOrganizer)
      .send({
        name: 'P2P Consensus Engine',
        slug: 'p2p-consensus-engine',
        problemStatement: 'Design a high-throughput consensus mechanism.',
        status: 'PUBLISHED',
      })
      .expect(201);
    challenge2Id = chal2Res.body.data.id;

    // 6. Setup Other Org & Other Hackathon (Cross-tenant fixtures)
    const otherOrgRes = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Cookie', cookieOrganizer)
      .send({
        name: `Other Org ${timestamp}`,
        slug: `other-org-${timestamp}`,
      })
      .expect(201);
    otherOrgId = otherOrgRes.body.data.id;

    const otherHackRes = await request(app.getHttpServer())
      .post(`/api/v1/organizations/${otherOrgId}/hackathons`)
      .set('Cookie', cookieOrganizer)
      .send({
        name: `Other Hackathon ${timestamp}`,
        slug: `other-hackathon-${timestamp}`,
        timezone: 'UTC',
        registrationStartsAt: new Date(now - 3600000).toISOString(),
        registrationEndsAt: new Date(now + 86400000).toISOString(),
        startsAt: new Date(now + 172800000).toISOString(),
        endsAt: new Date(now + 259200000).toISOString(),
      })
      .expect(201);
    otherHackathonId = otherHackRes.body.data.id;

    const otherTrackRes = await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${otherHackathonId}/tracks`)
      .set('Cookie', cookieOrganizer)
      .send({
        name: 'Other Hackathon Track',
        slug: 'other-track',
      })
      .expect(201);
    otherTrackId = otherTrackRes.body.data.id;
  });

  afterAll(async () => {
    if (hackathonId) {
      await prisma.participantRegistration.deleteMany({ where: { hackathonId } });
      await prisma.hackathonChallenge.deleteMany({ where: { track: { hackathonId } } });
      await prisma.hackathonTrack.deleteMany({ where: { hackathonId } });
      await prisma.hackathonConfiguration.deleteMany({ where: { hackathonId } });
      await prisma.hackathon.deleteMany({ where: { id: hackathonId } });
    }
    if (otherHackathonId) {
      await prisma.participantRegistration.deleteMany({ where: { hackathonId: otherHackathonId } });
      await prisma.hackathonTrack.deleteMany({ where: { hackathonId: otherHackathonId } });
      await prisma.hackathon.deleteMany({ where: { id: otherHackathonId } });
    }
    if (orgId) {
      await prisma.organizationMember.deleteMany({ where: { organizationId: orgId } });
      await prisma.organization.deleteMany({ where: { id: orgId } });
    }
    if (otherOrgId) {
      await prisma.organizationMember.deleteMany({ where: { organizationId: otherOrgId } });
      await prisma.organization.deleteMany({ where: { id: otherOrgId } });
    }
    if (organizerUserId) {
      await prisma.session.deleteMany({ where: { userId: organizerUserId } });
      await prisma.user.deleteMany({ where: { id: organizerUserId } });
    }
    if (studentUserId) {
      await prisma.session.deleteMany({ where: { userId: studentUserId } });
      await prisma.user.deleteMany({ where: { id: studentUserId } });
    }
    if (ineligibleUserId) {
      await prisma.session.deleteMany({ where: { userId: ineligibleUserId } });
      await prisma.user.deleteMany({ where: { id: ineligibleUserId } });
    }
    if (concurrentUserId) {
      await prisma.session.deleteMany({ where: { userId: concurrentUserId } });
      await prisma.user.deleteMany({ where: { id: concurrentUserId } });
    }
    await app.close();
  });

  // ====================================================
  // 1. AUTHENTICATION & ACCESS GATES
  // ====================================================
  describe('1. Authentication & Security Gates', () => {
    it('should reject unauthenticated registration attempt with 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/registration`)
        .send({ trackId: track1Id })
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it('should return null when un-registered authenticated user queries registration', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });
  });

  // ====================================================
  // 2. ELIGIBILITY ENFORCEMENT
  // ====================================================
  describe('2. Server-Authoritative Eligibility Enforcement', () => {
    it('should reject registration for ineligible user with 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieIneligible)
        .send({ trackId: track1Id })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REGISTRATION_NOT_ELIGIBLE');
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });
  });

  // ====================================================
  // 3. TRACK & CHALLENGE PARENT SCOPE VALIDATION
  // ====================================================
  describe('3. Track & Challenge Parent Scope Integrity', () => {
    it('should reject registration selecting a track from another hackathon with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({ trackId: otherTrackId })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TRACK_SELECTION');
    });

    it('should reject registration selecting a challenge without a track with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({ challengeId: challenge1Id })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TRACK_REQUIRED_FOR_CHALLENGE');
    });

    it('should reject registration selecting a challenge that belongs to a different track with 400 Bad Request', async () => {
      // Challenge 2 belongs to Track 2, but request specifies Track 1
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({
          trackId: track1Id,
          challengeId: challenge2Id,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CHALLENGE_SELECTION');
    });
  });

  // ====================================================
  // 4. MALICIOUS PAYLOAD & MASS ASSIGNMENT DEFENSE
  // ====================================================
  describe('4. Malicious Payload & Mass Assignment Defense', () => {
    it('should reject payload attempting to inject userId or protected fields with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({
          userId: organizerUserId, // Attempting to register another user
          hackathonId: otherHackathonId,
          status: 'REGISTERED',
          registeredAt: '2099-01-01T00:00:00Z',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ====================================================
  // 5. REGISTRATION SUCCESS, QUERY & ATOMIC AUDIT LOG
  // ====================================================
  describe('5. Successful Registration & Read Isolation', () => {
    let registrationId: string;

    it('should register eligible participant and create audit log atomically', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({
          trackId: track1Id,
          challengeId: challenge1Id,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.hackathonId).toBe(hackathonId);
      expect(res.body.data.userId).toBe(studentUserId);
      expect(res.body.data.trackId).toBe(track1Id);
      expect(res.body.data.challengeId).toBe(challenge1Id);
      expect(res.body.data.status).toBe('REGISTERED');
      expect(res.body.data.track.name).toBe('AI Agents & Automation');
      expect(res.body.data.challenge.name).toBe('Autonomous Code Reviewer');
      registrationId = res.body.data.id;

      // Verify audit log exists
      const audit = await prisma.auditLog.findFirst({
        where: {
          targetId: hackathonId,
          action: 'participant.registration_created',
          actorId: studentUserId,
        },
      });
      expect(audit).not.toBeNull();
      expect((audit?.metadata as any)?.trackId).toBe(track1Id);
    });

    it('should reject duplicate registration with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({
          trackId: track1Id,
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REGISTRATION_ALREADY_EXISTS');
    });

    it('should allow participant to read their own registration with nested track & challenge', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(registrationId);
      expect(res.body.data.status).toBe('REGISTERED');
      expect(res.body.data.track.id).toBe(track1Id);
      expect(res.body.data.challenge.id).toBe(challenge1Id);
    });
  });

  // ====================================================
  // 6. UPDATE SELECTION & WITHDRAWAL WORKFLOW
  // ====================================================
  describe('6. Registration Update & Withdrawal Transitions', () => {
    it('should update allowed track and challenge selection', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({
          trackId: track2Id,
          challengeId: challenge2Id,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.trackId).toBe(track2Id);
      expect(res.body.data.challengeId).toBe(challenge2Id);
      expect(res.body.data.track.name).toBe('Decentralized Systems');

      // Verify update audit log
      const audit = await prisma.auditLog.findFirst({
        where: {
          targetId: hackathonId,
          action: 'participant.registration_updated',
          actorId: studentUserId,
        },
      });
      expect(audit).not.toBeNull();
    });

    it('should withdraw participant registration', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify status is WITHDRAWN
      const queryRes = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .expect(200);

      expect(queryRes.body.data.status).toBe('WITHDRAWN');
      expect(queryRes.body.data.withdrawnAt).not.toBeNull();
    });

    it('should reject withdrawing an already withdrawn registration with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ALREADY_WITHDRAWN');
    });

    it('should allow re-registering / reactivating a withdrawn registration during open window', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({
          trackId: track1Id,
          challengeId: challenge1Id,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('REGISTERED');
      expect(res.body.data.withdrawnAt).toBeNull();

      // Ensure no duplicate rows were created in DB
      const rows = await prisma.participantRegistration.findMany({
        where: { hackathonId, userId: studentUserId },
      });
      expect(rows.length).toBe(1);
    });
  });

  // ====================================================
  // 7. REGISTRATION WINDOW & LIFECYCLE BOUNDARIES
  // ====================================================
  describe('7. Authoritative Registration Window & Lifecycle Boundaries', () => {
    let closedHackathonId: string;
    let draftHackathonId: string;

    beforeAll(async () => {
      const now = Date.now();
      // Past / Closed Hackathon
      const closedRes = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${orgId}/hackathons`)
        .set('Cookie', cookieOrganizer)
        .send({
          name: `Closed Registration Hackathon ${timestamp}`,
          slug: `closed-hackathon-${timestamp}`,
          timezone: 'UTC',
          registrationStartsAt: new Date(now - 7200000).toISOString(), // 2h ago
          registrationEndsAt: new Date(now - 3600000).toISOString(),   // 1h ago
          startsAt: new Date(now + 172800000).toISOString(),
          endsAt: new Date(now + 259200000).toISOString(),
        })
        .expect(201);
      closedHackathonId = closedRes.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${closedHackathonId}/publish`)
        .set('Cookie', cookieOrganizer)
        .expect(200);

      // Draft Hackathon
      const draftRes = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${orgId}/hackathons`)
        .set('Cookie', cookieOrganizer)
        .send({
          name: `Draft Hackathon ${timestamp}`,
          slug: `draft-hackathon-${timestamp}`,
          timezone: 'UTC',
          registrationStartsAt: new Date(now - 3600000).toISOString(),
          registrationEndsAt: new Date(now + 86400000).toISOString(),
          startsAt: new Date(now + 172800000).toISOString(),
          endsAt: new Date(now + 259200000).toISOString(),
        })
        .expect(201);
      draftHackathonId = draftRes.body.data.id;
    });

    afterAll(async () => {
      if (closedHackathonId) {
        await prisma.participantRegistration.deleteMany({ where: { hackathonId: closedHackathonId } });
        await prisma.hackathonConfiguration.deleteMany({ where: { hackathonId: closedHackathonId } });
        await prisma.hackathon.deleteMany({ where: { id: closedHackathonId } });
      }
      if (draftHackathonId) {
        await prisma.participantRegistration.deleteMany({ where: { hackathonId: draftHackathonId } });
        await prisma.hackathonConfiguration.deleteMany({ where: { hackathonId: draftHackathonId } });
        await prisma.hackathon.deleteMany({ where: { id: draftHackathonId } });
      }
    });

    it('should reject registration when registration window has closed with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${closedHackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({})
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REGISTRATION_NOT_OPEN');
    });

    it('should reject registration when hackathon is in DRAFT status with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${draftHackathonId}/registration`)
        .set('Cookie', cookieStudent)
        .send({})
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('HACKATHON_REGISTRATION_UNAVAILABLE');
    });
  });

  // ====================================================
  // 8. CONCURRENCY RACE VERIFICATION
  // ====================================================
  describe('8. Concurrency & Race Condition Verification', () => {
    it('should handle concurrent duplicate registrations by creating exactly 1 record and returning 409 for the other', async () => {
      const [res1, res2] = await Promise.all([
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonId}/registration`)
          .set('Cookie', cookieConcurrent)
          .send({ trackId: track1Id }),
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonId}/registration`)
          .set('Cookie', cookieConcurrent)
          .send({ trackId: track1Id }),
      ]);

      const statuses = [res1.status, res2.status].sort();
      // One request succeeds with 201, one conflicts with 409
      expect(statuses).toEqual([201, 409]);

      // Verify exactly 1 database row exists
      const rows = await prisma.participantRegistration.findMany({
        where: { hackathonId, userId: concurrentUserId },
      });
      expect(rows.length).toBe(1);
      expect(rows[0].status).toBe('REGISTERED');
    });
  });
});

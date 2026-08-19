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

describe('Team Formation & Membership Domain E2E (S2-05)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();
  let orgOwnerCookie: string;
  let captainCookie: string;
  let memberBCookie: string;
  let memberCCookie: string;
  let foreignUserCookie: string;

  let orgId: string;
  let hackathonId: string;
  let otherHackathonId: string;

  let captainUserId: string;
  let memberBUserId: string;
  let memberCUserId: string;
  let foreignUserId: string;

  beforeAll(async () => {
    const mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    const mockQueueService = {
      addJob: jest.fn().mockResolvedValue({ id: 'mocked_job_id_teams_e2e' } as any),
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

    // 1. Register Org Owner & Users
    const ownerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `orgowner_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Org Owner',
      })
      .expect(201);
    orgOwnerCookie = ownerRes.get('Set-Cookie')?.[0] || '';

    const captRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `captain_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Captain Alice',
      })
      .expect(201);
    captainCookie = captRes.get('Set-Cookie')?.[0] || '';
    captainUserId = captRes.body.data.id;

    const memBRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `member_b_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Member Bob',
      })
      .expect(201);
    memberBCookie = memBRes.get('Set-Cookie')?.[0] || '';
    memberBUserId = memBRes.body.data.id;

    const memCRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `member_c_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Member Charlie',
      })
      .expect(201);
    memberCCookie = memCRes.get('Set-Cookie')?.[0] || '';
    memberCUserId = memCRes.body.data.id;

    const foreignRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `foreign_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Foreign Dave',
      })
      .expect(201);
    foreignUserCookie = foreignRes.get('Set-Cookie')?.[0] || '';
    foreignUserId = foreignRes.body.data.id;

    // 2. Create Organization
    const orgRes = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Cookie', orgOwnerCookie)
      .send({
        name: `Team Formation Org ${timestamp}`,
        slug: `team-org-${timestamp}`,
      })
      .expect(201);
    orgId = orgRes.body.data.id;

    // 3. Create Hackathons (Open for registration with maxTeamSize = 2)
    const now = Date.now();
    const hRes = await request(app.getHttpServer())
      .post(`/api/v1/organizations/${orgId}/hackathons`)
      .set('Cookie', orgOwnerCookie)
      .send({
        name: `Team Hackathon ${timestamp}`,
        slug: `team-hack-${timestamp}`,
        timezone: 'UTC',
        registrationStartsAt: new Date(now - 3600000).toISOString(),
        registrationEndsAt: new Date(now + 86400000).toISOString(),
        startsAt: new Date(now + 172800000).toISOString(),
        endsAt: new Date(now + 259200000).toISOString(),
      })
      .expect(201);
    hackathonId = hRes.body.data.id;

    await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${hackathonId}/publish`)
      .set('Cookie', orgOwnerCookie)
      .expect(200);

    // Set maxTeamSize = 2 in configuration
    await request(app.getHttpServer())
      .put(`/api/v1/hackathons/${hackathonId}/configuration`)
      .set('Cookie', orgOwnerCookie)
      .send({
        participationMode: 'BOTH',
        maxTeamSize: 2,
        minTeamSize: 1,
        eligibilityType: 'OPEN',
      })
      .expect(200);

    // Create Second Hackathon for cross-hackathon testing
    const otherHRes = await request(app.getHttpServer())
      .post(`/api/v1/organizations/${orgId}/hackathons`)
      .set('Cookie', orgOwnerCookie)
      .send({
        name: `Other Hackathon ${timestamp}`,
        slug: `other-hack-${timestamp}`,
        timezone: 'UTC',
        registrationStartsAt: new Date(now - 3600000).toISOString(),
        registrationEndsAt: new Date(now + 86400000).toISOString(),
        startsAt: new Date(now + 172800000).toISOString(),
        endsAt: new Date(now + 259200000).toISOString(),
      })
      .expect(201);
    otherHackathonId = otherHRes.body.data.id;

    await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${otherHackathonId}/publish`)
      .set('Cookie', orgOwnerCookie)
      .expect(200);

    // Register Captain, Member B, and Member C on primary hackathon
    await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${hackathonId}/registration`)
      .set('Cookie', captainCookie)
      .send({})
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${hackathonId}/registration`)
      .set('Cookie', memberBCookie)
      .send({})
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${hackathonId}/registration`)
      .set('Cookie', memberCCookie)
      .send({})
      .expect(201);

    // Register Foreign User on other hackathon only
    await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${otherHackathonId}/registration`)
      .set('Cookie', foreignUserCookie)
      .send({})
      .expect(201);
  });

  afterAll(async () => {
    if (hackathonId || otherHackathonId) {
      await prisma.teamInvitation.deleteMany({});
      await prisma.teamMember.deleteMany({});
      await prisma.team.deleteMany({});
      await prisma.participantRegistration.deleteMany({});
      await prisma.hackathonConfiguration.deleteMany({});
      await prisma.hackathon.deleteMany({ where: { organizationId: orgId } });
      await prisma.organizationMember.deleteMany({ where: { organizationId: orgId } });
      await prisma.organization.deleteMany({ where: { id: orgId } });
      await prisma.user.deleteMany({
        where: {
          id: { in: [captainUserId, memberBUserId, memberCUserId, foreignUserId] },
        },
      });
    }
    await app.close();
  });

  // ====================================================
  // 1. AUTHENTICATION & SECURITY GATES
  // ====================================================
  describe('1. Authentication & Security Gates', () => {
    it('should reject unauthenticated team creation with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/teams`)
        .send({ name: 'Unauth Team' })
        .expect(401);
    });

    it('should reject team creation for non-registered user with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/teams`)
        .set('Cookie', foreignUserCookie) // Foreign user is only on otherHackathon
        .send({ name: 'Foreign Team' })
        .expect(403);
    });
  });

  // ====================================================
  // 2. TEAM CREATION & CAPTAIN INVARIANT
  // ====================================================
  let createdTeamId: string;

  describe('2. Team Creation & Captain Invariant', () => {
    it('should allow registered participant to create a team and become Captain atomically', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/teams`)
        .set('Cookie', captainCookie)
        .send({
          name: 'Quantum Pioneers',
          slug: 'quantum-pioneers',
          description: 'Building quantum compilers.',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Quantum Pioneers');
      expect(res.body.data.slug).toBe('quantum-pioneers');
      expect(res.body.data.memberCount).toBe(1);
      expect(res.body.data.members[0].userId).toBe(captainUserId);
      expect(res.body.data.members[0].role).toBe('CAPTAIN');
      expect(res.body.data.members[0].status).toBe('ACTIVE');

      createdTeamId = res.body.data.id;
    });

    it('should reject second team creation by the same user with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/teams`)
        .set('Cookie', captainCookie)
        .send({ name: 'Second Team' })
        .expect(409);
    });

    it('should reject team creation with duplicate slug in same hackathon with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/teams`)
        .set('Cookie', memberBCookie)
        .send({
          name: 'Another Team',
          slug: 'quantum-pioneers', // Duplicate slug
        })
        .expect(409);
    });

    it('should allow querying current user team via /teams/me', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonId}/teams/me`)
        .set('Cookie', captainCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdTeamId);
      expect(res.body.data.name).toBe('Quantum Pioneers');
    });
  });

  // ====================================================
  // 3. TEAM INVITATIONS & STATE MACHINE
  // ====================================================
  let invitationId: string;

  describe('3. Team Invitations & State Machine', () => {
    it('should reject non-captain attempting to invite members with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/invitations`)
        .set('Cookie', memberBCookie) // Not captain
        .send({ inviteeUserId: memberCUserId })
        .expect(403);
    });

    it('should reject invitation to self with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/invitations`)
        .set('Cookie', captainCookie)
        .send({ inviteeUserId: captainUserId })
        .expect(400);
    });

    it('should reject invitation to unregistered participant with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/invitations`)
        .set('Cookie', captainCookie)
        .send({ inviteeUserId: foreignUserId }) // Registered for other hackathon
        .expect(400);
    });

    it('should allow Captain to invite an eligible registered participant', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/invitations`)
        .set('Cookie', captainCookie)
        .send({ inviteeUserId: memberBUserId })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.teamId).toBe(createdTeamId);
      expect(res.body.data.inviteeUserId).toBe(memberBUserId);
      expect(res.body.data.status).toBe('PENDING');

      invitationId = res.body.data.id;
    });

    it('should reject duplicate pending invitation with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/invitations`)
        .set('Cookie', captainCookie)
        .send({ inviteeUserId: memberBUserId })
        .expect(409);
    });

    it('should allow invitee to see their pending invitations', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonId}/teams/my-invitations`)
        .set('Cookie', memberBCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(invitationId);
      expect(res.body.data[0].team.name).toBe('Quantum Pioneers');
    });

    it('should reject another user attempting to accept invitation with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${invitationId}/accept`)
        .set('Cookie', memberCCookie) // Wrong recipient
        .expect(403);
    });

    it('should allow invitee to accept invitation and join team', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/invitations/${invitationId}/accept`)
        .set('Cookie', memberBCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.teamId || res.body.data?.teamId).toBe(createdTeamId);

      // Verify team now has 2 members
      const teamRes = await request(app.getHttpServer())
        .get(`/api/v1/teams/${createdTeamId}`)
        .set('Cookie', captainCookie)
        .expect(200);

      expect(teamRes.body.data.memberCount).toBe(2);
      const members = teamRes.body.data.members;
      expect(members.some((m: any) => m.userId === memberBUserId && m.role === 'MEMBER' && m.status === 'ACTIVE')).toBe(true);
    });
  });

  // ====================================================
  // 4. MAX TEAM SIZE ENFORCEMENT
  // ====================================================
  describe('4. Max Team Size Enforcement', () => {
    it('should reject inviting additional members when maxTeamSize (2) is reached with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/invitations`)
        .set('Cookie', captainCookie)
        .send({ inviteeUserId: memberCUserId })
        .expect(409);
    });
  });

  // ====================================================
  // 5. MEMBERSHIP LIFECYCLE & ROLE TRANSITIONS
  // ====================================================
  describe('5. Membership Lifecycle & Role Transitions', () => {
    it('should reject Captain attempting to leave team directly with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/leave`)
        .set('Cookie', captainCookie)
        .expect(409);
    });

    it('should transfer captaincy from Alice to Bob', async () => {
      const teamBefore = await request(app.getHttpServer())
        .get(`/api/v1/teams/${createdTeamId}`)
        .set('Cookie', captainCookie);

      const bobMemberId = teamBefore.body.data.members.find((m: any) => m.userId === memberBUserId).id;

      await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/captain/transfer`)
        .set('Cookie', captainCookie)
        .send({ targetMemberId: bobMemberId })
        .expect(200);

      // Verify Bob is now Captain and Alice is Member
      const teamAfter = await request(app.getHttpServer())
        .get(`/api/v1/teams/${createdTeamId}`)
        .set('Cookie', memberBCookie);

      const aliceMember = teamAfter.body.data.members.find((m: any) => m.userId === captainUserId);
      const bobMember = teamAfter.body.data.members.find((m: any) => m.userId === memberBUserId);

      expect(aliceMember.role).toBe('MEMBER');
      expect(bobMember.role).toBe('CAPTAIN');
    });

    it('should allow Alice (now Member) to leave team', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/leave`)
        .set('Cookie', captainCookie)
        .expect(200);

      const teamRes = await request(app.getHttpServer())
        .get(`/api/v1/teams/${createdTeamId}`)
        .set('Cookie', memberBCookie);

      expect(teamRes.body.data.memberCount).toBe(1);
    });

    it('should allow Bob (now Captain) to invite Charlie and then remove Charlie', async () => {
      // Invite Charlie
      const invRes = await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/invitations`)
        .set('Cookie', memberBCookie)
        .send({ inviteeUserId: memberCUserId })
        .expect(201);

      // Charlie accepts
      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${invRes.body.data.id}/accept`)
        .set('Cookie', memberCCookie)
        .expect(200);

      // Bob removes Charlie
      const teamWithCharlie = await request(app.getHttpServer())
        .get(`/api/v1/teams/${createdTeamId}`)
        .set('Cookie', memberBCookie);

      const charlieMemberId = teamWithCharlie.body.data.members.find((m: any) => m.userId === memberCUserId).id;

      await request(app.getHttpServer())
        .post(`/api/v1/teams/${createdTeamId}/members/${charlieMemberId}/remove`)
        .set('Cookie', memberBCookie)
        .expect(200);

      const teamAfterRemoval = await request(app.getHttpServer())
        .get(`/api/v1/teams/${createdTeamId}`)
        .set('Cookie', memberBCookie);

      expect(teamAfterRemoval.body.data.memberCount).toBe(1);
    });

    it('should allow Captain to dissolve team', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/teams/${createdTeamId}`)
        .set('Cookie', memberBCookie)
        .expect(200);

      // Querying dissolved team returns 404
      await request(app.getHttpServer())
        .get(`/api/v1/teams/${createdTeamId}`)
        .set('Cookie', memberBCookie)
        .expect(404);
    });
  });

  // ====================================================
  // 6. CONCURRENCY & RACE CONDITIONS
  // ====================================================
  describe('6. Concurrency & Race Conditions', () => {
    it('should handle concurrent duplicate team creation from same user safely', async () => {
      // Alice tries to create two teams in parallel
      const results = await Promise.all([
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonId}/teams`)
          .set('Cookie', captainCookie)
          .send({ name: 'Race Team One', slug: 'race-team-1' }),
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonId}/teams`)
          .set('Cookie', captainCookie)
          .send({ name: 'Race Team Two', slug: 'race-team-2' }),
      ]);

      const statuses = results.map((r) => r.status);
      expect(statuses).toContain(201);
      expect(statuses).toContain(409);
    });

    it('should handle concurrent final-slot acceptance safely without team size overflow', async () => {
      // Clean up previous active teams to free Alice
      await prisma.team.deleteMany({ where: { hackathonId } });
      await prisma.teamMember.deleteMany({ where: { team: { hackathonId } } });

      // Setup: Create a new team with Captain Alice (maxTeamSize = 2, so 1 open slot)
      const teamRes = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/teams`)
        .set('Cookie', captainCookie)
        .send({ name: 'Concurrency Slot Team', slug: 'concurrency-slot-team' })
        .expect(201);

      const raceTeamId = teamRes.body.data.id;

      // Captain Alice invites both Bob and Charlie
      const invB = await request(app.getHttpServer())
        .post(`/api/v1/teams/${raceTeamId}/invitations`)
        .set('Cookie', captainCookie)
        .send({ inviteeUserId: memberBUserId })
        .expect(201);

      const invC = await request(app.getHttpServer())
        .post(`/api/v1/teams/${raceTeamId}/invitations`)
        .set('Cookie', captainCookie)
        .send({ inviteeUserId: memberCUserId })
        .expect(201);

      // Bob and Charlie accept simultaneously
      const results = await Promise.all([
        request(app.getHttpServer())
          .post(`/api/v1/invitations/${invB.body.data.id}/accept`)
          .set('Cookie', memberBCookie),
        request(app.getHttpServer())
          .post(`/api/v1/invitations/${invC.body.data.id}/accept`)
          .set('Cookie', memberCCookie),
      ]);

      const statuses = results.map((r) => r.status);
      expect(statuses).toContain(200);
      expect(statuses).toContain(409);

      // Verify team size strictly <= 2 in DB
      const finalTeam = await prisma.team.findUnique({
        where: { id: raceTeamId },
        include: { members: { where: { status: 'ACTIVE' } } },
      });
      expect(finalTeam?.members.length).toBeLessThanOrEqual(2);
    });

    it('should handle concurrent cross-team acceptance for same user safely', async () => {
      // Clean up previous team to free Bob
      await prisma.team.deleteMany({ where: { hackathonId } });
      await prisma.teamMember.deleteMany({ where: { team: { hackathonId } } });

      // Alice creates Team Alpha
      const teamA = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/teams`)
        .set('Cookie', captainCookie)
        .send({ name: 'Alpha Team', slug: 'alpha-team' })
        .expect(201);

      // Charlie creates Team Beta
      const teamB = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonId}/teams`)
        .set('Cookie', memberCCookie)
        .send({ name: 'Beta Team', slug: 'beta-team' })
        .expect(201);

      // Both invite Bob
      const invAlpha = await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamA.body.data.id}/invitations`)
        .set('Cookie', captainCookie)
        .send({ inviteeUserId: memberBUserId })
        .expect(201);

      const invBeta = await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamB.body.data.id}/invitations`)
        .set('Cookie', memberCCookie)
        .send({ inviteeUserId: memberBUserId })
        .expect(201);

      // Bob accepts both invitations simultaneously
      const results = await Promise.all([
        request(app.getHttpServer())
          .post(`/api/v1/invitations/${invAlpha.body.data.id}/accept`)
          .set('Cookie', memberBCookie),
        request(app.getHttpServer())
          .post(`/api/v1/invitations/${invBeta.body.data.id}/accept`)
          .set('Cookie', memberBCookie),
      ]);

      const statuses = results.map((r) => r.status);
      expect(statuses).toContain(200);
      expect(statuses).toContain(409);

      // Verify Bob has at most 1 active team membership
      const activeMemberships = await prisma.teamMember.count({
        where: {
          userId: memberBUserId,
          status: 'ACTIVE',
          team: { hackathonId, status: 'ACTIVE' },
        },
      });
      expect(activeMemberships).toBe(1);
    });
  });

  // ====================================================
  // 7. MASS ASSIGNMENT, IDOR & AUDIT LOGGING
  // ====================================================
  describe('7. Mass Assignment, IDOR & Audit Logging', () => {
    it('should reject non-whitelisted protected fields in team update payload with 400 Bad Request', async () => {
      const myTeam = await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackathonId}/teams/me`)
        .set('Cookie', captainCookie)
        .expect(200);

      const teamId = myTeam.body.data.id;

      // Attempt mass assignment injection with non-whitelisted fields
      await request(app.getHttpServer())
        .patch(`/api/v1/teams/${teamId}`)
        .set('Cookie', captainCookie)
        .send({
          name: 'Renamed Alpha Team',
          status: 'DISSOLVED',
          createdByUserId: memberBUserId,
          hackathonId: otherHackathonId,
        })
        .expect(400);

      // Verify protected fields were NOT modified
      const updatedTeam = await prisma.team.findUnique({ where: { id: teamId } });
      expect(updatedTeam?.name).not.toBe('Renamed Alpha Team');
      expect(updatedTeam?.status).toBe('ACTIVE');
      expect(updatedTeam?.createdByUserId).toBe(captainUserId);
      expect(updatedTeam?.hackathonId).toBe(hackathonId);
    });

    it('should verify audit log entries were persisted for critical actions', async () => {
      const logs = await prisma.auditLog.findMany({
        where: {
          action: {
            in: [
              'team.created',
              'team.updated',
              'team.member_joined',
              'team.invitation_created',
            ],
          },
        },
      });

      expect(logs.length).toBeGreaterThan(0);
      for (const log of logs) {
        expect(log.actorId).toBeDefined();
        expect(log.actorEmail).toBeDefined();
        expect(log.targetEntity).toBe('Team');
      }
    });
  });
});


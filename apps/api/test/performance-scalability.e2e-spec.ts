import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { RoleName } from '@almosthack/types';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('S11 Performance & Scalability Certification (E2E)', () => {
  jest.setTimeout(60000);

  let app: INestApplication;
  let prisma: PrismaService;

  // Test entities
  let adminUser: { id: string; cookie: string; email: string };
  let orgOwner: { id: string; cookie: string; email: string };
  let testOrg: { id: string; slug: string };
  let testHackathon: { id: string; slug: string };
  let testTeam: { id: string };
  let testSub: { id: string };

  const calculatePercentiles = (durations: number[]) => {
    const sorted = [...durations].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    const avg = sorted.reduce((sum, d) => sum + d, 0) / (sorted.length || 1);
    return { p50, p95, p99, avg, min: sorted[0] || 0, max: sorted[sorted.length - 1] || 0 };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    prisma = app.get(PrismaService);

    // 1. Seed Admin User
    const adminEmail = `admin_perf_${Date.now()}@almosthack.com`;
    const adminRegRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: adminEmail,
        password: 'Password123!',
        name: 'Perf Admin',
      });
    const adminCookie = adminRegRes.get('Set-Cookie')?.[0] || '';
    adminUser = {
      id: adminRegRes.body?.id || adminRegRes.body?.data?.user?.id || adminRegRes.body?.data?.id,
      cookie: adminCookie,
      email: adminEmail,
    };

    const adminRole = await prisma.role.upsert({
      where: { name: RoleName.ADMIN },
      update: {},
      create: { name: RoleName.ADMIN },
    });
    await prisma.userRole.create({
      data: { userId: adminUser.id, roleId: adminRole.id },
    });

    // 2. Seed Org Owner & Organization
    const ownerEmail = `org_owner_perf_${Date.now()}@almosthack.com`;
    const ownerRegRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: ownerEmail,
        password: 'Password123!',
        name: 'Perf Org Owner',
      });
    const ownerCookie = ownerRegRes.get('Set-Cookie')?.[0] || '';
    orgOwner = {
      id: ownerRegRes.body?.data?.user?.id || ownerRegRes.body?.data?.id || ownerRegRes.body?.id,
      cookie: ownerCookie,
      email: ownerEmail,
    };

    const orgRes = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Cookie', orgOwner.cookie)
      .send({
        name: 'Performance Test Organization',
        slug: `perf-org-${Date.now()}`,
      });
    const orgPayload = orgRes.body?.data || orgRes.body;
    testOrg = { id: orgPayload.id, slug: orgPayload.slug };

    // 3. Seed Hackathon
    const hackRes = await request(app.getHttpServer())
      .post(`/api/v1/organizations/${testOrg.id}/hackathons`)
      .set('Cookie', orgOwner.cookie)
      .send({
        name: 'Performance Benchmarking Hackathon',
        slug: `perf-hackathon-${Date.now()}`,
        description: 'Comprehensive performance certification test dataset',
        registrationStartsAt: new Date(Date.now() - 3600000).toISOString(),
        registrationEndsAt: new Date(Date.now() + 86400000).toISOString(),
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        endsAt: new Date(Date.now() + 172800000).toISOString(),
      });
    const hackPayload = hackRes.body?.data || hackRes.body;
    testHackathon = { id: hackPayload.id, slug: hackPayload.slug };

    // 4. Create Judging Criteria for test hackathon
    const criterion = await prisma.judgingCriterion.create({
      data: {
        hackathonId: testHackathon.id,
        name: 'Technical Excellence',
        description: 'Code quality and architecture',
        maxScore: 100,
        weight: 1.0,
        displayOrder: 1,
      },
    });

    // 5. Seed Team & Submission for Result Calculation Benchmark
    testTeam = await prisma.team.create({
      data: {
        name: 'Perf Benchmarking Team',
        slug: `perf-team-${Date.now()}`,
        hackathon: { connect: { id: testHackathon.id } },
        createdByUser: { connect: { id: orgOwner.id } },
      },
    });

    await prisma.teamMember.create({
      data: {
        team: { connect: { id: testTeam.id } },
        user: { connect: { id: orgOwner.id } },
        role: 'CAPTAIN',
        status: 'ACTIVE',
      },
    });

    testSub = await prisma.submission.create({
      data: {
        title: 'Performance Benchmark Project',
        description: 'Benchmark submission description',
        status: 'SUBMITTED',
        submittedAt: new Date(),
        hackathon: { connect: { id: testHackathon.id } },
        team: { connect: { id: testTeam.id } },
      },
    });

    // 6. Seed Completed Evaluation
    const assignment = await prisma.judgeAssignment.create({
      data: {
        hackathon: { connect: { id: testHackathon.id } },
        submission: { connect: { id: testSub.id } },
        judgeUser: { connect: { id: adminUser.id } },
        assignedBy: { connect: { id: orgOwner.id } },
        status: 'COMPLETED',
      },
    });

    await prisma.judgeEvaluation.create({
      data: {
        assignment: { connect: { id: assignment.id } },
        submission: { connect: { id: testSub.id } },
        judgeUser: { connect: { id: adminUser.id } },
        status: 'SUBMITTED',
        totalScore: 90,
        submittedAt: new Date(),
        scores: {
          create: [{ criterionId: criterion.id, score: 90, comment: 'Benchmark Excellent' }],
        },
      },
    });

    // Publish Hackathon so registrations and submissions are active
    await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${testHackathon.id}/publish`)
      .set('Cookie', orgOwner.cookie);
  }, 45000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // ==========================================================================
  // 1. AUTHENTICATION & SESSION RESOLUTION THROUGHPUT
  // ==========================================================================
  describe('1. Authentication & Session Resolution Throughput', () => {
    it('MEASURE: Concurrent session validation throughput (50 concurrent requests)', async () => {
      const concurrency = 50;
      const start = Date.now();
      const durations: number[] = [];

      const requests = Array.from({ length: concurrency }).map(async () => {
        const reqStart = Date.now();
        const res = await request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .set('Cookie', adminUser.cookie);
        durations.push(Date.now() - reqStart);
        expect(res.status).toBe(200);
        const payload = res.body?.data?.user || res.body?.data || res.body;
        expect(payload).toHaveProperty('email', adminUser.email);
      });

      await Promise.all(requests);
      const totalDuration = Date.now() - start;
      const metrics = calculatePercentiles(durations);

      expect(metrics.p95).toBeLessThan(1000); // p95 sub-second under load
      expect(totalDuration).toBeLessThan(5000);
    });
  });

  // ==========================================================================
  // 2. REGISTRATION STORM CONCURRENCY & CONTENTION
  // ==========================================================================
  describe('2. Registration Storm Concurrency & Atomicity', () => {
    it('MEASURE: Registration storm with 20 distinct users registering simultaneously', async () => {
      const userCount = 20;
      const users: { cookie: string; email: string }[] = [];

      // Create users with distinct simulated IPs
      for (let i = 0; i < userCount; i++) {
        const email = `storm_user_${i}_${Date.now()}@almosthack.com`;
        const res = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .set('X-Forwarded-For', `10.0.1.${i + 1}`)
          .send({
            email,
            password: 'Password123!',
            name: `Storm User ${i}`,
          });
        users.push({
          cookie: res.get('Set-Cookie')?.[0] || '',
          email,
        });
      }

      // Fire parallel registrations for all users concurrently
      const regStart = Date.now();
      const durations: number[] = [];

      const regPromises = users.map(async (u) => {
        const reqStart = Date.now();
        const res = await request(app.getHttpServer())
          .post(`/api/v1/hackathons/${testHackathon.id}/registration`)
          .set('Cookie', u.cookie)
          .send({});
        durations.push(Date.now() - reqStart);
        expect([200, 201]).toContain(res.status);
      });

      await Promise.all(regPromises);
      const totalRegTime = Date.now() - regStart;
      const metrics = calculatePercentiles(durations);

      // Verify all 20 registrations exist in DB with zero data loss or contention failure
      const count = await prisma.participantRegistration.count({
        where: { hackathonId: testHackathon.id },
      });
      expect(count).toBeGreaterThanOrEqual(userCount);
      expect(metrics.p95).toBeLessThan(2000);
      expect(totalRegTime).toBeLessThan(10000);
    });
  });

  // ==========================================================================
  // 3. AUDIT LOG HIGH-CARDINALITY QUERYING & PAGINATION
  // ==========================================================================
  describe('3. Audit Log Querying & Index Efficiency', () => {
    beforeAll(async () => {
      // Seed 50 audit logs to test indexing & pagination efficiency
      const logs = Array.from({ length: 50 }).map((_, i) => ({
        action: i % 2 === 0 ? 'USER_LOGIN' : 'HACKATHON_UPDATED',
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        targetEntity: 'HACKATHON',
        targetId: testHackathon.id,
        metadata: { index: i, benchmark: true },
      }));

      await prisma.auditLog.createMany({ data: logs });
    });

    it('MEASURE: Filtered audit log query latency across pages and action filters', async () => {
      const start = Date.now();

      const res = await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Cookie', adminUser.cookie)
        .query({
          action: 'USER_LOGIN',
          limit: 20,
          page: 1,
        })
        .expect(200);

      const duration = Date.now() - start;
      const payload = res.body?.data || res.body;

      expect(payload.items).toBeDefined();
      expect(payload.pagination.total).toBeGreaterThanOrEqual(25);
      expect(duration).toBeLessThan(500); // Sub-500ms indexed query
    });
  });

  // ==========================================
  // 4. RESULTS & LEADERBOARD CALCULATION SCALABILITY
  // ==========================================
  describe('4. Results Calculation & Leaderboard Scalability', () => {
    it('MEASURE: Result calculation execution duration & history retrieval', async () => {
      const calcStart = Date.now();

      const calcRes = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${testHackathon.id}/results/calculate`)
        .set('Cookie', orgOwner.cookie)
        .send({
          forceRecalculate: true,
        });

      const calcDuration = Date.now() - calcStart;
      expect([200, 201]).toContain(calcRes.status);
      expect(calcDuration).toBeLessThan(2000); // Sub-2s calculation

      // Fetch result history
      const histStart = Date.now();
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${testHackathon.id}/results/history`)
        .set('Cookie', orgOwner.cookie)
        .expect(200);

      const histDuration = Date.now() - histStart;
      expect(histDuration).toBeLessThan(500);
    });

    it('MEASURE: Published leaderboard query latency and score aggregation', async () => {
      // Approve and publish results
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${testHackathon.id}/results/approve`)
        .set('Cookie', orgOwner.cookie)
        .send({ notes: 'Approved for benchmarking leaderboard' });

      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${testHackathon.id}/results/publish`)
        .set('Cookie', orgOwner.cookie)
        .send({ notifyParticipants: false });

      // Measure 20 concurrent leaderboard reads
      const start = Date.now();
      const durations: number[] = [];

      const readPromises = Array.from({ length: 20 }).map(async () => {
        const reqStart = Date.now();
        const res = await request(app.getHttpServer())
          .get(`/api/v1/hackathons/${testHackathon.id}/leaderboard`)
          .set('Cookie', adminUser.cookie);
        durations.push(Date.now() - reqStart);
        expect(res.status).toBe(200);
      });

      await Promise.all(readPromises);
      const totalTime = Date.now() - start;
      const metrics = calculatePercentiles(durations);

      expect(metrics.p95).toBeLessThan(500);
      expect(totalTime).toBeLessThan(3000);
    });
  });

  // ==========================================
  // 5. CONCURRENT SUBMISSION UPDATES THROUGHPUT
  // ==========================================
  describe('5. Concurrent Submission Updates Throughput', () => {
    it('MEASURE: 20 concurrent submission draft updates on active team', async () => {
      // Ensure submission window is open for draft submissions
      await prisma.hackathon.update({
        where: { id: testHackathon.id },
        data: { startsAt: new Date(Date.now() - 3600000) },
      });

      const draftTeam = await prisma.team.create({
        data: {
          name: 'Draft Perf Team',
          slug: `draft-perf-team-${Date.now()}`,
          hackathon: { connect: { id: testHackathon.id } },
          createdByUser: { connect: { id: orgOwner.id } },
        },
      });

      await prisma.teamMember.create({
        data: {
          team: { connect: { id: draftTeam.id } },
          user: { connect: { id: orgOwner.id } },
          role: 'CAPTAIN',
          status: 'ACTIVE',
        },
      });

      const start = Date.now();
      const durations: number[] = [];

      const updatePromises = Array.from({ length: 20 }).map(async (_, idx) => {
        const reqStart = Date.now();
        const res = await request(app.getHttpServer())
          .post(`/api/v1/teams/${draftTeam.id}/submissions`)
          .set('Cookie', orgOwner.cookie)
          .send({
            title: `Updated Title Benchmark ${idx}`,
            description: `Updated description with benchmark cycle ${idx}`,
          });
        durations.push(Date.now() - reqStart);
        expect([200, 201]).toContain(res.status);
      });

      await Promise.all(updatePromises);
      const totalDuration = Date.now() - start;
      const metrics = calculatePercentiles(durations);

      expect(metrics.p95).toBeLessThan(1000);
      expect(totalDuration).toBeLessThan(5000);
    });
  });

  // ==========================================
  // 6. MEMORY STABILITY & CYCLE SOAK TEST
  // ==========================================
  describe('6. Memory Stability & Leak Detection', () => {
    it('MEASURE: Memory stability over 50 consecutive request cycles', async () => {
      const initialMem = process.memoryUsage().heapUsed;

      for (let i = 0; i < 50; i++) {
        const res = await request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .set('Cookie', adminUser.cookie);
        expect(res.status).toBe(200);
      }

      if (global.gc) {
        global.gc();
      }

      const finalMem = process.memoryUsage().heapUsed;
      const memDeltaMB = (finalMem - initialMem) / (1024 * 1024);

      // Memory growth across 50 requests should not exceed 50MB
      expect(memDeltaMB).toBeLessThan(50);
    });
  });
});

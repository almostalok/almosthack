import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { RoleName } from '@almosthack/types';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('S10 Adversarial Security & Penetration Suite (E2E)', () => {
  jest.setTimeout(30000);

  let app: INestApplication;
  let prisma: PrismaService;

  // Test identities
  let userA: { id: string; cookie: string; email: string; rawToken: string };
  let userB: { id: string; cookie: string; email: string; rawToken: string };
  let adminUser: { id: string; cookie: string; email: string };

  let orgA: { id: string; slug: string };
  let orgB: { id: string; slug: string };
  let hackathonA: { id: string; slug: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
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

    // 1. Setup User A (Standard Participant)
    const emailA = `sec_user_a_${Date.now()}@almosthack.com`;
    const resA = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: emailA,
        password: 'Password123!',
        name: 'Attacker A',
      });
    const cookieA = resA.get('Set-Cookie')?.[0] || '';
    const rawTokenA = cookieA.split(';')[0].replace('almosthack_session=', '');
    userA = {
      id: resA.body?.id || resA.body?.data?.user?.id || resA.body?.data?.id,
      cookie: cookieA,
      email: emailA,
      rawToken: rawTokenA,
    };

    // 2. Setup User B (Victim / Alternate Participant)
    const emailB = `sec_user_b_${Date.now()}@almosthack.com`;
    const resB = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: emailB,
        password: 'Password123!',
        name: 'Victim B',
      });
    const cookieB = resB.get('Set-Cookie')?.[0] || '';
    const rawTokenB = cookieB.split(';')[0].replace('almosthack_session=', '');
    userB = {
      id: resB.body?.id || resB.body?.data?.user?.id || resB.body?.data?.id,
      cookie: cookieB,
      email: emailB,
      rawToken: rawTokenB,
    };

    // 3. Setup Admin User
    const emailAdmin = `sec_admin_${Date.now()}@almosthack.com`;
    const resAdmin = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: emailAdmin,
        password: 'Password123!',
        name: 'Sec Admin',
      });
    const cookieAdmin = resAdmin.get('Set-Cookie')?.[0] || '';
    const adminId = resAdmin.body?.id || resAdmin.body?.data?.user?.id || resAdmin.body?.data?.id;

    const adminRole = await prisma.role.upsert({
      where: { name: RoleName.ADMIN },
      update: {},
      create: { name: RoleName.ADMIN, description: 'System Administrator' },
    });
    await prisma.userRole.create({
      data: { userId: adminId, roleId: adminRole.id },
    });

    adminUser = { id: adminId, cookie: cookieAdmin, email: emailAdmin };

    // 4. Create Organization A owned by User A
    const orgARes = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Cookie', userA.cookie)
      .send({
        name: 'Attacker Org A',
        slug: `attacker-org-${Date.now()}`,
        description: 'Org A for security tests',
      });
    const orgAPayload = orgARes.body?.data || orgARes.body;
    orgA = { id: orgAPayload.id, slug: orgAPayload.slug };

    // 5. Create Organization B owned by User B
    const orgBRes = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Cookie', userB.cookie)
      .send({
        name: 'Victim Org B',
        slug: `victim-org-${Date.now()}`,
        description: 'Org B for isolation tests',
      });
    const orgBPayload = orgBRes.body?.data || orgBRes.body;
    orgB = { id: orgBPayload.id, slug: orgBPayload.slug };

    // 6. Create Hackathon A under Organization A
    const hackARes = await request(app.getHttpServer())
      .post(`/api/v1/organizations/${orgA.id}/hackathons`)
      .set('Cookie', userA.cookie)
      .send({
        name: 'Security Hackathon A',
        slug: `sec-hack-${Date.now()}`,
        description: 'Testing security boundaries',
        registrationStartsAt: new Date(Date.now() - 86400000).toISOString(),
        registrationEndsAt: new Date(Date.now() + 86400000).toISOString(),
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        endsAt: new Date(Date.now() + 172800000).toISOString(),
      });
    const hackAPayload = hackARes.body?.data || hackARes.body;
    hackathonA = { id: hackAPayload.id, slug: hackAPayload.slug };
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // ==========================================================================
  // 1. AUTHENTICATION & TOKEN ATTACKS
  // ==========================================================================
  describe('1. Authentication & Token Attacks', () => {
    it('ATTACK: Access protected endpoint without credentials -> Expected 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('ATTACK: Access with forged/malformed session cookie -> Expected 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', 'almosthack_session=forged_token_000000000000000000000000')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('ATTACK: Access with expired session -> Expected 401 Unauthorized', async () => {
      // Manually expire a session in DB
      const expiredSession = await prisma.session.create({
        data: {
          userId: userB.id,
          tokenHash: 'sha256_fake_expired_session_hash',
          expiresAt: new Date(Date.now() - 100000), // in the past
        },
      });

      // Attempt verification
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer fake_expired_raw_token')
        .expect(401);

      expect(res.body.success).toBe(false);

      // Cleanup
      await prisma.session.delete({ where: { id: expiredSession.id } });
    });

    it('ATTACK: Reusing session token after logout -> Expected 401 Unauthorized', async () => {
      // 1. Register temporary user
      const tempEmail = `logout_test_${Date.now()}@almosthack.com`;
      const regRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: tempEmail,
          password: 'Password123!',
          name: 'Logout Tester',
        });
      const tempCookie = regRes.get('Set-Cookie')?.[0] || '';

      // 2. Verify active session works
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', tempCookie)
        .expect(200);

      // 3. Logout
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', tempCookie)
        .expect(200);

      // 4. Attempt to reuse logged-out session
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', tempCookie)
        .expect(401);
    });
  });

  // ==========================================================================
  // 2. PRIVILEGE ESCALATION & RBAC BYPASS
  // ==========================================================================
  describe('2. Privilege Escalation & RBAC Bypass', () => {
    it('ATTACK: Standard Participant attempts to access Admin Audit Ledger -> Expected 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Cookie', userA.cookie)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('ATTACK: Standard Participant attempts to inject role payload in registration -> Role forced to PARTICIPANT', async () => {
      const maliciousEmail = `priv_esc_${Date.now()}@almosthack.com`;
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: maliciousEmail,
          password: 'Password123!',
          name: 'Privilege Escalator',
          roles: ['ADMIN'], // Malicious field
        });

      // With forbidNonWhitelisted: true, extra fields yield 400 Bad Request
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('ATTACK: Standard Participant attempts to update profile with forbidden fields -> Expected 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', userA.cookie)
        .send({
          isVerified: true, // Forbidden field
          passwordHash: 'hacked_hash', // Forbidden field
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 3. IDOR & CROSS-TENANT ISOLATION
  // ==========================================================================
  describe('3. IDOR & Cross-Tenant Isolation', () => {
    it('ATTACK: User A attempts to update Org B (owned by User B) -> Expected 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/organizations/${orgB.id}`)
        .set('Cookie', userA.cookie)
        .send({
          name: 'Hacked Org B by Attacker A',
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('ATTACK: User A attempts to create Hackathon under Org B -> Expected 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${orgB.id}/hackathons`)
        .set('Cookie', userA.cookie)
        .send({
          name: 'Unauthorized Hackathon',
          slug: `unauth-hack-${Date.now()}`,
          description: 'Attacker hackathon',
          registrationStartsAt: new Date().toISOString(),
          registrationEndsAt: new Date(Date.now() + 86400000).toISOString(),
          startsAt: new Date(Date.now() + 86400000).toISOString(),
          endsAt: new Date(Date.now() + 172800000).toISOString(),
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('ATTACK: User A attempts to delete Org B -> Expected 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/organizations/${orgB.id}`)
        .set('Cookie', userA.cookie)
        .send({
          confirmSlug: orgB.slug,
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('ATTACK: User A attempts to read private draft hackathons of Org B -> Expected 403/404 Forbidden', async () => {
      // 1. Create private hackathon under Org B
      const hackBRes = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${orgB.id}/hackathons`)
        .set('Cookie', userB.cookie)
        .send({
          name: 'Private Hackathon Org B',
          slug: `priv-hack-b-${Date.now()}`,
          description: 'Secret Hackathon',
          registrationStartsAt: new Date().toISOString(),
          registrationEndsAt: new Date(Date.now() + 86400000).toISOString(),
          startsAt: new Date(Date.now() + 86400000).toISOString(),
          endsAt: new Date(Date.now() + 172800000).toISOString(),
        });
      const hackBPayload = hackBRes.body?.data || hackBRes.body;

      // 2. User A attempts to read private draft hackathon B
      await request(app.getHttpServer())
        .get(`/api/v1/hackathons/${hackBPayload.id}`)
        .set('Cookie', userA.cookie)
        .expect(403);
    });
  });

  // ==========================================================================
  // 4. MASS ASSIGNMENT & PROTOTYPE POLLUTION
  // ==========================================================================
  describe('4. Mass Assignment & Prototype Pollution Attacks', () => {
    it('ATTACK: Inject __proto__ and constructor in JSON body -> Expected 400 or sanitized', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Cookie', userA.cookie)
        .send({
          __proto__: { isAdmin: true },
          bio: 'Safe bio updated',
        });

      // Must either reject with 400 (forbidNonWhitelisted) or sanitize
      if (res.status === 200) {
        expect(({} as any).isAdmin).toBeUndefined();
      } else {
        expect(res.status).toBe(400);
      }
    });

    it('ATTACK: Inject winner status or calculated score in submission DTO -> Expected 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/teams/some-team-id/submissions')
        .set('Cookie', userA.cookie)
        .send({
          title: 'Hacked Submission',
          isWinner: true, // Injected field
          rank: 1, // Injected field
          score: 100.0, // Injected field
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 5. STATE MACHINE & ILLEGAL TRANSITIONS
  // ==========================================================================
  describe('5. State Machine & Lifecycle Attacks', () => {
    it('ATTACK: Illegal State Transition: Archive a DRAFT hackathon directly -> Expected 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonA.id}/archive`)
        .set('Cookie', userA.cookie)
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    it('ATTACK: Publish an already published/completed hackathon twice -> Expected 409 Conflict', async () => {
      // 1. Publish Hackathon A
      await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonA.id}/publish`)
        .set('Cookie', userA.cookie)
        .expect(200);

      // 2. Attempt to publish again
      const dupRes = await request(app.getHttpServer())
        .post(`/api/v1/hackathons/${hackathonA.id}/publish`)
        .set('Cookie', userA.cookie)
        .expect(409);

      expect(dupRes.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 6. CONCURRENCY & RACE CONDITIONS
  // ==========================================================================
  describe('6. Concurrency & Race Condition Attacks', () => {
    it('ATTACK: Parallel duplicate registrations for same hackathon -> Exactly 1 succeeds, 1 conflict', async () => {
      const regUserEmail = `race_user_${Date.now()}@almosthack.com`;
      const regUserRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: regUserEmail,
          password: 'Password123!',
          name: 'Race Registrant',
        });
      const regCookie = regUserRes.get('Set-Cookie')?.[0] || '';

      // Fire 2 concurrent registrations simultaneously
      const [req1, req2] = await Promise.allSettled([
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonA.id}/registration`)
          .set('Cookie', regCookie)
          .send({}),
        request(app.getHttpServer())
          .post(`/api/v1/hackathons/${hackathonA.id}/registration`)
          .set('Cookie', regCookie)
          .send({}),
      ]);

      const results = [
        req1.status === 'fulfilled' ? req1.value.status : null,
        req2.status === 'fulfilled' ? req2.value.status : null,
      ];

      // Exactly one 201 Created and one 409 Conflict
      expect(results).toContain(201);
      expect(results).toContain(409);

      // Verify in DB exactly 1 registration row exists
      const regCount = await prisma.participantRegistration.count({
        where: { hackathonId: hackathonA.id, user: { email: regUserEmail } },
      });
      expect(regCount).toBe(1);
    });
  });

  // ==========================================================================
  // 7. INPUT SANITIZATION & SQL INJECTION PROBES
  // ==========================================================================
  describe('7. Input Sanitization & SQL Injection Probes', () => {
    it('ATTACK: SQL Injection in organization slug search -> Handled safely by parameterization', async () => {
      const maliciousSlug = "test' OR '1'='1; --";
      const res = await request(app.getHttpServer())
        .get(`/api/v1/organizations/${encodeURIComponent(maliciousSlug)}`)
        .set('Cookie', userA.cookie);

      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('ATTACK: Out-of-bounds pagination parameters -> Expected 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Cookie', adminUser.cookie)
        .query({ limit: 999999, page: -1 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 8. INFORMATION DISCLOSURE & ERROR SECURITY
  // ==========================================================================
  describe('8. Information Disclosure & Error Security', () => {
    it('ATTACK: Force 403/404 error and verify no database schema/secrets/stack traces leak', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/hackathons/non-existent-uuid-0000')
        .set('Cookie', userA.cookie);

      expect([403, 404]).toContain(res.status);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error).toHaveProperty('requestId');

      // Ensure no raw SQL or DB connections leak
      const stringified = JSON.stringify(res.body);
      expect(stringified).not.toContain('password');
      expect(stringified).not.toContain('postgres://');
      expect(stringified).not.toContain('DATABASE_URL');
      expect(stringified).not.toContain('redis://');
    });
  });
});

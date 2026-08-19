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

describe('GitHub Integration & Repository Orchestration E2E (S2-06)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let mockGitHubProvider: any;

  const timestamp = Date.now();
  let captainCookie: string;
  let memberBCookie: string;
  let otherUserCookie: string;

  let orgId: string;
  let hackathonId: string;
  let teamId: string;

  let captainUserId: string;
  let memberBUserId: string;
  let otherUserId: string;

  beforeAll(async () => {
    mockGitHubProvider = {
      getOAuthAuthorizationUrl: jest.fn().mockImplementation((state: string) => {
        return `https://github.com/login/oauth/authorize?client_id=test_client_id&state=${state}`;
      }),
      exchangeCodeForToken: jest.fn().mockResolvedValue({
        accessToken: 'ghp_mock_access_token_123456789',
        tokenType: 'bearer',
        scope: 'user:email,public_repo',
      }),
      getAuthenticatedUser: jest.fn().mockImplementation(async (token: string) => {
        if (token.includes('user_other')) {
          return { id: 888888, login: 'othergithubuser', avatar_url: 'https://github.com/other.png' };
        }
        return { id: 777777, login: 'captaingithub', avatar_url: 'https://github.com/captain.png' };
      }),
      createRepository: jest.fn().mockImplementation(async (_token: string, options: any) => {
        return {
          id: 554433,
          name: options.name,
          full_name: `captaingithub/${options.name}`,
          html_url: `https://github.com/captaingithub/${options.name}`,
          default_branch: 'main',
          private: options.isPrivate ?? false,
          owner: { id: 777777, login: 'captaingithub' },
        };
      }),
      getRepository: jest.fn().mockImplementation(async (_token: string, owner: string, repo: string) => {
        return {
          id: 554433,
          name: repo,
          full_name: `${owner}/${repo}`,
          html_url: `https://github.com/${owner}/${repo}`,
          default_branch: 'main',
          private: false,
          owner: { id: 777777, login: owner },
        };
      }),
      verifyRepositoryAccess: jest.fn().mockImplementation(async (_token: string, owner: string, repo: string) => {
        return {
          id: 554433,
          name: repo,
          full_name: `${owner}/${repo}`,
          html_url: `https://github.com/${owner}/${repo}`,
          default_branch: 'main',
          private: false,
          owner: { id: 777777, login: owner },
          permissions: { admin: true, push: true },
        };
      }),
      revokeToken: jest.fn().mockResolvedValue(undefined),
    };

    const mockRedisHealthIndicator = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    const mockQueueService = {
      addJob: jest.fn().mockResolvedValue({ id: 'mocked_job_id_github_e2e' } as any),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisHealthIndicator)
      .useValue(mockRedisHealthIndicator)
      .overrideProvider(QueueService)
      .useValue(mockQueueService)
      .overrideProvider(GitHubProviderService)
      .useValue(mockGitHubProvider)
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

    // Setup Test Users
    const captRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `gh_captain_${timestamp}@almosthack.com`, password: 'Password123!', name: 'Captain Alice' })
      .expect(201);
    captainCookie = captRes.get('Set-Cookie')?.[0] || '';
    captainUserId = captRes.body.data.id;

    const memBRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `gh_member_${timestamp}@almosthack.com`, password: 'Password123!', name: 'Member Bob' })
      .expect(201);
    memberBCookie = memBRes.get('Set-Cookie')?.[0] || '';
    memberBUserId = memBRes.body.data.id;

    const othRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `gh_other_${timestamp}@almosthack.com`, password: 'Password123!', name: 'Other User' })
      .expect(201);
    otherUserCookie = othRes.get('Set-Cookie')?.[0] || '';
    otherUserId = othRes.body.data.id;

    // Create Organization & Hackathon
    const orgRes = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Cookie', captainCookie)
      .send({ name: `GitHub Org ${timestamp}`, slug: `github-org-${timestamp}` })
      .expect(201);
    orgId = orgRes.body.data.id;

    const now = Date.now();
    const hRes = await request(app.getHttpServer())
      .post(`/api/v1/organizations/${orgId}/hackathons`)
      .set('Cookie', captainCookie)
      .send({
        name: `GitHub Hackathon ${timestamp}`,
        slug: `github-hack-${timestamp}`,
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
      .set('Cookie', captainCookie)
      .expect(200);

    // Register Captain & Member B
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

    // Captain Alice creates Team A
    const teamRes = await request(app.getHttpServer())
      .post(`/api/v1/hackathons/${hackathonId}/teams`)
      .set('Cookie', captainCookie)
      .send({ name: `Alpha Repo Team ${timestamp}`, slug: `alpha-repo-team-${timestamp}` })
      .expect(201);
    teamId = teamRes.body.data.id;

    // Member B invites & accepts to join Team A
    const invRes = await request(app.getHttpServer())
      .post(`/api/v1/teams/${teamId}/invitations`)
      .set('Cookie', captainCookie)
      .send({ inviteeUserId: memberBUserId })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/invitations/${invRes.body.data.id}/accept`)
      .set('Cookie', memberBCookie)
      .expect(200);
  });

  afterAll(async () => {
    if (orgId) {
      await prisma.teamRepository.deleteMany({});
      await prisma.gitHubAccount.deleteMany({});
      await prisma.oAuthState.deleteMany({});
      await prisma.teamInvitation.deleteMany({});
      await prisma.teamMember.deleteMany({});
      await prisma.team.deleteMany({});
      await prisma.participantRegistration.deleteMany({});
      await prisma.hackathonConfiguration.deleteMany({});
      await prisma.hackathon.deleteMany({ where: { organizationId: orgId } });
      await prisma.organizationMember.deleteMany({ where: { organizationId: orgId } });
      await prisma.organization.deleteMany({ where: { id: orgId } });
      await prisma.user.deleteMany({
        where: { id: { in: [captainUserId, memberBUserId, otherUserId] } },
      });
    }
    await app.close();
  });

  // ====================================================
  // 1. OAUTH FLOW & CSRF STATE VERIFICATION
  // ====================================================
  describe('1. OAuth Flow & CSRF State Security', () => {
    let generatedState: string;

    it('1. should allow authenticated user to initiate GitHub connect and receive OAuth URL & state', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/github/connect')
        .set('Cookie', captainCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toContain('https://github.com/login/oauth/authorize');
      expect(res.body.data.state).toBeDefined();

      generatedState = res.body.data.state;
    });

    it('2. should reject unauthenticated OAuth initiation with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/github/connect')
        .expect(401);
    });

    it('3. should reject OAuth callback with invalid state with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/github/callback?code=mock_code&state=fake_invalid_state')
        .set('Cookie', captainCookie)
        .expect(400);
    });

    it('4. should reject OAuth callback with state from another session with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/github/callback?code=mock_code&state=${generatedState}`)
        .set('Cookie', memberBCookie) // Different user!
        .expect(403);
    });

    it('5. should successfully execute OAuth callback, link identity, and mark state consumed', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/github/callback?code=mock_code&state=${generatedState}`)
        .set('Cookie', captainCookie)
        .expect(200);

      // Verify status endpoint returns connected
      const statusRes = await request(app.getHttpServer())
        .get('/api/v1/github/status')
        .set('Cookie', captainCookie)
        .expect(200);

      expect(statusRes.body.data.isConnected).toBe(true);
      expect(statusRes.body.data.githubUsername).toBe('captaingithub');
    });

    it('6. should reject reusing consumed OAuth state with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/github/callback?code=mock_code&state=${generatedState}`)
        .set('Cookie', captainCookie)
        .expect(400);
    });
  });

  // ====================================================
  // 2. TOKEN SECURITY & ZERO-LEAKAGE FORENSICS
  // ====================================================
  describe('2. Token Security & Zero-Leakage Forensics', () => {
    it('7. should NEVER expose raw access token in API responses', async () => {
      const statusRes = await request(app.getHttpServer())
        .get('/api/v1/github/status')
        .set('Cookie', captainCookie)
        .expect(200);

      const jsonString = JSON.stringify(statusRes.body);
      expect(jsonString).not.toContain('ghp_');
      expect(jsonString).not.toContain('accessToken');
      expect(jsonString).not.toContain('accessTokenEncrypted');
    });

    it('8. should NEVER log or store plaintext access token in AuditLog metadata', async () => {
      const auditLogs = await prisma.auditLog.findMany({
        where: { action: { in: ['github.account_connected', 'github.account_disconnected'] } },
      });

      for (const log of auditLogs) {
        const metadataStr = JSON.stringify(log.metadata);
        expect(metadataStr).not.toContain('ghp_');
        expect(metadataStr).not.toContain('accessToken');
      }
    });

    it('9. should store token encrypted in database using AES-256-GCM', async () => {
      const account = await prisma.gitHubAccount.findUnique({
        where: { userId: captainUserId },
      });

      expect(account).toBeDefined();
      expect(account?.accessTokenEncrypted).not.toContain('ghp_');
      expect(account?.accessTokenEncrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);
    });
  });

  // ====================================================
  // 3. REPOSITORY PROVISIONING & AUTHORIZATION
  // ====================================================
  let provisionedRepoId: string;

  describe('3. Repository Provisioning & Authorization', () => {
    it('10. should reject non-Captain attempting to provision team repository with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamId}/repository/provision`)
        .set('Cookie', memberBCookie) // Member B is not captain
        .send({})
        .expect(403);
    });

    it('11. should allow Captain to provision GitHub repository for Team', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamId}/repository/provision`)
        .set('Cookie', captainCookie)
        .send({})
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.teamId).toBe(teamId);
      expect(res.body.data.ownerLogin).toBe('captaingithub');
      expect(res.body.data.repositoryFullName).toContain('captaingithub/almosthack-');
      expect(res.body.data.status).toBe('CONNECTED');

      provisionedRepoId = res.body.data.id;
    });

    it('12. should be idempotent (repeated provision calls return existing active connection)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamId}/repository/provision`)
        .set('Cookie', captainCookie)
        .send({})
        .expect(201);

      expect(res.body.data.id).toBe(provisionedRepoId);
    });

    it('13. should allow querying team repository state', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/teams/${teamId}/repository`)
        .set('Cookie', memberBCookie) // Member can view
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(provisionedRepoId);
    });
  });

  // ====================================================
  // 4. DISCONNECT & RECOVERY
  // ====================================================
  describe('4. Disconnect & Recovery', () => {
    it('14. should allow Captain to disconnect team repository', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/teams/${teamId}/repository`)
        .set('Cookie', captainCookie)
        .expect(200);

      const repoRes = await request(app.getHttpServer())
        .get(`/api/v1/teams/${teamId}/repository`)
        .set('Cookie', captainCookie)
        .expect(200);

      expect(repoRes.body.data).toBeNull();
    });

    it('15. should allow user to disconnect GitHub account', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/github/connection')
        .set('Cookie', captainCookie)
        .expect(200);

      const statusRes = await request(app.getHttpServer())
        .get('/api/v1/github/status')
        .set('Cookie', captainCookie)
        .expect(200);

      expect(statusRes.body.data.isConnected).toBe(false);
    });

    it('16. should reject provisioning repository when GitHub account is disconnected with 408/403', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${teamId}/repository/provision`)
        .set('Cookie', captainCookie)
        .send({})
        .expect(403);
    });
  });
});

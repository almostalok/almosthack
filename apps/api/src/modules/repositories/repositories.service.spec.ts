import { Test, TestingModule } from '@nestjs/testing';
import { RepositoriesService } from './repositories.service';
import { PrismaService } from '../../database/prisma.service';
import { GitHubCredentialService } from './github-credential.service';
import { GitHubProviderService } from './github-provider.service';
import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

describe('RepositoriesService Unit Tests (S2-06)', () => {
  let service: RepositoriesService;
  let prisma: any;
  let credentialService: any;
  let githubProvider: any;

  const mockUser = { id: 'user-uuid-1', email: 'alice@mit.edu', name: 'Alice' };
  const mockTeam = {
    id: 'team-uuid-1',
    hackathonId: 'hack-uuid-1',
    name: 'Alpha Team',
    slug: 'alpha-team',
    status: 'ACTIVE',
    hackathon: {
      id: 'hack-uuid-1',
      organizationId: 'org-1',
      slug: 'spring-hack',
      status: 'PUBLISHED',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 86400000),
    },
    members: [{ id: 'm1', userId: 'user-uuid-1', role: 'CAPTAIN', status: 'ACTIVE' }],
  };

  beforeEach(async () => {
    const prismaMock = {
      oAuthState: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      gitHubAccount: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
      team: {
        findUnique: jest.fn(),
      },
      teamRepository: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (arg) => {
        if (typeof arg === 'function') {
          return arg(prismaMock);
        }
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }
        return arg;
      }),
    };

    const credentialServiceMock = {
      encryptToken: jest.fn().mockReturnValue('iv:cipher:tag'),
      decryptToken: jest.fn().mockReturnValue('ghp_raw_access_token_123'),
    };

    const githubProviderMock = {
      getOAuthAuthorizationUrl: jest.fn().mockReturnValue('https://github.com/login/oauth/authorize?client_id=123&state=xyz'),
      exchangeCodeForToken: jest.fn().mockResolvedValue({ accessToken: 'ghp_token', tokenType: 'bearer', scope: 'user:email' }),
      getAuthenticatedUser: jest.fn().mockResolvedValue({ id: 12345, login: 'octocat', avatar_url: 'https://github.com/avatar.png' }),
      createRepository: jest.fn().mockResolvedValue({
        id: 998877,
        name: 'almosthack-spring-hack-alpha-team',
        full_name: 'octocat/almosthack-spring-hack-alpha-team',
        html_url: 'https://github.com/octocat/almosthack-spring-hack-alpha-team',
        default_branch: 'main',
        private: false,
        owner: { id: 12345, login: 'octocat' },
      }),
      getRepository: jest.fn(),
      verifyRepositoryAccess: jest.fn(),
      revokeToken: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoriesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: GitHubCredentialService, useValue: credentialServiceMock },
        { provide: GitHubProviderService, useValue: githubProviderMock },
      ],
    }).compile();

    service = module.get<RepositoriesService>(RepositoriesService);
    prisma = module.get(PrismaService);
    credentialService = module.get(GitHubCredentialService);
    githubProvider = module.get(GitHubProviderService);
  });

  describe('1. OAuth Flow & CSRF State', () => {
    it('should generate short-lived OAuth state and return authorization URL', async () => {
      prisma.oAuthState.create.mockResolvedValue({});

      const res = await service.startOAuthFlow(mockUser.id, mockTeam.id);

      expect(res.url).toContain('https://github.com/login/oauth/authorize');
      expect(res.state).toBeDefined();
      expect(prisma.oAuthState.create).toHaveBeenCalled();
    });

    it('should reject callback with invalid state with BadRequestException', async () => {
      prisma.oAuthState.findUnique.mockResolvedValue(null);

      await expect(service.handleOAuthCallback('code123', 'invalid-state', mockUser.id, mockUser.email))
        .rejects.toThrow(BadRequestException);
    });

    it('should reject callback with expired state with BadRequestException', async () => {
      prisma.oAuthState.findUnique.mockResolvedValue({
        id: 'st-1',
        state: 'exp-state',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 1000), // Expired
        consumedAt: null,
      });

      await expect(service.handleOAuthCallback('code123', 'exp-state', mockUser.id, mockUser.email))
        .rejects.toThrow(BadRequestException);
    });

    it('should reject callback if state was already consumed with BadRequestException', async () => {
      prisma.oAuthState.findUnique.mockResolvedValue({
        id: 'st-1',
        state: 'reused-state',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 60000),
        consumedAt: new Date(), // Already used
      });

      await expect(service.handleOAuthCallback('code123', 'reused-state', mockUser.id, mockUser.email))
        .rejects.toThrow(BadRequestException);
    });

    it('should reject callback if state belongs to another user with ForbiddenException', async () => {
      prisma.oAuthState.findUnique.mockResolvedValue({
        id: 'st-1',
        state: 'other-user-state',
        userId: 'other-user-id',
        expiresAt: new Date(Date.now() + 60000),
        consumedAt: null,
      });

      await expect(service.handleOAuthCallback('code123', 'other-user-state', mockUser.id, mockUser.email))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('2. GitHub Account Linking & Identity', () => {
    it('should link GitHub identity, encrypt token, and return success', async () => {
      prisma.oAuthState.findUnique.mockResolvedValue({
        id: 'st-1',
        state: 'valid-state',
        userId: mockUser.id,
        teamId: mockTeam.id,
        expiresAt: new Date(Date.now() + 60000),
        consumedAt: null,
      });

      prisma.oAuthState.update.mockResolvedValue({});
      prisma.gitHubAccount.findUnique.mockResolvedValue(null);
      prisma.gitHubAccount.upsert.mockResolvedValue({});
      prisma.user.update.mockResolvedValue({});
      prisma.auditLog.create.mockResolvedValue({});

      const res = await service.handleOAuthCallback('valid-code', 'valid-state', mockUser.id, mockUser.email);

      expect(res.success).toBe(true);
      expect(res.githubUsername).toBe('octocat');
      expect(res.teamId).toBe(mockTeam.id);
      expect(credentialService.encryptToken).toHaveBeenCalledWith('ghp_token');
    });

    it('should reject linking a GitHub identity already linked to another AlmostHack user', async () => {
      prisma.oAuthState.findUnique.mockResolvedValue({
        id: 'st-1',
        state: 'valid-state',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 60000),
        consumedAt: null,
      });

      prisma.gitHubAccount.findUnique.mockResolvedValue({
        id: 'gh-acc-other',
        userId: 'different-user-id', // Linked to another user
        githubUserId: '12345',
      });

      await expect(service.handleOAuthCallback('valid-code', 'valid-state', mockUser.id, mockUser.email))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('3. Repository Provisioning & Idempotency', () => {
    it('should provision a new repository for team captain and return repo entity', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam);
      prisma.teamRepository.findFirst.mockResolvedValue(null);
      prisma.gitHubAccount.findUnique.mockResolvedValue({
        userId: mockUser.id,
        githubUsername: 'octocat',
        accessTokenEncrypted: 'iv:cipher:tag',
      });
      prisma.teamRepository.create.mockResolvedValue({
        id: 'tr-1',
        teamId: mockTeam.id,
        provider: 'GITHUB',
        providerRepositoryId: '998877',
        ownerLogin: 'octocat',
        repositoryName: 'almosthack-spring-hack-alpha-team',
        repositoryFullName: 'octocat/almosthack-spring-hack-alpha-team',
        repositoryUrl: 'https://github.com/octocat/almosthack-spring-hack-alpha-team',
        defaultBranch: 'main',
        isPrivate: false,
        status: 'CONNECTED',
        connectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await service.provisionTeamRepository(mockTeam.id, mockUser.id, mockUser.email);

      expect(res.repositoryFullName).toBe('octocat/almosthack-spring-hack-alpha-team');
      expect(res.status).toBe('CONNECTED');
      expect(githubProvider.createRepository).toHaveBeenCalled();
    });

    it('should return existing connected repository if provision is called again (idempotent)', async () => {
      const existingRepo = {
        id: 'tr-1',
        teamId: mockTeam.id,
        provider: 'GITHUB',
        providerRepositoryId: '998877',
        ownerLogin: 'octocat',
        repositoryName: 'almosthack-spring-hack-alpha-team',
        repositoryFullName: 'octocat/almosthack-spring-hack-alpha-team',
        repositoryUrl: 'https://github.com/octocat/almosthack-spring-hack-alpha-team',
        defaultBranch: 'main',
        isPrivate: false,
        status: 'CONNECTED',
        connectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.team.findUnique.mockResolvedValue(mockTeam);
      prisma.gitHubAccount.findUnique.mockResolvedValue({
        userId: mockUser.id,
        githubUsername: 'octocat',
        accessTokenEncrypted: 'iv:cipher:tag',
      });
      prisma.teamRepository.findFirst.mockResolvedValue(existingRepo);

      const res = await service.provisionTeamRepository(mockTeam.id, mockUser.id, mockUser.email);

      expect(res.id).toBe('tr-1');
      expect(githubProvider.createRepository).not.toHaveBeenCalled();
    });

    it('should reject provisioning if user is not the team Captain', async () => {
      const nonCaptainTeam = {
        ...mockTeam,
        members: [{ id: 'm2', userId: mockUser.id, role: 'MEMBER', status: 'ACTIVE' }],
      };
      prisma.team.findUnique.mockResolvedValue(nonCaptainTeam);

      await expect(service.provisionTeamRepository(mockTeam.id, mockUser.id, mockUser.email))
        .rejects.toThrow(ForbiddenException);
    });

    it('should reject provisioning if captain has no linked GitHub account', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam);
      prisma.teamRepository.findFirst.mockResolvedValue(null);
      prisma.gitHubAccount.findUnique.mockResolvedValue(null); // No GitHub account

      await expect(service.provisionTeamRepository(mockTeam.id, mockUser.id, mockUser.email))
        .rejects.toThrow(ForbiddenException);
    });
  });
});

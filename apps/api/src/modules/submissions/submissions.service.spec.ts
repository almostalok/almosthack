import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../../database/prisma.service';
import { GitHubCredentialService } from '../repositories/github-credential.service';
import { GitHubProviderService } from '../repositories/github-provider.service';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

describe('SubmissionsService (Unit Tests)', () => {
  let service: SubmissionsService;
  let prisma: any;
  let credentialService: any;
  let githubProvider: any;

  const mockPrisma = {
    team: { findUnique: jest.fn() },
    submission: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    hackathonTrack: { findUnique: jest.fn() },
    hackathonChallenge: { findUnique: jest.fn() },
    teamRepository: { findUnique: jest.fn() },
    auditLog: { create: jest.fn() },
    organizationMember: { findFirst: jest.fn() },
    judgeAssignment: { findFirst: jest.fn() },
    gitHubAccount: { findUnique: jest.fn() },
    $transaction: jest.fn((callbackOrArray) =>
      Array.isArray(callbackOrArray) ? Promise.all(callbackOrArray) : callbackOrArray(mockPrisma)
    ),
  };

  const mockCredentialService = {
    decryptToken: jest.fn().mockReturnValue('decrypted_token'),
  };

  const mockGithubProvider = {
    getRepository: jest.fn().mockResolvedValue({ default_branch: 'main' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GitHubCredentialService, useValue: mockCredentialService },
        { provide: GitHubProviderService, useValue: mockGithubProvider },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    prisma = module.get(PrismaService);
    credentialService = module.get(GitHubCredentialService);
    githubProvider = module.get(GitHubProviderService);
    jest.clearAllMocks();
  });

  describe('createOrUpdateDraft', () => {
    it('should throw NotFoundException if team does not exist', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrUpdateDraft('team-1', 'user-1', 'user@test.com', { title: 'Test Project' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not active team member', async () => {
      mockPrisma.team.findUnique.mockResolvedValue({
        id: 'team-1',
        status: 'ACTIVE',
        members: [{ userId: 'user-2', status: 'ACTIVE' }],
        hackathon: { status: 'LIVE', startsAt: new Date(Date.now() - 1000), endsAt: new Date(Date.now() + 100000) },
      });

      await expect(
        service.createOrUpdateDraft('team-1', 'user-1', 'user@test.com', { title: 'Test Project' })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if submission window is closed', async () => {
      mockPrisma.team.findUnique.mockResolvedValue({
        id: 'team-1',
        status: 'ACTIVE',
        members: [{ userId: 'user-1', status: 'ACTIVE' }],
        hackathon: {
          status: 'LIVE',
          startsAt: new Date(Date.now() - 100000),
          endsAt: new Date(Date.now() - 1000), // Ended in past
        },
      });

      await expect(
        service.createOrUpdateDraft('team-1', 'user-1', 'user@test.com', { title: 'Test Project' })
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully create a draft submission when within submission window', async () => {
      const now = new Date();
      mockPrisma.team.findUnique.mockResolvedValue({
        id: 'team-1',
        hackathonId: 'hack-1',
        status: 'ACTIVE',
        members: [{ userId: 'user-1', status: 'ACTIVE' }],
        repositories: [],
        hackathon: {
          organizationId: 'org-1',
          status: 'LIVE',
          startsAt: new Date(now.getTime() - 10000),
          endsAt: new Date(now.getTime() + 100000),
        },
      });

      mockPrisma.submission.findUnique.mockResolvedValue(null);
      mockPrisma.submission.upsert.mockResolvedValue({
        id: 'sub-1',
        hackathonId: 'hack-1',
        teamId: 'team-1',
        title: 'Test Project',
        status: 'DRAFT',
        createdAt: now,
        updatedAt: now,
      });

      const res = await service.createOrUpdateDraft('team-1', 'user-1', 'user@test.com', {
        title: 'Test Project',
      });

      expect(res.id).toBe('sub-1');
      expect(res.title).toBe('Test Project');
      expect(res.status).toBe('DRAFT');
    });
  });
});

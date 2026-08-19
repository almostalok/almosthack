import { Test, TestingModule } from '@nestjs/testing';
import { IntegrityService } from './integrity.service';
import { IntegrityEngineService } from './integrity-engine.service';
import { PrismaService } from '../../database/prisma.service';
import { GitHubCredentialService } from '../repositories/github-credential.service';
import { GitHubProviderService } from '../repositories/github-provider.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('IntegrityService', () => {
  let service: IntegrityService;

  const mockPrismaService = {
    submission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    organizationMember: {
      findFirst: jest.fn(),
    },
    integrityAnalysis: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    integrityFinding: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    integrityEvidence: {
      create: jest.fn(),
    },
    integrityReview: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    hackathon: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callbackOrArray) => {
      if (typeof callbackOrArray === 'function') {
        return callbackOrArray(mockPrismaService);
      }
      return Promise.all(callbackOrArray);
    }),
  };

  const mockGitHubCredentialService = {};
  const mockGitHubProviderService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrityService,
        IntegrityEngineService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GitHubCredentialService, useValue: mockGitHubCredentialService },
        { provide: GitHubProviderService, useValue: mockGitHubProviderService },
      ],
    }).compile();

    service = module.get<IntegrityService>(IntegrityService);
    jest.clearAllMocks();
  });

  describe('startAnalysis Authorization & Snapshot Validation', () => {
    it('should throw NotFoundException if submission does not exist', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(
        service.startAnalysis('non-existent', 'user-1', 'user@test.com')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not an organizer', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue({
        id: 'sub-1',
        hackathonId: 'hack-1',
        hackathon: { id: 'hack-1', organizationId: 'org-1' },
      });
      mockPrismaService.organizationMember.findFirst.mockResolvedValue(null);

      await expect(
        service.startAnalysis('sub-1', 'user-1', 'user@test.com')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if submission lacks a commitSha snapshot', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue({
        id: 'sub-1',
        hackathonId: 'hack-1',
        commitSha: null,
        hackathon: { id: 'hack-1', organizationId: 'org-1' },
      });
      mockPrismaService.organizationMember.findFirst.mockResolvedValue({
        organizationId: 'org-1',
        userId: 'user-1',
        status: 'ACTIVE',
      });

      await expect(
        service.startAnalysis('sub-1', 'user-1', 'user@test.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Review Workflow: Confirmation & Dismissal Requirements', () => {
    it('should require minimum 5 characters reason for confirmation', async () => {
      mockPrismaService.integrityFinding.findUnique.mockResolvedValue({
        id: 'finding-1',
        status: 'UNDER_REVIEW',
        analysis: { hackathon: { organizationId: 'org-1' } },
      });
      mockPrismaService.organizationMember.findFirst.mockResolvedValue({
        organizationId: 'org-1',
        userId: 'user-1',
      });

      await expect(
        service.confirmFinding('finding-1', 'user-1', 'user@test.com', { reason: 'bad' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should require minimum 5 characters reason for dismissal', async () => {
      mockPrismaService.integrityFinding.findUnique.mockResolvedValue({
        id: 'finding-1',
        status: 'UNDER_REVIEW',
        analysis: { hackathon: { organizationId: 'org-1' } },
      });
      mockPrismaService.organizationMember.findFirst.mockResolvedValue({
        organizationId: 'org-1',
        userId: 'user-1',
      });

      await expect(
        service.dismissFinding('finding-1', 'user-1', 'user@test.com', { reason: 'no' })
      ).rejects.toThrow(BadRequestException);
    });
  });
});

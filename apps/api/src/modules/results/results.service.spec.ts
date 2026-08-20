import { Test, TestingModule } from '@nestjs/testing';
import { ResultsService } from './results.service';
import { PrismaService } from '../../database/prisma.service';
import { ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import {
  ResultSetStatus,
  ResultEligibilityStatus,
} from '@almosthack/types';
import {
  EvaluationStatus as PrismaEvaluationStatus,
  SubmissionStatus,
  IntegrityFindingStatus,
  IntegritySeverity,
  ResultSetStatus as PrismaResultSetStatus,
} from '@prisma/client';

describe('ResultsService (Unit Tests)', () => {
  let service: ResultsService;

  const mockPrisma = {
    hackathon: { findUnique: jest.fn() },
    organizationMember: { findFirst: jest.fn() },
    judgingCriterion: { findMany: jest.fn() },
    submission: { findMany: jest.fn(), findUnique: jest.fn() },
    resultSet: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    resultEntry: { create: jest.fn(), findMany: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn((callbackOrArray) =>
      Array.isArray(callbackOrArray) ? Promise.all(callbackOrArray) : callbackOrArray(mockPrisma)
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ResultsService>(ResultsService);
    jest.clearAllMocks();
  });

  describe('Authorization & Incomplete Judging Guards', () => {
    it('should throw ForbiddenException if user is not an active organizer', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        organizationId: 'org-1',
        name: 'Test Hackathon',
      });
      mockPrisma.organizationMember.findFirst.mockResolvedValue(null);

      await expect(
        service.calculateResults('hack-1', 'unauthorized-user', 'user@test.com')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if no criteria are configured', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        organizationId: 'org-1',
        name: 'Test Hackathon',
      });
      mockPrisma.organizationMember.findFirst.mockResolvedValue({ id: 'om-1', status: 'ACTIVE' });
      mockPrisma.judgingCriterion.findMany.mockResolvedValue([]);

      await expect(
        service.calculateResults('hack-1', 'org-admin-1', 'admin@test.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('should block calculation if a submission has 0 finalized evaluations', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        organizationId: 'org-1',
        name: 'Test Hackathon',
      });
      mockPrisma.organizationMember.findFirst.mockResolvedValue({ id: 'om-1', status: 'ACTIVE' });
      mockPrisma.judgingCriterion.findMany.mockResolvedValue([
        { id: 'c-1', name: 'Quality', weight: 1, maxScore: 10 },
      ]);
      mockPrisma.submission.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          title: 'Project A',
          team: { id: 't-1', name: 'Team Alpha' },
          assignments: [],
          sourceFindings: [],
          targetFindings: [],
        },
      ]);

      await expect(
        service.calculateResults('hack-1', 'org-admin-1', 'admin@test.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Score Aggregation, Determinism & Precision', () => {
    it('should compute exact weighted score average across judges with 4-decimal precision', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        organizationId: 'org-1',
        name: 'Test Hackathon',
      });
      mockPrisma.organizationMember.findFirst.mockResolvedValue({ id: 'om-1', status: 'ACTIVE' });

      // Criteria: C1 (weight 2, max 10), C2 (weight 1, max 10) => maxWeightedSum = 30
      mockPrisma.judgingCriterion.findMany.mockResolvedValue([
        { id: 'c-1', name: 'Innovation', weight: 2, maxScore: 10 },
        { id: 'c-2', name: 'Execution', weight: 1, maxScore: 10 },
      ]);

      // Submission with 2 judges:
      // Judge 1: C1 = 9, C2 = 8 => (9*2 + 8*1)/30 = 26/30 = 86.6667%
      // Judge 2: C1 = 8, C2 = 7 => (8*2 + 7*1)/30 = 23/30 = 76.6667%
      // Average = (86.6667 + 76.6667)/2 = 81.6667%
      mockPrisma.submission.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          title: 'AI Assistant',
          teamId: 't-1',
          team: { id: 't-1', name: 'Alpha', slug: 'alpha' },
          trackId: null,
          track: null,
          assignments: [
            {
              id: 'a-1',
              status: 'COMPLETED',
              evaluation: {
                id: 'ev-1',
                status: PrismaEvaluationStatus.SUBMITTED,
                scores: [
                  { criterionId: 'c-1', score: 9 },
                  { criterionId: 'c-2', score: 8 },
                ],
              },
            },
            {
              id: 'a-2',
              status: 'COMPLETED',
              evaluation: {
                id: 'ev-2',
                status: PrismaEvaluationStatus.SUBMITTED,
                scores: [
                  { criterionId: 'c-1', score: 8 },
                  { criterionId: 'c-2', score: 7 },
                ],
              },
            },
          ],
          sourceFindings: [],
          targetFindings: [],
        },
      ]);

      mockPrisma.resultSet.count.mockResolvedValue(0);
      mockPrisma.resultSet.create.mockResolvedValue({ id: 'rs-1' });
      mockPrisma.resultSet.findUnique.mockResolvedValue({
        id: 'rs-1',
        hackathonId: 'hack-1',
        status: 'CALCULATED',
        calculationVersion: 1,
        scoringConfigVersion: 1,
        tieBreakRule: 'WEIGHTED_CRITERIA_THEN_CONSENSUS',
        inputFingerprint: 'fingerprint-123',
        calculatedAt: new Date(),
        approvedAt: null,
        publishedAt: null,
        approvedByUserId: null,
        publishedByUserId: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        entries: [
          {
            id: 're-1',
            resultSetId: 'rs-1',
            teamId: 't-1',
            team: { id: 't-1', name: 'Alpha', slug: 'alpha' },
            submissionId: 'sub-1',
            submission: { id: 'sub-1', title: 'AI Assistant' },
            trackId: null,
            track: null,
            score: 81.6667,
            rank: 1,
            eligibilityStatus: 'ELIGIBLE',
            eligibilityReason: null,
            isWinner: true,
            awardTitle: 'First Place',
            judgeCount: 2,
            scoreBreakdown: {
              criteria: [],
              judgeCount: 2,
              rawAveragePercentage: 81.6667,
              finalScore: 81.6667,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      const result = await service.calculateResults('hack-1', 'org-admin-1', 'admin@test.com');
      expect(result.status).toBe(ResultSetStatus.CALCULATED);
      expect(result.entries![0].score).toBe(81.6667);
      expect(result.entries![0].isWinner).toBe(true);
      expect(result.entries![0].rank).toBe(1);
    });
  });

  describe('Integrity Integration & Eligibility Boundary', () => {
    it('should mark submission as INELIGIBLE when confirmed integrity finding exists', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        organizationId: 'org-1',
        name: 'Test Hackathon',
      });
      mockPrisma.organizationMember.findFirst.mockResolvedValue({ id: 'om-1', status: 'ACTIVE' });
      mockPrisma.judgingCriterion.findMany.mockResolvedValue([
        { id: 'c-1', name: 'Quality', weight: 1, maxScore: 10 },
      ]);

      mockPrisma.submission.findMany.mockResolvedValue([
        {
          id: 'sub-plagiarized',
          title: 'Copied App',
          teamId: 't-2',
          team: { id: 't-2', name: 'Beta', slug: 'beta' },
          trackId: null,
          assignments: [
            {
              id: 'a-1',
              status: 'COMPLETED',
              evaluation: {
                id: 'ev-1',
                status: PrismaEvaluationStatus.SUBMITTED,
                scores: [{ criterionId: 'c-1', score: 10 }],
              },
            },
          ],
          sourceFindings: [
            {
              id: 'f-1',
              status: IntegrityFindingStatus.CONFIRMED,
              severity: IntegritySeverity.HIGH,
              similarity: 0.95,
              summary: 'Direct code plagiarism from repository X',
            },
          ],
          targetFindings: [],
        },
      ]);

      mockPrisma.resultSet.count.mockResolvedValue(0);
      mockPrisma.resultSet.create.mockResolvedValue({ id: 'rs-2' });
      mockPrisma.resultSet.findUnique.mockResolvedValue({
        id: 'rs-2',
        hackathonId: 'hack-1',
        status: 'CALCULATED',
        calculationVersion: 1,
        scoringConfigVersion: 1,
        tieBreakRule: 'WEIGHTED_CRITERIA_THEN_CONSENSUS',
        inputFingerprint: 'fingerprint-123',
        calculatedAt: new Date(),
        approvedAt: null,
        publishedAt: null,
        approvedByUserId: null,
        publishedByUserId: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        entries: [
          {
            id: 're-2',
            resultSetId: 'rs-2',
            teamId: 't-2',
            team: { id: 't-2', name: 'Beta', slug: 'beta' },
            submissionId: 'sub-plagiarized',
            submission: { id: 'sub-plagiarized', title: 'Copied App' },
            trackId: null,
            score: 100,
            rank: 1,
            eligibilityStatus: 'INELIGIBLE',
            eligibilityReason: 'Confirmed integrity violation: Direct code plagiarism from repository X',
            isWinner: false,
            awardTitle: null,
            judgeCount: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      const result = await service.calculateResults('hack-1', 'org-admin-1', 'admin@test.com');
      expect(result.entries![0].eligibilityStatus).toBe(ResultEligibilityStatus.INELIGIBLE);
      expect(result.entries![0].isWinner).toBe(false);
    });
  });

  describe('Staleness & Approval Safeguards', () => {
    it('should throw ConflictException on approval if authoritative evaluations have mutated', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        organizationId: 'org-1',
        name: 'Test Hackathon',
      });
      mockPrisma.organizationMember.findFirst.mockResolvedValue({ id: 'om-1', status: 'ACTIVE' });

      // Stored result set has older inputFingerprint
      mockPrisma.resultSet.findFirst.mockResolvedValue({
        id: 'rs-old',
        hackathonId: 'hack-1',
        status: PrismaResultSetStatus.CALCULATED,
        inputFingerprint: 'original-old-hash',
        entries: [{ eligibilityStatus: 'ELIGIBLE' }],
      });

      // Live computation returns different hash
      jest.spyOn(service, 'computeInputFingerprint').mockResolvedValue('newly-mutated-hash');

      await expect(
        service.approveResults('hack-1', 'org-admin-1', 'admin@test.com')
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Publication & Public Leaderboard Projection', () => {
    it('should reject publication if results are not approved', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        organizationId: 'org-1',
        name: 'Test Hackathon',
      });
      mockPrisma.organizationMember.findFirst.mockResolvedValue({ id: 'om-1', status: 'ACTIVE' });
      mockPrisma.resultSet.findFirst.mockResolvedValue(null);

      await expect(
        service.publishResults('hack-1', 'org-admin-1', 'admin@test.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('should return empty unpublished leaderboard if results are not published yet', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        name: 'Unpublished Hackathon',
      });
      mockPrisma.resultSet.findFirst.mockResolvedValue(null);

      const leaderboard = await service.getLeaderboard('hack-1');
      expect(leaderboard.isPublished).toBe(false);
      expect(leaderboard.entries).toEqual([]);
      expect(leaderboard.totalEntries).toBe(0);
    });
  });
});

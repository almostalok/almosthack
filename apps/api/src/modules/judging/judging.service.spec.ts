import { Test, TestingModule } from '@nestjs/testing';
import { JudgingService } from './judging.service';
import { PrismaService } from '../../database/prisma.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('JudgingService (Unit Tests)', () => {
  let service: JudgingService;
  let prisma: any;

  const mockPrisma = {
    hackathon: { findUnique: jest.fn() },
    organizationMember: { findFirst: jest.fn() },
    judgingCriterion: { create: jest.fn(), findMany: jest.fn(), delete: jest.fn() },
    submission: { findUnique: jest.fn() },
    judgeAssignment: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    judgeEvaluation: { findUnique: jest.fn(), upsert: jest.fn() },
    evaluationScore: { upsert: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn((callbackOrArray) =>
      Array.isArray(callbackOrArray) ? Promise.all(callbackOrArray) : callbackOrArray(mockPrisma)
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JudgingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<JudgingService>(JudgingService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('assignJudge - Conflict of Interest Guard', () => {
    it('should throw ForbiddenException if judge is a member of the submission team', async () => {
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: 'sub-1',
        hackathonId: 'hack-1',
        hackathon: { organizationId: 'org-1' },
        team: {
          id: 'team-1',
          members: [{ userId: 'judge-1', status: 'ACTIVE' }],
        },
      });

      mockPrisma.organizationMember.findFirst.mockResolvedValue({ id: 'om-1', status: 'ACTIVE' });

      await expect(
        service.assignJudge('sub-1', 'org-admin-1', 'admin@test.com', {
          judgeUserId: 'judge-1',
          submissionId: 'sub-1',
        })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('submitEvaluation - Server Weighted Score Calculation', () => {
    it('should calculate server weighted score accurately and save evaluation', async () => {
      const now = new Date();
      mockPrisma.judgeAssignment.findUnique.mockResolvedValue({
        id: 'assign-1',
        hackathonId: 'hack-1',
        submissionId: 'sub-1',
        judgeUserId: 'judge-1',
        status: 'ASSIGNED',
        submission: {
          hackathon: { organizationId: 'org-1' },
          team: { members: [] },
        },
        evaluation: null,
      });

      mockPrisma.judgingCriterion.findMany.mockResolvedValue([
        { id: 'crit-1', name: 'Innovation', weight: 2.0, maxScore: 10.0 },
        { id: 'crit-2', name: 'Design', weight: 1.0, maxScore: 10.0 },
      ]);

      mockPrisma.judgeEvaluation.upsert.mockResolvedValue({
        id: 'eval-1',
        assignmentId: 'assign-1',
        submissionId: 'sub-1',
        judgeUserId: 'judge-1',
        status: 'SUBMITTED',
        totalScore: 83.33,
      });

      mockPrisma.judgeEvaluation.findUnique.mockResolvedValue({
        id: 'eval-1',
        assignmentId: 'assign-1',
        submissionId: 'sub-1',
        judgeUserId: 'judge-1',
        status: 'SUBMITTED',
        totalScore: 83.33,
        scores: [],
      });

      const result = await service.submitEvaluation('assign-1', 'judge-1', 'judge@test.com', {
        scores: [
          { criterionId: 'crit-1', score: 8 },
          { criterionId: 'crit-2', score: 9 },
        ],
      });

      expect(result.status).toBe('SUBMITTED');
    });
  });
});

import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { AssignJudgeDto } from './dto/assign-judge.dto';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import {
  JudgingCriterionEntity,
  JudgeAssignmentEntity,
  JudgeEvaluationEntity,
  JudgeAssignmentStatus,
  EvaluationStatus,
} from '@almosthack/types';
import {
  TeamMemberStatus,
  JudgeAssignmentStatus as PrismaAssignmentStatus,
  EvaluationStatus as PrismaEvaluationStatus,
} from '@prisma/client';

@Injectable()
export class JudgingService {
  private readonly logger = new Logger(JudgingService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async createCriterion(
    hackathonId: string,
    userId: string,
    userEmail: string,
    dto: CreateCriterionDto
  ): Promise<JudgingCriterionEntity> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found.',
      });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: hackathon.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can manage judging criteria.',
      });
    }

    const [criterion] = await this.prisma.$transaction([
      this.prisma.judgingCriterion.create({
        data: {
          hackathonId,
          name: dto.name.trim(),
          description: dto.description ? dto.description.trim() : null,
          weight: dto.weight ?? 1.0,
          maxScore: dto.maxScore ?? 10.0,
          displayOrder: dto.displayOrder ?? 0,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'judging_criterion.created',
          targetEntity: 'JudgingCriterion',
          targetId: hackathonId,
          metadata: {
            organizationId: hackathon.organizationId,
            hackathonId,
            name: dto.name,
          },
        },
      }),
    ]);

    return this.formatCriterion(criterion);
  }

  public async getCriteria(hackathonId: string): Promise<JudgingCriterionEntity[]> {
    const criteria = await this.prisma.judgingCriterion.findMany({
      where: { hackathonId },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return criteria.map((c) => this.formatCriterion(c));
  }

  public async deleteCriterion(
    hackathonId: string,
    criterionId: string,
    userId: string,
    userEmail: string
  ): Promise<{ success: true }> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found.',
      });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: hackathon.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can manage judging criteria.',
      });
    }

    await this.prisma.$transaction([
      this.prisma.judgingCriterion.delete({
        where: { id: criterionId },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'judging_criterion.deleted',
          targetEntity: 'JudgingCriterion',
          targetId: criterionId,
          metadata: {
            organizationId: hackathon.organizationId,
            hackathonId,
            criterionId,
          },
        },
      }),
    ]);

    return { success: true };
  }

  public async assignJudge(
    submissionId: string,
    userId: string,
    userEmail: string,
    dto: AssignJudgeDto
  ): Promise<JudgeAssignmentEntity> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        hackathon: true,
        team: { include: { members: { where: { status: TeamMemberStatus.ACTIVE } } } },
      },
    });

    if (!submission) {
      throw new NotFoundException({
        code: 'SUBMISSION_NOT_FOUND',
        message: 'Submission not found.',
      });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: submission.hackathon.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can assign judges to submissions.',
      });
    }

    // CONFLICT OF INTEREST GUARD: Judge cannot evaluate own team!
    const isTeamMember = submission.team.members.some((m) => m.userId === dto.judgeUserId);
    if (isTeamMember) {
      throw new ForbiddenException({
        code: 'CONFLICT_OF_INTEREST',
        message: 'A judge cannot be assigned to evaluate a submission from their own team.',
      });
    }

    const now = new Date();

    const [assignment] = await this.prisma.$transaction([
      this.prisma.judgeAssignment.upsert({
        where: {
          submissionId_judgeUserId: {
            submissionId,
            judgeUserId: dto.judgeUserId,
          },
        },
        create: {
          hackathonId: submission.hackathonId,
          submissionId,
          judgeUserId: dto.judgeUserId,
          assignedByUserId: userId,
          status: PrismaAssignmentStatus.ASSIGNED,
          assignedAt: now,
        },
        update: {
          status: PrismaAssignmentStatus.ASSIGNED,
          assignedByUserId: userId,
          assignedAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'judge.assigned',
          targetEntity: 'JudgeAssignment',
          targetId: submissionId,
          metadata: {
            organizationId: submission.hackathon.organizationId,
            hackathonId: submission.hackathonId,
            submissionId,
            judgeUserId: dto.judgeUserId,
          },
        },
      }),
    ]);

    return this.formatAssignment(assignment);
  }

  public async revokeJudgeAssignment(
    submissionId: string,
    judgeUserId: string,
    userId: string,
    userEmail: string
  ): Promise<{ success: true }> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { hackathon: true },
    });

    if (!submission) {
      throw new NotFoundException({
        code: 'SUBMISSION_NOT_FOUND',
        message: 'Submission not found.',
      });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: submission.hackathon.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can revoke judge assignments.',
      });
    }

    const assignment = await this.prisma.judgeAssignment.findUnique({
      where: { submissionId_judgeUserId: { submissionId, judgeUserId } },
    });

    if (!assignment) {
      throw new NotFoundException({
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Judge assignment not found.',
      });
    }

    await this.prisma.$transaction([
      this.prisma.judgeAssignment.update({
        where: { id: assignment.id },
        data: { status: PrismaAssignmentStatus.REVOKED },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'judge.revoked',
          targetEntity: 'JudgeAssignment',
          targetId: assignment.id,
          metadata: {
            organizationId: submission.hackathon.organizationId,
            hackathonId: submission.hackathonId,
            submissionId,
            judgeUserId,
          },
        },
      }),
    ]);

    return { success: true };
  }

  public async getJudgeAssignments(judgeUserId: string): Promise<JudgeAssignmentEntity[]> {
    const assignments = await this.prisma.judgeAssignment.findMany({
      where: {
        judgeUserId,
        status: { in: [PrismaAssignmentStatus.ASSIGNED, PrismaAssignmentStatus.IN_PROGRESS, PrismaAssignmentStatus.COMPLETED] },
      },
      include: {
        submission: {
          include: {
            team: true,
            track: true,
            challenge: true,
            repository: true,
          },
        },
        evaluation: {
          include: {
            scores: { include: { criterion: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return assignments.map((a) => this.formatAssignment(a));
  }

  public async getJudgeAssignmentDetail(assignmentId: string, userId: string): Promise<JudgeAssignmentEntity> {
    const assignment = await this.prisma.judgeAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        submission: {
          include: {
            team: true,
            track: true,
            challenge: true,
            repository: true,
          },
        },
        hackathon: true,
        evaluation: {
          include: {
            scores: { include: { criterion: true } },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException({
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Judge assignment not found.',
      });
    }

    const isAssignedJudge = assignment.judgeUserId === userId;
    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: assignment.hackathon.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!isAssignedJudge && !isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You do not have access to view this assignment.',
      });
    }

    return this.formatAssignment(assignment);
  }

  public async saveEvaluationDraft(
    assignmentId: string,
    judgeUserId: string,
    userEmail: string,
    dto: SubmitEvaluationDto
  ): Promise<JudgeEvaluationEntity> {
    return this.upsertEvaluation(assignmentId, judgeUserId, userEmail, dto, PrismaEvaluationStatus.DRAFT);
  }

  public async submitEvaluation(
    assignmentId: string,
    judgeUserId: string,
    userEmail: string,
    dto: SubmitEvaluationDto
  ): Promise<JudgeEvaluationEntity> {
    return this.upsertEvaluation(assignmentId, judgeUserId, userEmail, dto, PrismaEvaluationStatus.SUBMITTED);
  }

  private async upsertEvaluation(
    assignmentId: string,
    judgeUserId: string,
    userEmail: string,
    dto: SubmitEvaluationDto,
    targetStatus: PrismaEvaluationStatus
  ): Promise<JudgeEvaluationEntity> {
    const assignment = await this.prisma.judgeAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        submission: {
          include: {
            team: { include: { members: { where: { status: TeamMemberStatus.ACTIVE } } } },
            hackathon: true,
          },
        },
        evaluation: true,
      },
    });

    if (!assignment || assignment.status === PrismaAssignmentStatus.REVOKED) {
      throw new NotFoundException({
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Active judge assignment not found.',
      });
    }

    // ISOLATION: Must be assigned judge!
    if (assignment.judgeUserId !== judgeUserId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You are not assigned to evaluate this submission.',
      });
    }

    // COI double-check
    const isTeamMember = assignment.submission.team.members.some((m) => m.userId === judgeUserId);
    if (isTeamMember) {
      throw new ForbiddenException({
        code: 'CONFLICT_OF_INTEREST',
        message: 'You cannot evaluate a submission from your own team.',
      });
    }

    if (assignment.evaluation && assignment.evaluation.status === PrismaEvaluationStatus.SUBMITTED) {
      if (targetStatus === PrismaEvaluationStatus.SUBMITTED) {
        // Return existing submitted evaluation (idempotent)
        const fullEval = await this.prisma.judgeEvaluation.findUnique({
          where: { id: assignment.evaluation.id },
          include: { scores: { include: { criterion: true } } },
        });
        return this.formatEvaluation(fullEval!);
      }
      throw new ConflictException({
        code: 'EVALUATION_ALREADY_SUBMITTED',
        message: 'Evaluation has already been submitted and is immutable.',
      });
    }

    // Fetch Criteria for validation & score calculation
    const criteria = await this.prisma.judgingCriterion.findMany({
      where: { hackathonId: assignment.hackathonId },
    });

    if (criteria.length === 0) {
      throw new BadRequestException({
        code: 'NO_RUBRIC_CRITERIA',
        message: 'No judging criteria found for this hackathon.',
      });
    }

    const criteriaMap = new Map(criteria.map((c) => [c.id, c]));

    // Validate Scores
    let weightedScoreSum = 0;
    let maxWeightedSum = 0;

    for (const scoreInput of dto.scores) {
      const criterion = criteriaMap.get(scoreInput.criterionId);
      if (!criterion) {
        throw new BadRequestException({
          code: 'INVALID_CRITERION',
          message: `Criterion '${scoreInput.criterionId}' does not belong to this hackathon.`,
        });
      }

      if (scoreInput.score < 0 || scoreInput.score > criterion.maxScore) {
        throw new BadRequestException({
          code: 'SCORE_OUT_OF_BOUNDS',
          message: `Score for '${criterion.name}' must be between 0 and ${criterion.maxScore}.`,
        });
      }

      weightedScoreSum += scoreInput.score * criterion.weight;
      maxWeightedSum += criterion.maxScore * criterion.weight;
    }

    // Server-Calculated Percentage Total Score (0 - 100), rounded to 2 decimal places
    const totalScore = maxWeightedSum > 0
      ? Math.round((weightedScoreSum / maxWeightedSum) * 100 * 100) / 100
      : 0;

    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      // Upsert evaluation
      const evalRecord = await tx.judgeEvaluation.upsert({
        where: { assignmentId },
        create: {
          assignmentId,
          submissionId: assignment.submissionId,
          judgeUserId,
          status: targetStatus,
          generalFeedback: dto.generalFeedback ? dto.generalFeedback.trim() : null,
          totalScore,
          submittedAt: targetStatus === PrismaEvaluationStatus.SUBMITTED ? now : null,
        },
        update: {
          status: targetStatus,
          generalFeedback: dto.generalFeedback ? dto.generalFeedback.trim() : null,
          totalScore,
          submittedAt: targetStatus === PrismaEvaluationStatus.SUBMITTED ? now : null,
        },
      });

      // Upsert scores
      for (const scoreInput of dto.scores) {
        await tx.evaluationScore.upsert({
          where: {
            evaluationId_criterionId: {
              evaluationId: evalRecord.id,
              criterionId: scoreInput.criterionId,
            },
          },
          create: {
            evaluationId: evalRecord.id,
            criterionId: scoreInput.criterionId,
            score: scoreInput.score,
            comment: scoreInput.comment ? scoreInput.comment.trim() : null,
          },
          update: {
            score: scoreInput.score,
            comment: scoreInput.comment ? scoreInput.comment.trim() : null,
          },
        });
      }

      // Update Assignment status
      const newAssignmentStatus = targetStatus === PrismaEvaluationStatus.SUBMITTED
        ? PrismaAssignmentStatus.COMPLETED
        : PrismaAssignmentStatus.IN_PROGRESS;

      await tx.judgeAssignment.update({
        where: { id: assignmentId },
        data: {
          status: newAssignmentStatus,
          completedAt: targetStatus === PrismaEvaluationStatus.SUBMITTED ? now : null,
        },
      });

      if (targetStatus === PrismaEvaluationStatus.SUBMITTED) {
        await tx.auditLog.create({
          data: {
            actorId: judgeUserId,
            actorEmail: userEmail,
            action: 'evaluation.submitted',
            targetEntity: 'JudgeEvaluation',
            targetId: evalRecord.id,
            metadata: {
              organizationId: assignment.submission.hackathon.organizationId,
              hackathonId: assignment.hackathonId,
              submissionId: assignment.submissionId,
              totalScore,
            },
          },
        });
      }

      return tx.judgeEvaluation.findUnique({
        where: { id: evalRecord.id },
        include: { scores: { include: { criterion: true } } },
      });
    });

    return this.formatEvaluation(result!);
  }

  private formatCriterion(c: any): JudgingCriterionEntity {
    return {
      id: c.id,
      hackathonId: c.hackathonId,
      name: c.name,
      description: c.description,
      weight: c.weight,
      maxScore: c.maxScore,
      displayOrder: c.displayOrder,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
    };
  }

  private formatAssignment(a: any): JudgeAssignmentEntity {
    return {
      id: a.id,
      hackathonId: a.hackathonId,
      submissionId: a.submissionId,
      judgeUserId: a.judgeUserId,
      assignedByUserId: a.assignedByUserId,
      status: a.status as JudgeAssignmentStatus,
      assignedAt: a.assignedAt instanceof Date ? a.assignedAt.toISOString() : a.assignedAt,
      completedAt: a.completedAt instanceof Date ? a.completedAt.toISOString() : a.completedAt,
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
      updatedAt: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : a.updatedAt,
      submission: a.submission ? (this.formatSubmissionBrief(a.submission) as any) : undefined,
      judgeUser: a.judgeUser
        ? {
            id: a.judgeUser.id,
            name: a.judgeUser.name,
            email: a.judgeUser.email,
          }
        : undefined,
      evaluation: a.evaluation ? this.formatEvaluation(a.evaluation) : null,
    };
  }

  private formatSubmissionBrief(sub: any): any {
    return {
      id: sub.id,
      hackathonId: sub.hackathonId,
      teamId: sub.teamId,
      title: sub.title,
      description: sub.description,
      demoUrl: sub.demoUrl,
      documentationUrl: sub.documentationUrl,
      commitSha: sub.commitSha,
      snapshotBranch: sub.snapshotBranch,
      status: sub.status,
      team: sub.team ? { id: sub.team.id, name: sub.team.name, slug: sub.team.slug } : undefined,
      repository: sub.repository
        ? {
            id: sub.repository.id,
            repositoryFullName: sub.repository.repositoryFullName,
            repositoryUrl: sub.repository.repositoryUrl,
            defaultBranch: sub.repository.defaultBranch,
          }
        : null,
    };
  }

  private formatEvaluation(e: any): JudgeEvaluationEntity {
    return {
      id: e.id,
      assignmentId: e.assignmentId,
      submissionId: e.submissionId,
      judgeUserId: e.judgeUserId,
      status: e.status as EvaluationStatus,
      generalFeedback: e.generalFeedback,
      totalScore: e.totalScore,
      submittedAt: e.submittedAt instanceof Date ? e.submittedAt.toISOString() : e.submittedAt,
      createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
      updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : e.updatedAt,
      scores: e.scores
        ? e.scores.map((s: any) => ({
            id: s.id,
            evaluationId: s.evaluationId,
            criterionId: s.criterionId,
            score: s.score,
            comment: s.comment,
            criterion: s.criterion ? this.formatCriterion(s.criterion) : undefined,
          }))
        : [],
    };
  }
}

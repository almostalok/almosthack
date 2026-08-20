import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import {
  ResultSetStatus,
  ResultEligibilityStatus,
  ResultSetEntity,
  ResultEntryEntity,
  LeaderboardResponseDto,
  LeaderboardEntryEntity,
  ScoreBreakdown,
} from '@almosthack/types';
import {
  ResultSetStatus as PrismaResultSetStatus,
  ResultEligibilityStatus as PrismaResultEligibilityStatus,
  EvaluationStatus as PrismaEvaluationStatus,
  SubmissionStatus,
  IntegrityFindingStatus,
  IntegritySeverity,
} from '@prisma/client';
import { CalculateResultsDto, ApproveResultsDto, PublishResultsDto } from './dto/results.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to verify caller is an active Organizer/Owner/Admin of the hackathon's organization.
   */
  private async assertOrganizerAccess(hackathonId: string, userId: string): Promise<{
    hackathonId: string;
    organizationId: string;
    hackathonName: string;
  }> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: { organization: true },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found.',
      });
    }

    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: hackathon.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only hackathon organizers can manage results and rankings.',
      });
    }

    return {
      hackathonId: hackathon.id,
      organizationId: hackathon.organizationId,
      hackathonName: hackathon.name,
    };
  }

  /**
   * Generate deterministic SHA-256 fingerprint for all authoritative inputs
   * that influence scoring, eligibility, and ranking for a hackathon.
   */
  public async computeInputFingerprint(hackathonId: string): Promise<string> {
    // 1. Criteria configuration
    const criteria = await this.prisma.judgingCriterion.findMany({
      where: { hackathonId },
      orderBy: [{ id: 'asc' }],
    });

    // 2. Submissions & Evaluations
    const submissions = await this.prisma.submission.findMany({
      where: {
        hackathonId,
        status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW, SubmissionStatus.FINALIZED] },
      },
      include: {
        evaluations: {
          where: { status: PrismaEvaluationStatus.SUBMITTED },
          include: { scores: { orderBy: { criterionId: 'asc' } } },
          orderBy: { id: 'asc' },
        },
        sourceFindings: {
          orderBy: { id: 'asc' },
        },
        targetFindings: {
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    const hash = crypto.createHash('sha256');
    hash.update(`hackathon:${hackathonId}`);

    // Feed criteria
    for (const c of criteria) {
      hash.update(`|crit:${c.id}:${c.weight}:${c.maxScore}`);
    }

    // Feed submissions, finalized evaluations, scores, and integrity findings
    for (const sub of submissions) {
      hash.update(`|sub:${sub.id}:${sub.status}:${sub.commitSha || ''}`);
      for (const ev of sub.evaluations || []) {
        hash.update(`|eval:${ev.id}:${ev.totalScore}`);
        for (const sc of ev.scores || []) {
          hash.update(`|sc:${sc.criterionId}:${sc.score}`);
        }
      }
      for (const f of [...(sub.sourceFindings || []), ...(sub.targetFindings || [])]) {
        hash.update(`|find:${f.id}:${f.status}:${f.severity}`);
      }
    }

    return hash.digest('hex');
  }

  /**
   * Calculate Results for a Hackathon.
   * Server-side score aggregation, eligibility check, deterministic ranking, tie-breaking,
   * snapshot creation, and audit logging.
   */
  public async calculateResults(
    hackathonId: string,
    userId: string,
    userEmail: string,
    dto?: CalculateResultsDto
  ): Promise<ResultSetEntity> {
    const { organizationId, hackathonName } = await this.assertOrganizerAccess(hackathonId, userId);

    // Fetch Criteria
    const criteria = await this.prisma.judgingCriterion.findMany({
      where: { hackathonId },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    if (criteria.length === 0) {
      throw new BadRequestException({
        code: 'NO_JUDGING_CRITERIA',
        message: 'Cannot calculate results: No judging criteria configured for this hackathon.',
      });
    }

    // Fetch Submissions for Hackathon
    const submissions = await this.prisma.submission.findMany({
      where: {
        hackathonId,
        status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW, SubmissionStatus.FINALIZED] },
      },
      include: {
        team: true,
        track: true,
        assignments: {
          include: {
            evaluation: {
              include: {
                scores: {
                  include: {
                    criterion: true,
                  },
                },
              },
            },
          },
        },
        sourceFindings: true,
        targetFindings: true,
      },
    });

    if (submissions.length === 0) {
      throw new BadRequestException({
        code: 'NO_SUBMISSIONS',
        message: 'Cannot calculate results: No submitted projects found for this hackathon.',
      });
    }

    // Incomplete Judging Validation
    for (const sub of submissions) {
      const submittedEvals = sub.assignments
        .filter((a) => a.status !== 'REVOKED' && a.evaluation && a.evaluation.status === PrismaEvaluationStatus.SUBMITTED)
        .map((a) => a.evaluation!);

      const pendingAssignments = sub.assignments.filter(
        (a) => a.status !== 'REVOKED' && (!a.evaluation || a.evaluation.status !== PrismaEvaluationStatus.SUBMITTED)
      );

      // Rule: Each submission must have at least one finalized evaluation and no dangling pending assignments
      if (submittedEvals.length === 0) {
        throw new BadRequestException({
          code: 'INCOMPLETE_JUDGING',
          message: `Cannot calculate results: Submission '${sub.title}' (${sub.team.name}) has no finalized evaluations.`,
        });
      }

      if (pendingAssignments.length > 0) {
        throw new BadRequestException({
          code: 'INCOMPLETE_JUDGING',
          message: `Cannot calculate results: Submission '${sub.title}' has ${pendingAssignments.length} pending judge assignment(s) not yet submitted.`,
        });
      }
    }

    // Compute Input Fingerprint
    const inputFingerprint = await this.computeInputFingerprint(hackathonId);

    // Calculate Scores & Determine Eligibility for Each Submission
    const criteriaMap = new Map(criteria.map((c) => [c.id, c]));
    const maxWeightedSum = criteria.reduce((sum, c) => sum + c.maxScore * c.weight, 0);

    const calculatedEntries: Array<{
      submission: (typeof submissions)[0];
      score: number;
      rawCriterionSum: number;
      judgeCount: number;
      eligibilityStatus: ResultEligibilityStatus;
      eligibilityReason: string | null;
      scoreBreakdown: ScoreBreakdown;
    }> = [];

    for (const sub of submissions) {
      const submittedEvals = sub.assignments
        .filter((a) => a.status !== 'REVOKED' && a.evaluation && a.evaluation.status === PrismaEvaluationStatus.SUBMITTED)
        .map((a) => a.evaluation!);

      let totalPercentageSum = 0;
      let rawCriterionSum = 0;

      // Track per-criterion score sums across judges
      const criterionScoreSums = new Map<string, number>();
      for (const c of criteria) {
        criterionScoreSums.set(c.id, 0);
      }

      for (const ev of submittedEvals) {
        let evalWeightedSum = 0;
        for (const sc of ev.scores) {
          const crit = criteriaMap.get(sc.criterionId);
          if (crit) {
            evalWeightedSum += sc.score * crit.weight;
            rawCriterionSum += sc.score;
            criterionScoreSums.set(sc.criterionId, (criterionScoreSums.get(sc.criterionId) || 0) + sc.score);
          }
        }

        const evalPercentage = maxWeightedSum > 0 ? (evalWeightedSum / maxWeightedSum) * 100 : 0;
        totalPercentageSum += evalPercentage;
      }

      const judgeCount = submittedEvals.length;
      const rawAvgPercentage = judgeCount > 0 ? totalPercentageSum / judgeCount : 0;
      // Deterministic precision: round to 4 decimal places
      const finalScore = Math.round(rawAvgPercentage * 10000) / 10000;

      // Build criteria score breakdown
      const criteriaBreakdown = criteria.map((c) => {
        const totalScoreForCrit = criterionScoreSums.get(c.id) || 0;
        const avgScore = judgeCount > 0 ? Math.round((totalScoreForCrit / judgeCount) * 10000) / 10000 : 0;
        return {
          criterionId: c.id,
          criterionName: c.name,
          weight: c.weight,
          maxScore: c.maxScore,
          averageScore: avgScore,
        };
      });

      const scoreBreakdown: ScoreBreakdown = {
        criteria: criteriaBreakdown,
        judgeCount,
        rawAveragePercentage: Math.round(rawAvgPercentage * 10000) / 10000,
        finalScore,
      };

      // Eligibility Assessment (Integrity Integration)
      // Source findings represent cases where this submission is the suspect copier.
      const sourceFindings = sub.sourceFindings || [];
      const hasConfirmedViolation = sourceFindings.some(
        (f) => f.status === IntegrityFindingStatus.CONFIRMED && (f.severity === IntegritySeverity.HIGH || f.similarity >= 0.7)
      );
      const hasPendingReview = sourceFindings.some(
        (f) => f.status === IntegrityFindingStatus.OPEN || f.status === IntegrityFindingStatus.UNDER_REVIEW
      );

      let eligibilityStatus: ResultEligibilityStatus = ResultEligibilityStatus.ELIGIBLE;
      let eligibilityReason: string | null = null;

      if (hasConfirmedViolation) {
        const confirmedFinding = sourceFindings.find((f) => f.status === IntegrityFindingStatus.CONFIRMED);
        eligibilityStatus = ResultEligibilityStatus.INELIGIBLE;
        eligibilityReason = `Confirmed integrity violation: ${confirmedFinding?.summary || 'Plagiarism detected'}`;
      } else if (hasPendingReview) {
        eligibilityStatus = ResultEligibilityStatus.PENDING_REVIEW;
        eligibilityReason = 'Integrity investigation open or under review';
      }

      calculatedEntries.push({
        submission: sub,
        score: finalScore,
        rawCriterionSum,
        judgeCount,
        eligibilityStatus,
        eligibilityReason,
        scoreBreakdown,
      });
    }

    // Deterministic Multi-Tier Ranking & Tie-Break:
    // Partition: Eligible vs Ineligible/Pending
    const eligibleEntries = calculatedEntries.filter((e) => e.eligibilityStatus === ResultEligibilityStatus.ELIGIBLE);
    const nonEligibleEntries = calculatedEntries.filter((e) => e.eligibilityStatus !== ResultEligibilityStatus.ELIGIBLE);

    // Sort Eligible Entries:
    // 1. Score DESC
    // 2. Raw criterion sum DESC (Tie-break level 1)
    // 3. Submission ID ASC (Stable deterministic tie-break level 2)
    eligibleEntries.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.rawCriterionSum !== a.rawCriterionSum) {
        return b.rawCriterionSum - a.rawCriterionSum;
      }
      return a.submission.id.localeCompare(b.submission.id);
    });

    // Competition Ranking for eligible entries (1, 2, 2, 4)
    let currentRank = 1;
    const rankedEligible: Array<{
      entry: (typeof eligibleEntries)[0];
      rank: number;
      isWinner: boolean;
      awardTitle: string | null;
    }> = [];

    for (let i = 0; i < eligibleEntries.length; i++) {
      if (i > 0) {
        const prev = eligibleEntries[i - 1];
        const curr = eligibleEntries[i];
        if (curr.score !== prev.score || curr.rawCriterionSum !== prev.rawCriterionSum) {
          currentRank = i + 1;
        }
      }

      const isWinner = currentRank === 1;
      const awardTitle = currentRank === 1 ? 'First Place' : currentRank === 2 ? 'Second Place' : currentRank === 3 ? 'Third Place' : null;

      rankedEligible.push({
        entry: eligibleEntries[i],
        rank: currentRank,
        isWinner,
        awardTitle,
      });
    }

    // Sort & rank non-eligible entries after eligible entries
    nonEligibleEntries.sort((a, b) => b.score - a.score || a.submission.id.localeCompare(b.submission.id));
    const rankedNonEligible = nonEligibleEntries.map((e, index) => ({
      entry: e,
      rank: eligibleEntries.length + index + 1,
      isWinner: false,
      awardTitle: null,
    }));

    const allRanked = [...rankedEligible, ...rankedNonEligible];

    // Determine calculation version
    const previousResultCount = await this.prisma.resultSet.count({
      where: { hackathonId },
    });
    const calculationVersion = previousResultCount + 1;

    // Database Transaction: Supersede active unapproved calculations & save new snapshot
    const savedResultSet = await this.prisma.$transaction(async (tx) => {
      // Supersede any existing CALCULATED / UNDER_REVIEW result sets
      await tx.resultSet.updateMany({
        where: {
          hackathonId,
          status: { in: [PrismaResultSetStatus.CALCULATED, PrismaResultSetStatus.UNDER_REVIEW] },
        },
        data: {
          status: PrismaResultSetStatus.SUPERSEDED,
        },
      });

      // Create new ResultSet
      const resultSet = await tx.resultSet.create({
        data: {
          hackathonId,
          status: PrismaResultSetStatus.CALCULATED,
          calculationVersion,
          scoringConfigVersion: 1,
          tieBreakRule: 'WEIGHTED_CRITERIA_THEN_CONSENSUS',
          inputFingerprint,
          metadata: {
            totalSubmissions: submissions.length,
            eligibleCount: eligibleEntries.length,
            ineligibleCount: nonEligibleEntries.length,
            calculatedByUserId: userId,
          },
        },
      });

      // Create ResultEntries
      for (const item of allRanked) {
        await tx.resultEntry.create({
          data: {
            resultSetId: resultSet.id,
            teamId: item.entry.submission.teamId,
            submissionId: item.entry.submission.id,
            trackId: item.entry.submission.trackId,
            score: item.entry.score,
            rank: item.rank,
            eligibilityStatus: item.entry.eligibilityStatus as PrismaResultEligibilityStatus,
            eligibilityReason: item.entry.eligibilityReason,
            isWinner: item.isWinner,
            awardTitle: item.awardTitle,
            judgeCount: item.entry.judgeCount,
            scoreBreakdown: item.entry.scoreBreakdown as any,
          },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'results.calculated',
          targetEntity: 'ResultSet',
          targetId: resultSet.id,
          metadata: {
            organizationId,
            hackathonId,
            resultSetId: resultSet.id,
            calculationVersion,
            totalEntries: allRanked.length,
            inputFingerprint,
          },
        },
      });

      return resultSet;
    });

    return this.getResultSetDetail(savedResultSet.id);
  }

  /**
   * Get detail for a specific result set.
   */
  public async getResultSetDetail(resultSetId: string): Promise<ResultSetEntity> {
    const resultSet = await this.prisma.resultSet.findUnique({
      where: { id: resultSetId },
      include: {
        entries: {
          include: {
            team: true,
            submission: true,
            track: true,
          },
          orderBy: [{ rank: 'asc' }, { score: 'desc' }],
        },
      },
    });

    if (!resultSet) {
      throw new NotFoundException({
        code: 'RESULT_SET_NOT_FOUND',
        message: 'Result set not found.',
      });
    }

    return this.formatResultSet(resultSet);
  }

  /**
   * Get current active (or published/approved/calculated) result set for a hackathon.
   */
  public async getLatestResultSet(hackathonId: string, userId: string): Promise<ResultSetEntity> {
    await this.assertOrganizerAccess(hackathonId, userId);

    // Preference: PUBLISHED > APPROVED > CALCULATED/UNDER_REVIEW
    const resultSet = await this.prisma.resultSet.findFirst({
      where: {
        hackathonId,
        status: { in: [PrismaResultSetStatus.PUBLISHED, PrismaResultSetStatus.APPROVED, PrismaResultSetStatus.CALCULATED, PrismaResultSetStatus.UNDER_REVIEW] },
      },
      include: {
        entries: {
          include: {
            team: true,
            submission: true,
            track: true,
          },
          orderBy: [{ rank: 'asc' }, { score: 'desc' }],
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    if (!resultSet) {
      throw new NotFoundException({
        code: 'NO_RESULTS_CALCULATED',
        message: 'No results have been calculated yet for this hackathon.',
      });
    }

    return this.formatResultSet(resultSet);
  }

  /**
   * Get all historical result sets for a hackathon. Organizer only.
   */
  public async getResultSetHistory(hackathonId: string, userId: string): Promise<ResultSetEntity[]> {
    await this.assertOrganizerAccess(hackathonId, userId);

    const resultSets = await this.prisma.resultSet.findMany({
      where: { hackathonId },
      include: {
        entries: {
          include: {
            team: true,
            submission: true,
            track: true,
          },
          orderBy: [{ rank: 'asc' }],
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return resultSets.map((rs) => this.formatResultSet(rs));
  }

  /**
   * Organizer Approves Calculated Results.
   * Enforces staleness checks and unresolved integrity checks.
   */
  public async approveResults(
    hackathonId: string,
    userId: string,
    userEmail: string,
    dto?: ApproveResultsDto
  ): Promise<ResultSetEntity> {
    const { organizationId } = await this.assertOrganizerAccess(hackathonId, userId);

    // Find active calculated / under_review result set
    const resultSet = await this.prisma.resultSet.findFirst({
      where: {
        hackathonId,
        status: { in: [PrismaResultSetStatus.CALCULATED, PrismaResultSetStatus.UNDER_REVIEW] },
      },
      include: {
        entries: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    if (!resultSet) {
      // Check if already approved
      const alreadyApproved = await this.prisma.resultSet.findFirst({
        where: { hackathonId, status: PrismaResultSetStatus.APPROVED },
      });
      if (alreadyApproved) {
        return this.getResultSetDetail(alreadyApproved.id);
      }

      throw new NotFoundException({
        code: 'NO_CALCULATED_RESULTS',
        message: 'No calculated results available for approval. Please calculate results first.',
      });
    }

    // Staleness Detection: Compare stored input fingerprint with live database state
    const currentFingerprint = await this.computeInputFingerprint(hackathonId);
    if (currentFingerprint !== resultSet.inputFingerprint) {
      throw new ConflictException({
        code: 'STALE_RESULTS',
        message: 'Cannot approve results: Authoritative inputs (evaluations, criteria, or integrity findings) have changed since calculation. Please recalculate results.',
      });
    }

    // Integrity Unresolved Check
    const hasPendingReview = resultSet.entries.some(
      (e) => e.eligibilityStatus === PrismaResultEligibilityStatus.PENDING_REVIEW
    );
    if (hasPendingReview) {
      throw new ConflictException({
        code: 'UNRESOLVED_INTEGRITY_FINDINGS',
        message: 'Cannot approve results: Some submissions have unresolved integrity investigations under review. All findings must be confirmed or dismissed prior to approval.',
      });
    }

    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const approvedSet = await tx.resultSet.update({
        where: { id: resultSet.id },
        data: {
          status: PrismaResultSetStatus.APPROVED,
          approvedAt: now,
          approvedByUserId: userId,
          metadata: {
            ...(resultSet.metadata as Record<string, unknown> || {}),
            approvalNotes: dto?.notes || null,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'results.approved',
          targetEntity: 'ResultSet',
          targetId: approvedSet.id,
          metadata: {
            organizationId,
            hackathonId,
            resultSetId: approvedSet.id,
            approvedAt: now.toISOString(),
          },
        },
      });

      return approvedSet;
    });

    return this.getResultSetDetail(updated.id);
  }

  /**
   * Organizer Publishes Approved Results to the Public Leaderboard.
   * Atomically transitions APPROVED -> PUBLISHED, superseding prior published sets.
   */
  public async publishResults(
    hackathonId: string,
    userId: string,
    userEmail: string,
    dto?: PublishResultsDto
  ): Promise<ResultSetEntity> {
    const { organizationId } = await this.assertOrganizerAccess(hackathonId, userId);

    // Find APPROVED result set
    const approvedSet = await this.prisma.resultSet.findFirst({
      where: {
        hackathonId,
        status: PrismaResultSetStatus.APPROVED,
      },
      include: {
        entries: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    if (!approvedSet) {
      throw new BadRequestException({
        code: 'RESULTS_NOT_APPROVED',
        message: 'Cannot publish results: Results must be reviewed and approved by an organizer before publication.',
      });
    }

    // Staleness Detection before publication
    const currentFingerprint = await this.computeInputFingerprint(hackathonId);
    if (currentFingerprint !== approvedSet.inputFingerprint) {
      throw new ConflictException({
        code: 'STALE_RESULTS',
        message: 'Cannot publish results: Authoritative inputs have changed since approval. Recalculation and re-approval are required.',
      });
    }

    const now = new Date();

    const published = await this.prisma.$transaction(async (tx) => {
      // Supersede any currently published result set for this hackathon
      await tx.resultSet.updateMany({
        where: {
          hackathonId,
          status: PrismaResultSetStatus.PUBLISHED,
        },
        data: {
          status: PrismaResultSetStatus.SUPERSEDED,
        },
      });

      // Update approved set to PUBLISHED
      const targetSet = await tx.resultSet.update({
        where: { id: approvedSet.id },
        data: {
          status: PrismaResultSetStatus.PUBLISHED,
          publishedAt: now,
          publishedByUserId: userId,
          metadata: {
            ...(approvedSet.metadata as Record<string, unknown> || {}),
            publishedNotificationSent: dto?.notifyParticipants ?? false,
          },
        },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'results.published',
          targetEntity: 'ResultSet',
          targetId: targetSet.id,
          metadata: {
            organizationId,
            hackathonId,
            resultSetId: targetSet.id,
            publishedAt: now.toISOString(),
          },
        },
      });

      return targetSet;
    });

    return this.getResultSetDetail(published.id);
  }

  /**
   * Public Leaderboard: Anonymous & Participant accessible.
   * Strictly reads from authoritative PUBLISHED ResultSet only.
   * Returns empty/unauthorized payload when unpublished (zero data leak).
   */
  public async getLeaderboard(hackathonId: string, query?: LeaderboardQueryDto): Promise<LeaderboardResponseDto> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found.',
      });
    }

    // Find the single authoritative PUBLISHED result set
    const publishedSet = await this.prisma.resultSet.findFirst({
      where: {
        hackathonId,
        status: PrismaResultSetStatus.PUBLISHED,
      },
      include: {
        entries: {
          where: query?.trackId ? { trackId: query.trackId } : undefined,
          include: {
            team: true,
            submission: true,
            track: true,
          },
          orderBy: [{ rank: 'asc' }, { score: 'desc' }],
          take: query?.limit ?? 50,
          skip: query?.offset ?? 0,
        },
      },
    });

    if (!publishedSet) {
      return {
        hackathonId: hackathon.id,
        hackathonName: hackathon.name,
        isPublished: false,
        publishedAt: null,
        totalEntries: 0,
        entries: [],
      };
    }

    const leaderboardEntries: LeaderboardEntryEntity[] = publishedSet.entries
      .filter((e) => e.eligibilityStatus === PrismaResultEligibilityStatus.ELIGIBLE)
      .map((entry) => ({
        rank: entry.rank,
        teamId: entry.team.id,
        teamName: entry.team.name,
        teamSlug: entry.team.slug,
        submissionId: entry.submission.id,
        submissionTitle: entry.submission.title,
        trackId: entry.track?.id || null,
        trackName: entry.track?.name || null,
        score: entry.score,
        isWinner: entry.isWinner,
        awardTitle: entry.awardTitle,
      }));

    return {
      hackathonId: hackathon.id,
      hackathonName: hackathon.name,
      isPublished: true,
      publishedAt: publishedSet.publishedAt?.toISOString() || null,
      totalEntries: leaderboardEntries.length,
      entries: leaderboardEntries,
    };
  }

  /**
   * Format helper for ResultSetEntity
   */
  private formatResultSet(raw: any): ResultSetEntity {
    return {
      id: raw.id,
      hackathonId: raw.hackathonId,
      status: raw.status as ResultSetStatus,
      calculationVersion: raw.calculationVersion,
      scoringConfigVersion: raw.scoringConfigVersion,
      tieBreakRule: raw.tieBreakRule,
      inputFingerprint: raw.inputFingerprint,
      calculatedAt: raw.calculatedAt.toISOString(),
      approvedAt: raw.approvedAt ? raw.approvedAt.toISOString() : null,
      publishedAt: raw.publishedAt ? raw.publishedAt.toISOString() : null,
      approvedByUserId: raw.approvedByUserId,
      publishedByUserId: raw.publishedByUserId,
      metadata: raw.metadata as Record<string, unknown> || null,
      entries: raw.entries ? raw.entries.map((e: any) => this.formatResultEntry(e)) : undefined,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    };
  }

  /**
   * Format helper for ResultEntryEntity
   */
  private formatResultEntry(raw: any): ResultEntryEntity {
    return {
      id: raw.id,
      resultSetId: raw.resultSetId,
      teamId: raw.teamId,
      teamName: raw.team?.name || 'Unknown Team',
      teamSlug: raw.team?.slug,
      submissionId: raw.submissionId,
      submissionTitle: raw.submission?.title || 'Unknown Submission',
      trackId: raw.trackId,
      trackName: raw.track?.name || null,
      score: raw.score,
      rank: raw.rank,
      eligibilityStatus: raw.eligibilityStatus as ResultEligibilityStatus,
      eligibilityReason: raw.eligibilityReason,
      isWinner: raw.isWinner,
      awardTitle: raw.awardTitle,
      judgeCount: raw.judgeCount,
      scoreBreakdown: raw.scoreBreakdown as ScoreBreakdown || null,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    };
  }
}

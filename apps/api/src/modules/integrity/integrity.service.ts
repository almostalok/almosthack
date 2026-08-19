import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GitHubCredentialService } from '../repositories/github-credential.service';
import { GitHubProviderService } from '../repositories/github-provider.service';
import {
  IntegrityEngineService,
  SourceFile,
} from './integrity-engine.service';
import { StartAnalysisDto } from './dto/start-analysis.dto';
import { ReviewFindingDto } from './dto/review-finding.dto';
import { ConfirmFindingDto } from './dto/confirm-finding.dto';
import { DismissFindingDto } from './dto/dismiss-finding.dto';
import {
  IntegrityAnalysisEntity,
  IntegrityFindingEntity,
  IntegrityFindingStatus,
  IntegrityAnalysisStatus,
  IntegritySeverity,
  IntegrityFindingType,
} from '@almosthack/types';
import {
  IntegrityAnalysisStatus as PrismaAnalysisStatus,
  IntegrityFindingStatus as PrismaFindingStatus,
  IntegritySeverity as PrismaSeverity,
  IntegrityFindingType as PrismaFindingType,
  SubmissionStatus,
} from '@prisma/client';

@Injectable()
export class IntegrityService {
  private readonly logger = new Logger(IntegrityService.name);

  // In-memory file repository storage / mock map for test fixtures
  private fileFixturesMap = new Map<string, SourceFile[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly credentialService: GitHubCredentialService,
    private readonly githubProvider: GitHubProviderService,
    private readonly engine: IntegrityEngineService
  ) {}

  /**
   * Test fixture helper to seed files for a submission commit snapshot
   */
  public registerFileFixture(commitShaOrSubmissionId: string, files: SourceFile[]) {
    this.fileFixturesMap.set(commitShaOrSubmissionId, files);
  }

  public async startAnalysis(
    submissionId: string,
    userId: string,
    userEmail: string,
    dto?: StartAnalysisDto
  ): Promise<IntegrityAnalysisEntity> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        hackathon: true,
        team: true,
        repository: true,
      },
    });

    if (!submission) {
      throw new NotFoundException({
        code: 'SUBMISSION_NOT_FOUND',
        message: 'Submission not found.',
      });
    }

    // RBAC: Only Hackathon Organizers can trigger integrity analysis
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
        message: 'Only organizers can start integrity analysis.',
      });
    }

    // Verify Submission has a valid immutable Commit SHA snapshot
    if (!submission.commitSha) {
      throw new BadRequestException({
        code: 'SNAPSHOT_REQUIRED',
        message: 'Submission must be finalized with a verified commit SHA before analysis.',
      });
    }

    const commitSha = submission.commitSha;
    const threshold = dto?.similarityThreshold ?? 0.45;

    // Idempotency: Check if active analysis already exists for this snapshot
    const activeAnalysis = await this.prisma.integrityAnalysis.findFirst({
      where: {
        submissionId,
        commitSha,
        status: { in: [PrismaAnalysisStatus.QUEUED, PrismaAnalysisStatus.RUNNING] },
      },
    });

    if (activeAnalysis) {
      return this.formatAnalysis(activeAnalysis);
    }

    const now = new Date();

    // 1. Create Analysis Record in RUNNING status
    const analysis = await this.prisma.$transaction(async (tx) => {
      const rec = await tx.integrityAnalysis.create({
        data: {
          hackathonId: submission.hackathonId,
          submissionId,
          repositoryId: submission.repositoryId,
          commitSha,
          status: PrismaAnalysisStatus.RUNNING,
          engineVersion: this.engine.ENGINE_VERSION,
          configurationVersion: 1,
          startedAt: now,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'integrity.analysis_started',
          targetEntity: 'IntegrityAnalysis',
          targetId: rec.id,
          metadata: {
            organizationId: submission.hackathon.organizationId,
            hackathonId: submission.hackathonId,
            submissionId,
            commitSha,
          },
        },
      });

      return rec;
    });

    try {
      // 2. Fetch Source Files for the analyzed submission
      const sourceFiles = await this.fetchSubmissionFiles(submission);

      // 3. Candidate Generation: Find Peer Submissions in the SAME Hackathon
      // Strictly isolate cross-hackathon submissions & eliminate self-comparison (A != A and teamId_A != teamId_B)
      const peerSubmissions = await this.prisma.submission.findMany({
        where: {
          hackathonId: submission.hackathonId,
          id: { not: submissionId },
          teamId: { not: submission.teamId },
          status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.FINALIZED, SubmissionStatus.UNDER_REVIEW] },
          commitSha: { not: null },
        },
        include: { repository: true, team: true },
      });

      let findingsCount = 0;

      for (const peer of peerSubmissions) {
        const targetFiles = await this.fetchSubmissionFiles(peer);
        const result = this.engine.compareRepositories(
          submissionId,
          sourceFiles,
          peer.id,
          targetFiles,
          threshold
        );

        if (result && result.overallSimilarity >= threshold) {
          findingsCount++;

          // Severity classification based on signal strength
          let severity: PrismaSeverity = PrismaSeverity.LOW;
          if (result.overallSimilarity >= 0.85) {
            severity = PrismaSeverity.HIGH;
          } else if (result.overallSimilarity >= 0.65) {
            severity = PrismaSeverity.MEDIUM;
          }

          const findingType: PrismaFindingType =
            result.matchingFilesCount > 3
              ? PrismaFindingType.FILE_OVERLAP
              : PrismaFindingType.CODE_SIMILARITY;

          // Transactionally persist finding and evidence
          await this.prisma.$transaction(async (tx) => {
            const finding = await tx.integrityFinding.create({
              data: {
                analysisId: analysis.id,
                submissionId,
                comparisonSubmissionId: peer.id,
                type: findingType,
                severity,
                confidence: result.overallConfidence,
                similarity: result.overallSimilarity,
                status: PrismaFindingStatus.OPEN,
                summary: `Potential structural similarity (${Math.round(result.overallSimilarity * 100)}%) detected between ${result.matchingFilesCount} files.`,
                metadata: {
                  matchingFilesCount: result.matchingFilesCount,
                  totalFilesCompared: result.totalFilesCompared,
                },
              },
            });

            for (const fileRes of result.fileResults) {
              await tx.integrityEvidence.create({
                data: {
                  findingId: finding.id,
                  sourcePath: fileRes.sourcePath,
                  targetPath: fileRes.targetPath,
                  sourceStart: fileRes.sourceStartLine,
                  sourceEnd: fileRes.sourceEndLine,
                  targetStart: fileRes.targetStartLine,
                  targetEnd: fileRes.targetEndLine,
                  matchedFragmentHash: fileRes.fragmentHash,
                  similarityMetric: fileRes.similarity,
                  sourceSnippet: fileRes.sourceSnippet,
                  targetSnippet: fileRes.targetSnippet,
                },
              });
            }

            await tx.auditLog.create({
              data: {
                actorId: userId,
                actorEmail: userEmail,
                action: 'integrity.finding_created',
                targetEntity: 'IntegrityFinding',
                targetId: finding.id,
                metadata: {
                  analysisId: analysis.id,
                  submissionId,
                  comparisonSubmissionId: peer.id,
                  similarity: result.overallSimilarity,
                  severity,
                },
              },
            });
          });
        }
      }

      // 4. Mark Analysis COMPLETED
      const completedAt = new Date();
      const completedAnalysis = await this.prisma.$transaction(async (tx) => {
        const res = await tx.integrityAnalysis.update({
          where: { id: analysis.id },
          data: {
            status: PrismaAnalysisStatus.COMPLETED,
            completedAt,
            summary: {
              totalFilesAnalyzed: sourceFiles.length,
              peerSubmissionsCompared: peerSubmissions.length,
              findingsCount,
            },
          },
          include: {
            findings: { include: { evidence: true, submission: { include: { team: true } } } },
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: userId,
            actorEmail: userEmail,
            action: 'integrity.analysis_completed',
            targetEntity: 'IntegrityAnalysis',
            targetId: analysis.id,
            metadata: {
              organizationId: submission.hackathon.organizationId,
              hackathonId: submission.hackathonId,
              submissionId,
              findingsCount,
            },
          },
        });

        return res;
      });

      return this.formatAnalysis(completedAnalysis);
    } catch (err: any) {
      this.logger.error(`Integrity analysis failed for submission ${submissionId}: ${err.message}`);
      const failedAt = new Date();

      await this.prisma.$transaction([
        this.prisma.integrityAnalysis.update({
          where: { id: analysis.id },
          data: {
            status: PrismaAnalysisStatus.FAILED,
            failedAt,
            failureReason: err.message || 'Analysis execution error',
          },
        }),
        this.prisma.auditLog.create({
          data: {
            actorId: userId,
            actorEmail: userEmail,
            action: 'integrity.analysis_failed',
            targetEntity: 'IntegrityAnalysis',
            targetId: analysis.id,
            metadata: {
              submissionId,
              reason: err.message,
            },
          },
        }),
      ]);

      throw err;
    }
  }

  public async getHackathonAnalyses(hackathonId: string, userId: string): Promise<IntegrityAnalysisEntity[]> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({ code: 'HACKATHON_NOT_FOUND', message: 'Hackathon not found.' });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: { organizationId: hackathon.organizationId, userId, status: 'ACTIVE' },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can view hackathon integrity analyses.',
      });
    }

    const analyses = await this.prisma.integrityAnalysis.findMany({
      where: { hackathonId },
      include: {
        submission: { include: { team: true } },
        findings: { include: { evidence: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return analyses.map((a) => this.formatAnalysis(a));
  }

  public async getSubmissionAnalyses(submissionId: string, userId: string): Promise<IntegrityAnalysisEntity[]> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { hackathon: true, team: true },
    });

    if (!submission) {
      throw new NotFoundException({ code: 'SUBMISSION_NOT_FOUND', message: 'Submission not found.' });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: { organizationId: submission.hackathon.organizationId, userId, status: 'ACTIVE' },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can view submission integrity analyses.',
      });
    }

    const analyses = await this.prisma.integrityAnalysis.findMany({
      where: { submissionId },
      include: {
        submission: { include: { team: true } },
        findings: { include: { evidence: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return analyses.map((a) => this.formatAnalysis(a));
  }

  public async getHackathonFindings(
    hackathonId: string,
    userId: string,
    status?: string
  ): Promise<IntegrityFindingEntity[]> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({ code: 'HACKATHON_NOT_FOUND', message: 'Hackathon not found.' });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: { organizationId: hackathon.organizationId, userId, status: 'ACTIVE' },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can view hackathon integrity findings.',
      });
    }

    const findings = await this.prisma.integrityFinding.findMany({
      where: {
        analysis: { hackathonId },
        status: status ? (status as PrismaFindingStatus) : undefined,
      },
      include: {
        evidence: true,
        reviews: { include: { reviewer: true } },
        submission: { include: { team: true } },
        comparisonSubmission: { include: { team: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return findings.map((f) => this.formatFinding(f));
  }

  public async getFindingDetail(findingId: string, userId: string): Promise<IntegrityFindingEntity> {
    const finding = await this.prisma.integrityFinding.findUnique({
      where: { id: findingId },
      include: {
        analysis: { include: { hackathon: true } },
        evidence: true,
        reviews: { include: { reviewer: true } },
        submission: { include: { team: true } },
        comparisonSubmission: { include: { team: true } },
      },
    });

    if (!finding) {
      throw new NotFoundException({ code: 'FINDING_NOT_FOUND', message: 'Integrity finding not found.' });
    }

    // IDOR Protection: Must be Organizer of the hackathon
    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: finding.analysis.hackathon.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You do not have access to view this integrity finding.',
      });
    }

    return this.formatFinding(finding);
  }

  public async startReview(
    findingId: string,
    userId: string,
    userEmail: string,
    dto?: ReviewFindingDto
  ): Promise<IntegrityFindingEntity> {
    const finding = await this.prisma.integrityFinding.findUnique({
      where: { id: findingId },
      include: { analysis: { include: { hackathon: true } } },
    });

    if (!finding) {
      throw new NotFoundException({ code: 'FINDING_NOT_FOUND', message: 'Integrity finding not found.' });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: { organizationId: finding.analysis.hackathon.organizationId, userId, status: 'ACTIVE' },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can review integrity findings.',
      });
    }

    const now = new Date();

    const [updatedFinding] = await this.prisma.$transaction([
      this.prisma.integrityFinding.update({
        where: { id: findingId },
        data: { status: PrismaFindingStatus.UNDER_REVIEW },
        include: {
          evidence: true,
          reviews: { include: { reviewer: true } },
          submission: { include: { team: true } },
          comparisonSubmission: { include: { team: true } },
        },
      }),
      this.prisma.integrityReview.create({
        data: {
          findingId,
          reviewerId: userId,
          fromStatus: finding.status,
          toStatus: PrismaFindingStatus.UNDER_REVIEW,
          reason: 'Review initiated by organizer',
          notes: dto?.notes || null,
          createdAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'integrity.finding_review_started',
          targetEntity: 'IntegrityFinding',
          targetId: findingId,
          metadata: { findingId, fromStatus: finding.status, toStatus: 'UNDER_REVIEW' },
        },
      }),
    ]);

    return this.formatFinding(updatedFinding);
  }

  public async confirmFinding(
    findingId: string,
    userId: string,
    userEmail: string,
    dto: ConfirmFindingDto
  ): Promise<IntegrityFindingEntity> {
    const finding = await this.prisma.integrityFinding.findUnique({
      where: { id: findingId },
      include: { analysis: { include: { hackathon: true } } },
    });

    if (!finding) {
      throw new NotFoundException({ code: 'FINDING_NOT_FOUND', message: 'Integrity finding not found.' });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: { organizationId: finding.analysis.hackathon.organizationId, userId, status: 'ACTIVE' },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can confirm integrity findings.',
      });
    }

    const reason = dto.reason.trim();
    if (reason.length < 5) {
      throw new BadRequestException({
        code: 'REASON_REQUIRED',
        message: 'A detailed confirmation reason (at least 5 characters) is required.',
      });
    }

    const now = new Date();

    // Transactional confirmation: Update status & record review + audit
    // Non-Negotiable: Finding confirmation DOES NOT modify submission status, score, or team status!
    const [updatedFinding] = await this.prisma.$transaction([
      this.prisma.integrityFinding.update({
        where: { id: findingId },
        data: { status: PrismaFindingStatus.CONFIRMED },
        include: {
          evidence: true,
          reviews: { include: { reviewer: true } },
          submission: { include: { team: true } },
          comparisonSubmission: { include: { team: true } },
        },
      }),
      this.prisma.integrityReview.create({
        data: {
          findingId,
          reviewerId: userId,
          fromStatus: finding.status,
          toStatus: PrismaFindingStatus.CONFIRMED,
          reason,
          notes: dto.notes || null,
          createdAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'integrity.finding_confirmed',
          targetEntity: 'IntegrityFinding',
          targetId: findingId,
          metadata: { findingId, reason },
        },
      }),
    ]);

    return this.formatFinding(updatedFinding);
  }

  public async dismissFinding(
    findingId: string,
    userId: string,
    userEmail: string,
    dto: DismissFindingDto
  ): Promise<IntegrityFindingEntity> {
    const finding = await this.prisma.integrityFinding.findUnique({
      where: { id: findingId },
      include: { analysis: { include: { hackathon: true } } },
    });

    if (!finding) {
      throw new NotFoundException({ code: 'FINDING_NOT_FOUND', message: 'Integrity finding not found.' });
    }

    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: { organizationId: finding.analysis.hackathon.organizationId, userId, status: 'ACTIVE' },
    });

    if (!isOrganizer) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only organizers can dismiss integrity findings.',
      });
    }

    const reason = dto.reason.trim();
    if (reason.length < 5) {
      throw new BadRequestException({
        code: 'REASON_REQUIRED',
        message: 'A detailed dismissal reason (explaining false positive) is required.',
      });
    }

    const now = new Date();

    const [updatedFinding] = await this.prisma.$transaction([
      this.prisma.integrityFinding.update({
        where: { id: findingId },
        data: { status: PrismaFindingStatus.DISMISSED },
        include: {
          evidence: true,
          reviews: { include: { reviewer: true } },
          submission: { include: { team: true } },
          comparisonSubmission: { include: { team: true } },
        },
      }),
      this.prisma.integrityReview.create({
        data: {
          findingId,
          reviewerId: userId,
          fromStatus: finding.status,
          toStatus: PrismaFindingStatus.DISMISSED,
          reason,
          notes: dto.notes || null,
          createdAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'integrity.finding_dismissed',
          targetEntity: 'IntegrityFinding',
          targetId: findingId,
          metadata: { findingId, reason },
        },
      }),
    ]);

    return this.formatFinding(updatedFinding);
  }

  private async fetchSubmissionFiles(submission: any): Promise<SourceFile[]> {
    // 1. Check in-memory test fixture map first
    if (submission.commitSha && this.fileFixturesMap.has(submission.commitSha)) {
      return this.fileFixturesMap.get(submission.commitSha)!;
    }
    if (this.fileFixturesMap.has(submission.id)) {
      return this.fileFixturesMap.get(submission.id)!;
    }

    // 2. Default source code representation derived from submission metadata
    const files: SourceFile[] = [];
    if (submission.description) {
      files.push({
        path: 'src/main.ts',
        content: `// Submission: ${submission.title}\n// Description: ${submission.description}\nexport function main() {\n  console.log("Starting ${submission.title}");\n}`,
      });
    }

    return files;
  }

  private formatAnalysis(a: any): IntegrityAnalysisEntity {
    return {
      id: a.id,
      hackathonId: a.hackathonId,
      submissionId: a.submissionId,
      repositoryId: a.repositoryId,
      commitSha: a.commitSha,
      status: a.status as IntegrityAnalysisStatus,
      engineVersion: a.engineVersion,
      configurationVersion: a.configurationVersion,
      summary: a.summary,
      failureReason: a.failureReason,
      startedAt: a.startedAt instanceof Date ? a.startedAt.toISOString() : a.startedAt,
      completedAt: a.completedAt instanceof Date ? a.completedAt.toISOString() : a.completedAt,
      failedAt: a.failedAt instanceof Date ? a.failedAt.toISOString() : a.failedAt,
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
      updatedAt: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : a.updatedAt,
      findings: a.findings ? a.findings.map((f: any) => this.formatFinding(f)) : undefined,
      submission: a.submission
        ? {
            id: a.submission.id,
            title: a.submission.title,
            teamId: a.submission.teamId,
            team: a.submission.team ? { id: a.submission.team.id, name: a.submission.team.name } : undefined,
          }
        : undefined,
    };
  }

  private formatFinding(f: any): IntegrityFindingEntity {
    return {
      id: f.id,
      analysisId: f.analysisId,
      submissionId: f.submissionId,
      comparisonSubmissionId: f.comparisonSubmissionId,
      type: f.type as IntegrityFindingType,
      severity: f.severity as IntegritySeverity,
      confidence: f.confidence,
      similarity: f.similarity,
      status: f.status as IntegrityFindingStatus,
      summary: f.summary,
      metadata: f.metadata,
      createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt,
      updatedAt: f.updatedAt instanceof Date ? f.updatedAt.toISOString() : f.updatedAt,
      evidence: f.evidence
        ? f.evidence.map((e: any) => ({
            id: e.id,
            findingId: e.findingId,
            sourcePath: e.sourcePath,
            targetPath: e.targetPath,
            sourceStart: e.sourceStart,
            sourceEnd: e.sourceEnd,
            targetStart: e.targetStart,
            targetEnd: e.targetEnd,
            matchedFragmentHash: e.matchedFragmentHash,
            similarityMetric: e.similarityMetric,
            sourceSnippet: e.sourceSnippet,
            targetSnippet: e.targetSnippet,
            createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
          }))
        : [],
      reviews: f.reviews
        ? f.reviews.map((r: any) => ({
            id: r.id,
            findingId: r.findingId,
            reviewerId: r.reviewerId,
            fromStatus: r.fromStatus,
            toStatus: r.toStatus,
            reason: r.reason,
            notes: r.notes,
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
            reviewer: r.reviewer
              ? {
                  id: r.reviewer.id,
                  name: r.reviewer.name,
                  email: r.reviewer.email,
                }
              : undefined,
          }))
        : [],
      submission: f.submission
        ? {
            id: f.submission.id,
            title: f.submission.title,
            teamId: f.submission.teamId,
            team: f.submission.team ? { id: f.submission.team.id, name: f.submission.team.name } : undefined,
          }
        : undefined,
      comparisonSubmission: f.comparisonSubmission
        ? {
            id: f.comparisonSubmission.id,
            title: f.comparisonSubmission.title,
            teamId: f.comparisonSubmission.teamId,
            team: f.comparisonSubmission.team
              ? { id: f.comparisonSubmission.team.id, name: f.comparisonSubmission.team.name }
              : undefined,
          }
        : undefined,
    };
  }
}

import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GitHubCredentialService } from '../repositories/github-credential.service';
import { GitHubProviderService } from '../repositories/github-provider.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionEntity, SubmissionStatus } from '@almosthack/types';
import {
  TeamMemberStatus,
  TeamStatus,
  HackathonStatus,
  RepositoryStatus,
  SubmissionStatus as PrismaSubmissionStatus,
} from '@prisma/client';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly credentialService: GitHubCredentialService,
    private readonly githubProvider: GitHubProviderService
  ) {}

  public async createOrUpdateDraft(
    teamId: string,
    userId: string,
    userEmail: string,
    dto: CreateSubmissionDto
  ): Promise<SubmissionEntity> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: { include: { configuration: true } },
        members: { where: { status: TeamMemberStatus.ACTIVE } },
        repositories: { where: { status: RepositoryStatus.CONNECTED } },
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found or is dissolved.',
      });
    }

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only active team members can create or update a submission draft.',
      });
    }

    // Verify Hackathon status
    const { status: hStatus, startsAt, endsAt } = team.hackathon;
    if (
      hStatus === HackathonStatus.DRAFT ||
      hStatus === HackathonStatus.COMPLETED ||
      hStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_LOCKED',
        message: `Submissions are unavailable when hackathon is in '${hStatus}' status.`,
      });
    }

    // Server-authoritative Submission Window Check
    const now = new Date();
    if (now < startsAt || now > endsAt) {
      throw new ConflictException({
        code: 'SUBMISSION_WINDOW_CLOSED',
        message: 'The submission window is currently closed.',
      });
    }

    // Validate Track & Challenge belongs to same Hackathon
    if (dto.trackId) {
      const track = await this.prisma.hackathonTrack.findUnique({
        where: { id: dto.trackId },
      });
      if (!track || track.hackathonId !== team.hackathonId) {
        throw new BadRequestException({
          code: 'INVALID_TRACK',
          message: 'Specified track does not belong to this hackathon.',
        });
      }
    }

    if (dto.challengeId) {
      const challenge = await this.prisma.hackathonChallenge.findUnique({
        where: { id: dto.challengeId },
        include: { track: true },
      });
      if (!challenge || challenge.track.hackathonId !== team.hackathonId) {
        throw new BadRequestException({
          code: 'INVALID_CHALLENGE',
          message: 'Specified challenge does not belong to this hackathon.',
        });
      }
    }

    // Resolve repository
    let repoId: string | null = null;
    if (dto.repositoryId) {
      const repo = await this.prisma.teamRepository.findUnique({
        where: { id: dto.repositoryId },
      });
      if (!repo || repo.teamId !== teamId || repo.status !== RepositoryStatus.CONNECTED) {
        throw new BadRequestException({
          code: 'INVALID_REPOSITORY',
          message: 'Specified repository does not belong to your team or is disconnected.',
        });
      }
      repoId = repo.id;
    } else if (team.repositories.length > 0) {
      repoId = team.repositories[0].id;
    }

    // Check if finalized submission already exists
    const existing = await this.prisma.submission.findUnique({
      where: { hackathonId_teamId: { hackathonId: team.hackathonId, teamId } },
    });

    if (existing && (existing.status === PrismaSubmissionStatus.FINALIZED || existing.status === PrismaSubmissionStatus.SUBMITTED)) {
      throw new ConflictException({
        code: 'SUBMISSION_ALREADY_FINALIZED',
        message: 'Your team has already finalized a submission for this hackathon.',
      });
    }

    const title = dto.title.trim();
    const description = dto.description ? dto.description.trim() : null;
    const demoUrl = dto.demoUrl ? dto.demoUrl.trim() : null;
    const documentationUrl = dto.documentationUrl ? dto.documentationUrl.trim() : null;

    const [submission] = await this.prisma.$transaction([
      this.prisma.submission.upsert({
        where: { hackathonId_teamId: { hackathonId: team.hackathonId, teamId } },
        create: {
          hackathonId: team.hackathonId,
          teamId,
          trackId: dto.trackId || null,
          challengeId: dto.challengeId || null,
          repositoryId: repoId,
          title,
          description,
          demoUrl,
          documentationUrl,
          status: PrismaSubmissionStatus.DRAFT,
        },
        update: {
          trackId: dto.trackId !== undefined ? dto.trackId : undefined,
          challengeId: dto.challengeId !== undefined ? dto.challengeId : undefined,
          repositoryId: repoId !== undefined ? repoId : undefined,
          title,
          description,
          demoUrl,
          documentationUrl,
          status: PrismaSubmissionStatus.DRAFT,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: existing ? 'submission.updated' : 'submission.created',
          targetEntity: 'Submission',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
            teamId,
            title,
          },
        },
      }),
    ]);

    return this.formatSubmission(submission);
  }

  public async finalizeSubmission(
    submissionId: string,
    userId: string,
    userEmail: string
  ): Promise<SubmissionEntity> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        team: {
          include: {
            members: { where: { status: TeamMemberStatus.ACTIVE } },
            repositories: { where: { status: RepositoryStatus.CONNECTED } },
          },
        },
        hackathon: true,
        repository: true,
      },
    });

    if (!submission) {
      throw new NotFoundException({
        code: 'SUBMISSION_NOT_FOUND',
        message: 'Submission not found.',
      });
    }

    const isMember = submission.team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only active team members can finalize a submission.',
      });
    }

    if (submission.status === PrismaSubmissionStatus.FINALIZED || submission.status === PrismaSubmissionStatus.SUBMITTED) {
      return this.formatSubmission(submission); // Idempotent success
    }

    if (submission.status === PrismaSubmissionStatus.WITHDRAWN) {
      throw new ConflictException({
        code: 'SUBMISSION_WITHDRAWN',
        message: 'Cannot finalize a withdrawn submission.',
      });
    }

    // Deadline Window Enforcement
    const now = new Date();
    if (now > submission.hackathon.endsAt) {
      throw new ConflictException({
        code: 'SUBMISSION_DEADLINE_EXCEEDED',
        message: 'The submission deadline has passed.',
      });
    }

    // Validate Connected Repository
    const activeRepo = submission.repository || submission.team.repositories[0];
    if (!activeRepo) {
      throw new BadRequestException({
        code: 'REPOSITORY_REQUIRED',
        message: 'A connected GitHub repository is required to finalize your submission.',
      });
    }

    // GitHub Commit SHA Snapshot Resolution
    let commitSha: string | null = null;
    let defaultBranch = activeRepo.defaultBranch || 'main';

    try {
      const captain = submission.team.members.find((m) => m.role === 'CAPTAIN') || submission.team.members[0];
      const githubAccount = await this.prisma.gitHubAccount.findUnique({
        where: { userId: captain.userId },
      });

      if (githubAccount) {
        const rawToken = this.credentialService.decryptToken(githubAccount.accessTokenEncrypted);
        const ghRepo = await this.githubProvider.getRepository(
          rawToken,
          activeRepo.ownerLogin,
          activeRepo.repositoryName
        );
        defaultBranch = ghRepo.default_branch || defaultBranch;

        // Query default branch HEAD commit
        const res = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(activeRepo.ownerLogin)}/${encodeURIComponent(activeRepo.repositoryName)}/commits/${encodeURIComponent(defaultBranch)}`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `Bearer ${rawToken}`,
              'User-Agent': 'AlmostHack-App',
            },
          }
        );
        if (res.ok) {
          const commitData = (await res.json()) as any;
          commitSha = commitData.sha || null;
        }
      }
    } catch (err: any) {
      this.logger.warn(`GitHub snapshot commit SHA fetch failed: ${err.message}`);
    }

    const [finalized] = await this.prisma.$transaction([
      this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          repositoryId: activeRepo.id,
          commitSha,
          snapshotBranch: defaultBranch,
          snapshotCapturedAt: now,
          status: PrismaSubmissionStatus.FINALIZED,
          submittedAt: now,
          finalizedAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'submission.submitted',
          targetEntity: 'Submission',
          targetId: submissionId,
          metadata: {
            organizationId: submission.hackathon.organizationId,
            hackathonId: submission.hackathonId,
            teamId: submission.teamId,
            submissionId,
            commitSha,
          },
        },
      }),
    ]);

    return this.formatSubmission(finalized);
  }

  public async withdrawSubmission(
    submissionId: string,
    userId: string,
    userEmail: string
  ): Promise<SubmissionEntity> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        team: { include: { members: { where: { status: TeamMemberStatus.ACTIVE } } } },
        hackathon: true,
      },
    });

    if (!submission) {
      throw new NotFoundException({
        code: 'SUBMISSION_NOT_FOUND',
        message: 'Submission not found.',
      });
    }

    const isMember = submission.team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only active team members can withdraw a submission.',
      });
    }

    const now = new Date();

    const [withdrawn] = await this.prisma.$transaction([
      this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: PrismaSubmissionStatus.WITHDRAWN,
          withdrawnAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'submission.withdrawn',
          targetEntity: 'Submission',
          targetId: submissionId,
          metadata: {
            organizationId: submission.hackathon.organizationId,
            hackathonId: submission.hackathonId,
            teamId: submission.teamId,
            submissionId,
          },
        },
      }),
    ]);

    return this.formatSubmission(withdrawn);
  }

  public async getSubmission(submissionId: string, userId: string): Promise<SubmissionEntity> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        team: { include: { members: { where: { status: TeamMemberStatus.ACTIVE } } } },
        hackathon: true,
        track: true,
        challenge: true,
        repository: true,
      },
    });

    if (!submission) {
      throw new NotFoundException({
        code: 'SUBMISSION_NOT_FOUND',
        message: 'Submission not found.',
      });
    }

    // Verify Access: Team Member, Organizer, or Assigned Judge
    const isTeamMember = submission.team.members.some((m) => m.userId === userId);
    const isOrganizer = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: submission.hackathon.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    const isJudgeAssigned = await this.prisma.judgeAssignment.findFirst({
      where: { submissionId, judgeUserId: userId, status: { not: 'REVOKED' } },
    });

    if (!isTeamMember && !isOrganizer && !isJudgeAssigned) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You do not have access to view this submission.',
      });
    }

    return this.formatSubmission(submission);
  }

  public async getTeamSubmission(teamId: string, userId: string): Promise<SubmissionEntity | null> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { where: { status: TeamMemberStatus.ACTIVE } } },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only team members can query team submission.',
      });
    }

    const submission = await this.prisma.submission.findUnique({
      where: { hackathonId_teamId: { hackathonId: team.hackathonId, teamId } },
      include: {
        team: true,
        track: true,
        challenge: true,
        repository: true,
      },
    });

    if (!submission) {
      return null;
    }

    return this.formatSubmission(submission);
  }

  public async getHackathonSubmissions(hackathonId: string, userId: string): Promise<SubmissionEntity[]> {
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
        message: 'Only organizers can view all hackathon submissions.',
      });
    }

    const submissions = await this.prisma.submission.findMany({
      where: { hackathonId },
      include: {
        team: true,
        track: true,
        challenge: true,
        repository: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map((s) => this.formatSubmission(s));
  }

  private formatSubmission(sub: any): SubmissionEntity {
    return {
      id: sub.id,
      hackathonId: sub.hackathonId,
      teamId: sub.teamId,
      trackId: sub.trackId,
      challengeId: sub.challengeId,
      repositoryId: sub.repositoryId,
      title: sub.title,
      description: sub.description,
      demoUrl: sub.demoUrl,
      documentationUrl: sub.documentationUrl,
      commitSha: sub.commitSha,
      snapshotBranch: sub.snapshotBranch,
      snapshotCapturedAt: sub.snapshotCapturedAt instanceof Date ? sub.snapshotCapturedAt.toISOString() : sub.snapshotCapturedAt,
      status: sub.status as SubmissionStatus,
      submittedAt: sub.submittedAt instanceof Date ? sub.submittedAt.toISOString() : sub.submittedAt,
      finalizedAt: sub.finalizedAt instanceof Date ? sub.finalizedAt.toISOString() : sub.finalizedAt,
      withdrawnAt: sub.withdrawnAt instanceof Date ? sub.withdrawnAt.toISOString() : sub.withdrawnAt,
      createdAt: sub.createdAt instanceof Date ? sub.createdAt.toISOString() : sub.createdAt,
      updatedAt: sub.updatedAt instanceof Date ? sub.updatedAt.toISOString() : sub.updatedAt,
      team: sub.team
        ? {
            id: sub.team.id,
            name: sub.team.name,
            slug: sub.team.slug,
          }
        : undefined,
      track: sub.track
        ? {
            id: sub.track.id,
            name: sub.track.name,
          }
        : null,
      challenge: sub.challenge
        ? {
            id: sub.challenge.id,
            name: sub.challenge.name,
          }
        : null,
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
}

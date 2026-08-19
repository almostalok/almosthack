import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GitHubCredentialService } from './github-credential.service';
import { GitHubProviderService } from './github-provider.service';
import { ConnectRepositoryDto } from './dto/connect-repository.dto';
import { ProvisionRepositoryDto } from './dto/provision-repository.dto';
import {
  GitHubConnectionStatus,
  TeamRepositoryEntity,
} from '@almosthack/types';
import {
  TeamMemberRole,
  TeamMemberStatus,
  TeamStatus,
  HackathonStatus,
  RepositoryStatus,
} from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class RepositoriesService {
  private readonly logger = new Logger(RepositoriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly credentialService: GitHubCredentialService,
    private readonly githubProvider: GitHubProviderService
  ) {}

  public async startOAuthFlow(
    userId: string,
    teamId?: string,
    redirectUri?: string
  ): Promise<{ url: string; state: string }> {
    const rawState = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.oAuthState.create({
      data: {
        state: rawState,
        userId,
        teamId: teamId || null,
        redirectUri: redirectUri || null,
        expiresAt,
      },
    });

    const url = this.githubProvider.getOAuthAuthorizationUrl(rawState, redirectUri);
    return { url, state: rawState };
  }

  public async handleOAuthCallback(
    code: string,
    state: string,
    currentUserId: string,
    userEmail: string
  ): Promise<{ success: true; githubUsername: string; teamId: string | null }> {
    if (!state || !code) {
      throw new BadRequestException({
        code: 'MISSING_OAUTH_PARAMS',
        message: 'State and code parameters are required.',
      });
    }

    const oauthState = await this.prisma.oAuthState.findUnique({
      where: { state },
    });

    const now = new Date();

    if (!oauthState) {
      throw new BadRequestException({
        code: 'INVALID_OAUTH_STATE',
        message: 'Invalid or unknown OAuth state parameter.',
      });
    }

    if (oauthState.consumedAt !== null) {
      throw new BadRequestException({
        code: 'OAUTH_STATE_REUSED',
        message: 'This OAuth state has already been used. Please restart GitHub connection.',
      });
    }

    if (oauthState.expiresAt <= now) {
      throw new BadRequestException({
        code: 'OAUTH_STATE_EXPIRED',
        message: 'OAuth state has expired. Please restart GitHub connection.',
      });
    }

    if (oauthState.userId !== currentUserId) {
      throw new ForbiddenException({
        code: 'OAUTH_SESSION_MISMATCH',
        message: 'OAuth state belongs to a different user session.',
      });
    }

    // Mark OAuth state as consumed immediately
    await this.prisma.oAuthState.update({
      where: { id: oauthState.id },
      data: { consumedAt: now },
    });

    // Exchange code for token
    const tokenResult = await this.githubProvider.exchangeCodeForToken(code, oauthState.redirectUri || undefined);
    const githubUser = await this.githubProvider.getAuthenticatedUser(tokenResult.accessToken);

    const githubUserIdStr = String(githubUser.id);

    // Check if this GitHub account is already linked to ANOTHER user
    const existingAccount = await this.prisma.gitHubAccount.findUnique({
      where: { githubUserId: githubUserIdStr },
    });

    if (existingAccount && existingAccount.userId !== currentUserId) {
      throw new ConflictException({
        code: 'GITHUB_ACCOUNT_ALREADY_LINKED',
        message: `GitHub account @${githubUser.login} is already linked to another AlmostHack user.`,
      });
    }

    const encryptedToken = this.credentialService.encryptToken(tokenResult.accessToken);
    const scopes = tokenResult.scope ? tokenResult.scope.split(',').map((s) => s.trim()) : [];

    // Persist GitHub account & user profile update in transaction
    await this.prisma.$transaction([
      this.prisma.gitHubAccount.upsert({
        where: { userId: currentUserId },
        create: {
          userId: currentUserId,
          githubUserId: githubUserIdStr,
          githubUsername: githubUser.login,
          githubAvatarUrl: githubUser.avatar_url ?? null,
          accessTokenEncrypted: encryptedToken,
          scopes,
          connectedAt: now,
          revokedAt: null,
        },
        update: {
          githubUserId: githubUserIdStr,
          githubUsername: githubUser.login,
          githubAvatarUrl: githubUser.avatar_url ?? null,
          accessTokenEncrypted: encryptedToken,
          scopes,
          connectedAt: now,
          revokedAt: null,
        },
      }),
      this.prisma.user.update({
        where: { id: currentUserId },
        data: { githubUsername: githubUser.login },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: currentUserId,
          actorEmail: userEmail,
          action: 'github.account_connected',
          targetEntity: 'GitHubAccount',
          targetId: currentUserId,
          metadata: {
            githubUserId: githubUserIdStr,
            githubUsername: githubUser.login,
          },
        },
      }),
    ]);

    return {
      success: true,
      githubUsername: githubUser.login,
      teamId: oauthState.teamId ?? null,
    };
  }

  public async disconnectGitHubAccount(
    userId: string,
    userEmail: string
  ): Promise<{ success: true }> {
    const account = await this.prisma.gitHubAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException({
        code: 'GITHUB_NOT_CONNECTED',
        message: 'No connected GitHub account found for this user.',
      });
    }

    // Try remote revocation safely
    try {
      const rawToken = this.credentialService.decryptToken(account.accessTokenEncrypted);
      await this.githubProvider.revokeToken(rawToken);
    } catch (err: any) {
      this.logger.warn(`Remote token revocation skipped or failed: ${err.message}`);
    }

    await this.prisma.$transaction([
      this.prisma.gitHubAccount.delete({
        where: { userId },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'github.account_disconnected',
          targetEntity: 'GitHubAccount',
          targetId: userId,
          metadata: {
            githubUsername: account.githubUsername,
          },
        },
      }),
    ]);

    return { success: true };
  }

  public async getGitHubConnectionStatus(userId: string): Promise<GitHubConnectionStatus> {
    const account = await this.prisma.gitHubAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return { isConnected: false };
    }

    return {
      isConnected: true,
      githubUsername: account.githubUsername,
      githubAvatarUrl: account.githubAvatarUrl,
      connectedAt: account.connectedAt.toISOString(),
    };
  }

  public async getTeamRepository(
    teamId: string,
    _userId: string
  ): Promise<TeamRepositoryEntity | null> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { where: { status: TeamMemberStatus.ACTIVE } },
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    const repo = await this.prisma.teamRepository.findFirst({
      where: { teamId, status: RepositoryStatus.CONNECTED },
    });

    if (!repo) {
      return null;
    }

    return this.formatTeamRepository(repo);
  }

  public async provisionTeamRepository(
    teamId: string,
    userId: string,
    userEmail: string,
    dto?: ProvisionRepositoryDto
  ): Promise<TeamRepositoryEntity> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: { include: { configuration: true } },
        members: { where: { status: TeamMemberStatus.ACTIVE } },
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    // Check Hackathon status allows repo operations
    const { status: hStatus } = team.hackathon;
    if (
      hStatus === HackathonStatus.DRAFT ||
      hStatus === HackathonStatus.COMPLETED ||
      hStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_LOCKED',
        message: `Repository provisioning is unavailable when hackathon is in '${hStatus}' status.`,
      });
    }

    // Verify Captain authorization
    const isCaptain = team.members.some(
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN
    );

    if (!isCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the team captain can provision a team repository.',
      });
    }

    // Check Captain has linked GitHub account
    const githubAccount = await this.prisma.gitHubAccount.findUnique({
      where: { userId },
    });

    if (!githubAccount) {
      throw new ForbiddenException({
        code: 'GITHUB_NOT_CONNECTED',
        message: 'You must connect your GitHub account before provisioning a repository.',
      });
    }

    // Check existing active repo (Idempotency check)
    const existingRepo = await this.prisma.teamRepository.findFirst({
      where: { teamId, provider: 'GITHUB', status: RepositoryStatus.CONNECTED },
    });

    if (existingRepo) {
      return this.formatTeamRepository(existingRepo);
    }

    const rawToken = this.credentialService.decryptToken(githubAccount.accessTokenEncrypted);
    const repoName = dto?.name
      ? dto.name.trim()
      : this.generateCanonicalRepoName(team.hackathon.slug, team.slug);

    let ghRepo: any = null;

    try {
      ghRepo = await this.githubProvider.createRepository(rawToken, {
        name: repoName,
        isPrivate: dto?.isPrivate ?? false,
      });
    } catch (err: any) {
      // Handle case where repo was already created on GitHub previously (Idempotency reconciliation)
      if (err instanceof ConflictException) {
        try {
          ghRepo = await this.githubProvider.getRepository(
            rawToken,
            githubAccount.githubUsername,
            repoName
          );
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const now = new Date();

    const [savedRepo] = await this.prisma.$transaction([
      this.prisma.teamRepository.create({
        data: {
          teamId,
          provider: 'GITHUB',
          providerRepositoryId: String(ghRepo.id),
          ownerLogin: ghRepo.owner.login,
          repositoryName: ghRepo.name,
          repositoryFullName: ghRepo.full_name,
          repositoryUrl: ghRepo.html_url,
          defaultBranch: ghRepo.default_branch || 'main',
          isPrivate: ghRepo.private,
          status: RepositoryStatus.CONNECTED,
          connectedAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.repository_created',
          targetEntity: 'TeamRepository',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
            teamId,
            providerRepositoryId: String(ghRepo.id),
            repositoryFullName: ghRepo.full_name,
          },
        },
      }),
    ]);

    return this.formatTeamRepository(savedRepo);
  }

  public async connectExistingRepository(
    teamId: string,
    userId: string,
    userEmail: string,
    dto: ConnectRepositoryDto
  ): Promise<TeamRepositoryEntity> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: true,
        members: { where: { status: TeamMemberStatus.ACTIVE } },
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    const isCaptain = team.members.some(
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN
    );

    if (!isCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the team captain can connect a repository.',
      });
    }

    const githubAccount = await this.prisma.gitHubAccount.findUnique({
      where: { userId },
    });

    if (!githubAccount) {
      throw new ForbiddenException({
        code: 'GITHUB_NOT_CONNECTED',
        message: 'You must connect your GitHub account before connecting a repository.',
      });
    }

    // Check existing active repo for this team
    const existingRepo = await this.prisma.teamRepository.findFirst({
      where: { teamId, provider: 'GITHUB', status: RepositoryStatus.CONNECTED },
    });

    if (existingRepo) {
      throw new ConflictException({
        code: 'TEAM_REPOSITORY_ALREADY_EXISTS',
        message: 'Team already has an active connected repository. Disconnect existing repository first.',
      });
    }

    const rawToken = this.credentialService.decryptToken(githubAccount.accessTokenEncrypted);

    // Verify actual access and existence on GitHub
    const ghRepo = await this.githubProvider.verifyRepositoryAccess(
      rawToken,
      dto.owner.trim(),
      dto.repo.trim()
    );

    const providerRepoIdStr = String(ghRepo.id);

    // Verify repo is not connected to another team
    const otherTeamRepo = await this.prisma.teamRepository.findFirst({
      where: {
        providerRepositoryId: providerRepoIdStr,
        status: RepositoryStatus.CONNECTED,
      },
    });

    if (otherTeamRepo) {
      throw new ConflictException({
        code: 'REPOSITORY_ALREADY_LINKED',
        message: `Repository '${ghRepo.full_name}' is already connected to another team.`,
      });
    }

    const now = new Date();

    const [savedRepo] = await this.prisma.$transaction([
      this.prisma.teamRepository.create({
        data: {
          teamId,
          provider: 'GITHUB',
          providerRepositoryId: providerRepoIdStr,
          ownerLogin: ghRepo.owner.login,
          repositoryName: ghRepo.name,
          repositoryFullName: ghRepo.full_name,
          repositoryUrl: ghRepo.html_url,
          defaultBranch: ghRepo.default_branch || 'main',
          isPrivate: ghRepo.private,
          status: RepositoryStatus.CONNECTED,
          connectedAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.repository_connected',
          targetEntity: 'TeamRepository',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
            teamId,
            providerRepositoryId: providerRepoIdStr,
            repositoryFullName: ghRepo.full_name,
          },
        },
      }),
    ]);

    return this.formatTeamRepository(savedRepo);
  }

  public async disconnectTeamRepository(
    teamId: string,
    userId: string,
    userEmail: string
  ): Promise<{ success: true }> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: true,
        members: { where: { status: TeamMemberStatus.ACTIVE } },
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    const isCaptain = team.members.some(
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN
    );

    if (!isCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the team captain can disconnect the team repository.',
      });
    }

    const repo = await this.prisma.teamRepository.findFirst({
      where: { teamId, status: RepositoryStatus.CONNECTED },
    });

    if (!repo) {
      throw new NotFoundException({
        code: 'REPOSITORY_NOT_FOUND',
        message: 'No active repository connection found for this team.',
      });
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.teamRepository.update({
        where: { id: repo.id },
        data: {
          status: RepositoryStatus.DISCONNECTED,
          disconnectedAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.repository_disconnected',
          targetEntity: 'TeamRepository',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
            teamId,
            repositoryFullName: repo.repositoryFullName,
          },
        },
      }),
    ]);

    return { success: true };
  }

  private generateCanonicalRepoName(hackathonSlug: string, teamSlug: string): string {
    const raw = `almosthack-${hackathonSlug}-${teamSlug}`.toLowerCase();
    const sanitized = raw.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return sanitized.substring(0, 100);
  }

  private formatTeamRepository(repo: any): TeamRepositoryEntity {
    return {
      id: repo.id,
      teamId: repo.teamId,
      provider: repo.provider,
      providerRepositoryId: repo.providerRepositoryId,
      ownerLogin: repo.ownerLogin,
      repositoryName: repo.repositoryName,
      repositoryFullName: repo.repositoryFullName,
      repositoryUrl: repo.repositoryUrl,
      defaultBranch: repo.defaultBranch,
      isPrivate: repo.isPrivate,
      status: repo.status as RepositoryStatus,
      connectedAt: repo.connectedAt instanceof Date ? repo.connectedAt.toISOString() : repo.connectedAt,
      createdAt: repo.createdAt instanceof Date ? repo.createdAt.toISOString() : repo.createdAt,
      updatedAt: repo.updatedAt instanceof Date ? repo.updatedAt.toISOString() : repo.updatedAt,
      disconnectedAt: repo.disconnectedAt
        ? repo.disconnectedAt instanceof Date
          ? repo.disconnectedAt.toISOString()
          : repo.disconnectedAt
        : null,
    };
  }
}

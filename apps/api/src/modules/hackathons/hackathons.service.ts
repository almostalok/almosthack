import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  Permission,
  ScopeType,
  RoleName,
  HackathonStatus,
  RegistrationStatus,
  HackathonVisibility,
  ParticipationMode,
  EligibilityType,
  AIUsagePolicy,
  PreExistingCodePolicy,
  OpenSourcePolicy,
  RepositoryPolicy,
  HackathonConfigurationEntity,
  HackathonRulesResponse,
  ChallengeStatus,
  HackathonTrackEntity,
  HackathonChallengeEntity,
  ParticipantRegistrationStatus,
  ParticipantRegistrationEntity,
  EligibilityCheckResult,
  TeamStatus,
  TeamMemberRole,
  TeamMemberStatus,
  TeamInvitationStatus,
  TeamEntity,
  TeamInvitationEntity,
} from '@almosthack/types';
import { isValidIanaTimezone, normalizeStringArray } from '@almosthack/validation';
import { PrismaService } from '../../database/prisma.service';
import { AuthorizationService } from '../auth/authorization.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import {
  UpdateHackathonConfigurationDto,
  UpdateHackathonRulesDto,
} from './dto/hackathon-configuration.dto';
import {
  CreateTrackDto,
  UpdateTrackDto,
  ReorderTracksDto,
} from './dto/track.dto';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  ReorderChallengesDto,
} from './dto/challenge.dto';
import {
  CreateParticipantRegistrationDto,
  UpdateParticipantRegistrationDto,
} from './dto/registration.dto';
import {
  CreateTeamDto,
  UpdateTeamDto,
  InviteTeamMemberDto,
  TransferCaptaincyDto,
} from './dto/team.dto';
import {
  HackathonResponseDto,
  HackathonLifecycleResponseDto,
} from './dto/hackathon-response.dto';

@Injectable()
export class HackathonsService {
  private readonly logger = new Logger(HackathonsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: AuthorizationService
  ) {}

  /**
   * Helper: Normalizes input slug or creates slug from hackathon name.
   */
  public generateSlug(name: string, inputSlug?: string): string {
    const raw = inputSlug || name;
    return raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Helper: Derive effective macro Hackathon status based on stored status & current server time.
   */
  public deriveEffectiveStatus(
    status: HackathonStatus,
    startsAt: Date,
    endsAt: Date,
    now: Date = new Date()
  ): HackathonStatus {
    if (status === HackathonStatus.DRAFT) return HackathonStatus.DRAFT;
    if (status === HackathonStatus.ARCHIVED) return HackathonStatus.ARCHIVED;

    const nowTime = now.getTime();
    const startTime = startsAt.getTime();
    const endTime = endsAt.getTime();

    if (nowTime < startTime) return HackathonStatus.PUBLISHED;
    if (nowTime >= startTime && nowTime < endTime) return HackathonStatus.LIVE;
    return HackathonStatus.COMPLETED;
  }

  /**
   * Helper: Derive registration status based on registration window & current server time.
   */
  public deriveRegistrationStatus(
    regStartsAt: Date,
    regEndsAt: Date,
    now: Date = new Date()
  ): RegistrationStatus {
    const nowTime = now.getTime();
    const start = regStartsAt.getTime();
    const end = regEndsAt.getTime();

    if (nowTime < start) return RegistrationStatus.NOT_OPEN;
    if (nowTime >= start && nowTime < end) return RegistrationStatus.OPEN;
    return RegistrationStatus.CLOSED;
  }

  /**
   * Helper: Enforces chronological date ordering invariants.
   */
  public validateDateInvariants(
    regStarts: Date,
    regEnds: Date,
    starts: Date,
    ends: Date
  ): void {
    if (regStarts.getTime() >= regEnds.getTime()) {
      throw new BadRequestException({
        code: 'INVALID_HACKATHON_SCHEDULE',
        message: 'registrationStartsAt must be strictly before registrationEndsAt',
      });
    }
    if (regEnds.getTime() > starts.getTime()) {
      throw new BadRequestException({
        code: 'INVALID_HACKATHON_SCHEDULE',
        message: 'registrationEndsAt must be on or before startsAt',
      });
    }
    if (starts.getTime() >= ends.getTime()) {
      throw new BadRequestException({
        code: 'INVALID_HACKATHON_SCHEDULE',
        message: 'startsAt must be strictly before endsAt',
      });
    }
  }

  /**
   * Helper: Safely maps database Hackathon record to public response DTO.
   */
  public mapToResponse(hackathon: any, now: Date = new Date()): HackathonResponseDto {
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      new Date(hackathon.startsAt),
      new Date(hackathon.endsAt),
      now
    );

    const completedAt = hackathon.completedAt
      ? new Date(hackathon.completedAt).toISOString()
      : effectiveStatus === HackathonStatus.COMPLETED
      ? new Date(hackathon.endsAt).toISOString()
      : null;

    return {
      id: hackathon.id,
      organizationId: hackathon.organizationId,
      name: hackathon.name,
      slug: hackathon.slug,
      description: hackathon.description ?? null,
      logoUrl: hackathon.logoUrl ?? null,
      websiteUrl: hackathon.websiteUrl ?? null,
      timezone: hackathon.timezone,
      status: effectiveStatus,
      visibility: hackathon.visibility as HackathonVisibility,
      registrationStartsAt: new Date(hackathon.registrationStartsAt).toISOString(),
      registrationEndsAt: new Date(hackathon.registrationEndsAt).toISOString(),
      startsAt: new Date(hackathon.startsAt).toISOString(),
      endsAt: new Date(hackathon.endsAt).toISOString(),
      publishedAt: hackathon.publishedAt ? new Date(hackathon.publishedAt).toISOString() : null,
      completedAt,
      archivedAt: hackathon.archivedAt ? new Date(hackathon.archivedAt).toISOString() : null,
      createdAt: new Date(hackathon.createdAt).toISOString(),
      updatedAt: new Date(hackathon.updatedAt).toISOString(),
    };
  }

  /**
   * Helper: Checks organization membership & permission server-side.
   */
  private async checkOrganizationPermission(
    userId: string,
    userRoles: RoleName[],
    organizationId: string,
    permission: any
  ): Promise<void> {
    const hasPermission = await this.authorizationService.canAsync(
      { id: userId, roles: userRoles },
      permission,
      { type: ScopeType.ORGANIZATION, id: organizationId }
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: `User lacks required organization permission: ${permission}`,
      });
    }
  }

  /**
   * Helper: Writes audit log.
   */
  private async createAuditLog(
    actorId: string,
    actorEmail: string,
    action: string,
    targetId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId,
          actorEmail,
          action,
          targetEntity: 'Hackathon',
          targetId,
          metadata,
        },
      });
    } catch (err: any) {
      this.logger.error(`Failed to record audit log: ${err?.message}`);
    }
  }

  /**
   * Create Hackathon
   */
  public async createHackathon(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    organizationId: string,
    dto: CreateHackathonDto
  ): Promise<HackathonResponseDto> {
    // 1. Verify organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new NotFoundException({
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Target organization does not exist',
      });
    }

    // 2. Check authorization
    await this.checkOrganizationPermission(
      userId,
      userRoles,
      organizationId,
      Permission.HACKATHON_CREATE
    );

    // 3. Timezone validation
    const timezone = dto.timezone || 'UTC';
    if (!isValidIanaTimezone(timezone)) {
      throw new BadRequestException({
        code: 'INVALID_TIMEZONE',
        message: `Invalid IANA timezone identifier: ${timezone}`,
      });
    }

    // 4. Date validation
    const regStartsAt = new Date(dto.registrationStartsAt);
    const regEndsAt = new Date(dto.registrationEndsAt);
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    this.validateDateInvariants(regStartsAt, regEndsAt, startsAt, endsAt);

    // 5. Slug processing & uniqueness per organization
    const slug = this.generateSlug(dto.name, dto.slug);
    const existing = await this.prisma.hackathon.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug,
        },
      },
    });
    if (existing) {
      throw new ConflictException({
        code: 'HACKATHON_SLUG_CONFLICT',
        message: `Hackathon with slug '${slug}' already exists in this organization`,
      });
    }

    // 6. Persistence (with default configuration auto-created)
    const hackathon = await this.prisma.hackathon.create({
      data: {
        organizationId,
        name: dto.name,
        slug,
        description: dto.description || null,
        logoUrl: dto.logoUrl || null,
        websiteUrl: dto.websiteUrl || null,
        timezone,
        status: HackathonStatus.DRAFT,
        visibility: HackathonVisibility.PRIVATE,
        registrationStartsAt: regStartsAt,
        registrationEndsAt: regEndsAt,
        startsAt,
        endsAt,
        configuration: {
          create: {},
        },
      },
    });

    // 7. Audit log
    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.created',
      hackathon.id,
      { organizationId, name: hackathon.name, slug }
    );

    return this.mapToResponse(hackathon);
  }

  /**
   * List Organization Hackathons
   */
  public async getOrganizationHackathons(
    userId: string,
    userRoles: RoleName[],
    organizationId: string
  ): Promise<HackathonResponseDto[]> {
    // Check organization authorization
    await this.checkOrganizationPermission(
      userId,
      userRoles,
      organizationId,
      Permission.HACKATHON_READ
    );

    const hackathons = await this.prisma.hackathon.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return hackathons.map((h) => this.mapToResponse(h));
  }

  /**
   * Get Single Hackathon by ID
   */
  public async getHackathon(
    userId: string,
    userRoles: RoleName[],
    hackathonId: string
  ): Promise<HackathonResponseDto> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found',
      });
    }

    // Check access: PUBLIC non-DRAFT hackathons readable by anyone; PRIVATE or DRAFT require org membership
    const isPublicRead =
      hackathon.visibility === HackathonVisibility.PUBLIC &&
      hackathon.status !== HackathonStatus.DRAFT;

    if (!isPublicRead) {
      await this.checkOrganizationPermission(
        userId,
        userRoles,
        hackathon.organizationId,
        Permission.HACKATHON_READ
      );
    }

    return this.mapToResponse(hackathon);
  }

  /**
   * Get Hackathon Effective Lifecycle Status
   */
  public async getLifecycle(
    userId: string,
    userRoles: RoleName[],
    hackathonId: string
  ): Promise<HackathonLifecycleResponseDto> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found',
      });
    }

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_READ
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    const registrationStatus = this.deriveRegistrationStatus(
      hackathon.registrationStartsAt,
      hackathon.registrationEndsAt,
      now
    );

    return {
      hackathonId: hackathon.id,
      hackathonStatus: effectiveStatus,
      registrationStatus,
      now: now.toISOString(),
      timezone: hackathon.timezone,
      publishedAt: hackathon.publishedAt ? new Date(hackathon.publishedAt).toISOString() : null,
      completedAt: hackathon.completedAt ? new Date(hackathon.completedAt).toISOString() : null,
      archivedAt: hackathon.archivedAt ? new Date(hackathon.archivedAt).toISOString() : null,
    };
  }

  /**
   * Update Hackathon
   */
  public async updateHackathon(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    hackathonId: string,
    dto: UpdateHackathonDto
  ): Promise<HackathonResponseDto> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found',
      });
    }

    // Check organization update authorization
    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    // Editability rules based on lifecycle state
    if (effectiveStatus === HackathonStatus.ARCHIVED || effectiveStatus === HackathonStatus.COMPLETED) {
      throw new ConflictException({
        code: 'INVALID_LIFECYCLE_TRANSITION',
        message: `Hackathon is in '${effectiveStatus}' state and cannot be modified.`,
      });
    }

    if (effectiveStatus === HackathonStatus.LIVE) {
      // LIVE state restricts schedule modifications
      if (
        dto.startsAt !== undefined ||
        dto.endsAt !== undefined ||
        dto.registrationStartsAt !== undefined ||
        dto.registrationEndsAt !== undefined
      ) {
        throw new BadRequestException({
          code: 'INVALID_LIFECYCLE_MUTATION',
          message: 'Cannot modify schedule fields after hackathon event has gone LIVE.',
        });
      }
    }

    // Merge dates & validate invariants
    const mergedRegStarts = dto.registrationStartsAt
      ? new Date(dto.registrationStartsAt)
      : hackathon.registrationStartsAt;
    const mergedRegEnds = dto.registrationEndsAt
      ? new Date(dto.registrationEndsAt)
      : hackathon.registrationEndsAt;
    const mergedStarts = dto.startsAt ? new Date(dto.startsAt) : hackathon.startsAt;
    const mergedEnds = dto.endsAt ? new Date(dto.endsAt) : hackathon.endsAt;

    this.validateDateInvariants(mergedRegStarts, mergedRegEnds, mergedStarts, mergedEnds);

    // Timezone validation if provided
    if (dto.timezone && !isValidIanaTimezone(dto.timezone)) {
      throw new BadRequestException({
        code: 'INVALID_TIMEZONE',
        message: `Invalid IANA timezone identifier: ${dto.timezone}`,
      });
    }

    // Slug check if modified
    let newSlug = hackathon.slug;
    if (dto.slug || dto.name) {
      const candidateSlug = this.generateSlug(
        dto.name || hackathon.name,
        dto.slug || (dto.name ? undefined : hackathon.slug)
      );
      if (candidateSlug !== hackathon.slug) {
        const existingSlug = await this.prisma.hackathon.findUnique({
          where: {
            organizationId_slug: {
              organizationId: hackathon.organizationId,
              slug: candidateSlug,
            },
          },
        });
        if (existingSlug && existingSlug.id !== hackathon.id) {
          throw new ConflictException({
            code: 'HACKATHON_SLUG_CONFLICT',
            message: `Slug '${candidateSlug}' is already in use within this organization`,
          });
        }
        newSlug = candidateSlug;
      }
    }

    const updated = await this.prisma.hackathon.update({
      where: { id: hackathonId },
      data: {
        name: dto.name !== undefined ? dto.name : hackathon.name,
        slug: newSlug,
        description: dto.description !== undefined ? dto.description : hackathon.description,
        logoUrl: dto.logoUrl !== undefined ? dto.logoUrl : hackathon.logoUrl,
        websiteUrl: dto.websiteUrl !== undefined ? dto.websiteUrl : hackathon.websiteUrl,
        timezone: dto.timezone !== undefined ? dto.timezone : hackathon.timezone,
        registrationStartsAt: mergedRegStarts,
        registrationEndsAt: mergedRegEnds,
        startsAt: mergedStarts,
        endsAt: mergedEnds,
      },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.updated',
      hackathonId,
      { organizationId: hackathon.organizationId, updatedFields: Object.keys(dto) }
    );

    return this.mapToResponse(updated);
  }

  /**
   * Publish Hackathon
   */
  public async publishHackathon(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    hackathonId: string
  ): Promise<HackathonResponseDto> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found',
      });
    }

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_PUBLISH
    );

    if (hackathon.status !== HackathonStatus.DRAFT) {
      throw new ConflictException({
        code: 'INVALID_LIFECYCLE_TRANSITION',
        message: `Only DRAFT hackathons can be published. Current status: ${hackathon.status}`,
      });
    }

    // Validate date invariants
    this.validateDateInvariants(
      hackathon.registrationStartsAt,
      hackathon.registrationEndsAt,
      hackathon.startsAt,
      hackathon.endsAt
    );

    // Conditional transaction update
    const updated = await this.prisma.hackathon.update({
      where: { id: hackathonId },
      data: {
        status: HackathonStatus.PUBLISHED,
        visibility: HackathonVisibility.PUBLIC,
        publishedAt: new Date(),
      },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.published',
      hackathonId,
      { organizationId: hackathon.organizationId, slug: hackathon.slug }
    );

    return this.mapToResponse(updated);
  }

  /**
   * Archive Hackathon
   */
  public async archiveHackathon(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    hackathonId: string
  ): Promise<HackathonResponseDto> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found',
      });
    }

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_ARCHIVE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    if (effectiveStatus !== HackathonStatus.COMPLETED && hackathon.status !== HackathonStatus.COMPLETED) {
      throw new ConflictException({
        code: 'INVALID_LIFECYCLE_TRANSITION',
        message: `Only COMPLETED hackathons can be archived. Current effective status: ${effectiveStatus}`,
      });
    }

    const updated = await this.prisma.hackathon.update({
      where: { id: hackathonId },
      data: {
        status: HackathonStatus.ARCHIVED,
        completedAt: hackathon.completedAt || now,
        archivedAt: now,
      },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.archived',
      hackathonId,
      { organizationId: hackathon.organizationId, slug: hackathon.slug }
    );

    return this.mapToResponse(updated);
  }

  /**
   * Helper: Guarantees a HackathonConfiguration record exists (auto-creates default if missing).
   */
  public async ensureConfigurationExists(hackathonId: string) {
    let config = await this.prisma.hackathonConfiguration.findUnique({
      where: { hackathonId },
    });
    if (!config) {
      config = await this.prisma.hackathonConfiguration.create({
        data: { hackathonId },
      });
    }
    return config;
  }

  /**
   * Helper: Map Prisma HackathonConfiguration to HackathonConfigurationEntity DTO.
   */
  public mapToConfigurationResponse(config: any): HackathonConfigurationEntity {
    return {
      id: config.id,
      hackathonId: config.hackathonId,
      participationMode: config.participationMode as ParticipationMode,
      minTeamSize: config.minTeamSize ?? null,
      maxTeamSize: config.maxTeamSize ?? null,
      eligibilityType: config.eligibilityType as EligibilityType,
      allowedBranches: config.allowedBranches || [],
      allowedColleges: config.allowedColleges || [],
      graduationYearFrom: config.graduationYearFrom ?? null,
      graduationYearTo: config.graduationYearTo ?? null,
      aiUsagePolicy: config.aiUsagePolicy as AIUsagePolicy,
      aiDisclosureRequired: Boolean(config.aiDisclosureRequired),
      preExistingCodePolicy: config.preExistingCodePolicy as PreExistingCodePolicy,
      openSourcePolicy: config.openSourcePolicy as OpenSourcePolicy,
      githubRequired: Boolean(config.githubRequired),
      repositoryPolicy: config.repositoryPolicy as RepositoryPolicy,
      rulesMarkdown: config.rulesMarkdown ?? null,
      createdAt: new Date(config.createdAt).toISOString(),
      updatedAt: new Date(config.updatedAt).toISOString(),
    };
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/configuration
   */
  public async getHackathonConfiguration(
    userId: string,
    userRoles: RoleName[],
    hackathonId: string
  ): Promise<HackathonConfigurationEntity> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found',
      });
    }

    const isPublicRead =
      hackathon.visibility === HackathonVisibility.PUBLIC &&
      hackathon.status !== HackathonStatus.DRAFT;

    if (!isPublicRead) {
      await this.checkOrganizationPermission(
        userId,
        userRoles,
        hackathon.organizationId,
        Permission.HACKATHON_READ
      );
    }

    const config = await this.ensureConfigurationExists(hackathonId);
    return this.mapToConfigurationResponse(config);
  }

  /**
   * PUT /api/v1/hackathons/:hackathonId/configuration
   */
  public async updateHackathonConfiguration(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    hackathonId: string,
    dto: UpdateHackathonConfigurationDto
  ): Promise<HackathonConfigurationEntity> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found',
      });
    }

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    // Core policy immutability checks
    if (
      effectiveStatus === HackathonStatus.LIVE ||
      effectiveStatus === HackathonStatus.COMPLETED ||
      effectiveStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_CONFIGURATION_LOCKED',
        message: `Core hackathon configuration is locked in '${effectiveStatus}' state and cannot be modified.`,
      });
    }

    const existingConfig = await this.ensureConfigurationExists(hackathonId);

    // Participation & Team Size Validation
    const targetMode = dto.participationMode !== undefined ? dto.participationMode : existingConfig.participationMode;
    let minTeamSize: number | null = dto.minTeamSize !== undefined ? dto.minTeamSize : existingConfig.minTeamSize;
    let maxTeamSize: number | null = dto.maxTeamSize !== undefined ? dto.maxTeamSize : existingConfig.maxTeamSize;

    if (targetMode === ParticipationMode.INDIVIDUAL) {
      minTeamSize = null;
      maxTeamSize = null;
    } else {
      if (minTeamSize !== null && maxTeamSize !== null && minTeamSize > maxTeamSize) {
        throw new BadRequestException({
          code: 'INVALID_TEAM_SIZE',
          message: 'minTeamSize must be less than or equal to maxTeamSize',
        });
      }
      if (minTeamSize === null || minTeamSize < 1) minTeamSize = 1;
      if (maxTeamSize === null) maxTeamSize = Math.max(4, minTeamSize);
      if (maxTeamSize > 100) {
        throw new BadRequestException({
          code: 'INVALID_TEAM_SIZE',
          message: 'maxTeamSize cannot exceed 100',
        });
      }
    }

    // Eligibility Validation
    const targetYearFrom = dto.graduationYearFrom !== undefined ? dto.graduationYearFrom : existingConfig.graduationYearFrom;
    const targetYearTo = dto.graduationYearTo !== undefined ? dto.graduationYearTo : existingConfig.graduationYearTo;

    if (targetYearFrom !== null && targetYearFrom !== undefined && targetYearTo !== null && targetYearTo !== undefined) {
      if (targetYearFrom > targetYearTo) {
        throw new BadRequestException({
          code: 'INVALID_ELIGIBILITY_CONFIGURATION',
          message: 'graduationYearFrom must be less than or equal to graduationYearTo',
        });
      }
    }

    // Normalize Array entries
    const allowedBranches = dto.allowedBranches
      ? normalizeStringArray(dto.allowedBranches)
      : existingConfig.allowedBranches;
    const allowedColleges = dto.allowedColleges
      ? normalizeStringArray(dto.allowedColleges)
      : existingConfig.allowedColleges;

    const updatedConfig = await this.prisma.hackathonConfiguration.update({
      where: { hackathonId },
      data: {
        participationMode: targetMode,
        minTeamSize,
        maxTeamSize,
        eligibilityType: dto.eligibilityType !== undefined ? dto.eligibilityType : existingConfig.eligibilityType,
        allowedBranches,
        allowedColleges,
        graduationYearFrom: targetYearFrom,
        graduationYearTo: targetYearTo,
        aiUsagePolicy: dto.aiUsagePolicy !== undefined ? dto.aiUsagePolicy : existingConfig.aiUsagePolicy,
        aiDisclosureRequired: dto.aiDisclosureRequired !== undefined ? dto.aiDisclosureRequired : existingConfig.aiDisclosureRequired,
        preExistingCodePolicy: dto.preExistingCodePolicy !== undefined ? dto.preExistingCodePolicy : existingConfig.preExistingCodePolicy,
        openSourcePolicy: dto.openSourcePolicy !== undefined ? dto.openSourcePolicy : existingConfig.openSourcePolicy,
        githubRequired: dto.githubRequired !== undefined ? dto.githubRequired : existingConfig.githubRequired,
        repositoryPolicy: dto.repositoryPolicy !== undefined ? dto.repositoryPolicy : existingConfig.repositoryPolicy,
      },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.configuration_updated',
      hackathonId,
      {
        organizationId: hackathon.organizationId,
        updatedFields: Object.keys(dto),
      }
    );

    return this.mapToConfigurationResponse(updatedConfig);
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/rules
   */
  public async getHackathonRules(
    userId: string | undefined,
    userRoles: RoleName[] | undefined,
    hackathonId: string
  ): Promise<HackathonRulesResponse> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found',
      });
    }

    const isPublicRead =
      hackathon.visibility === HackathonVisibility.PUBLIC &&
      hackathon.status !== HackathonStatus.DRAFT;

    if (!isPublicRead) {
      if (!userId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'Authentication required to view rules for this hackathon.',
        });
      }
      await this.checkOrganizationPermission(
        userId,
        userRoles || [],
        hackathon.organizationId,
        Permission.HACKATHON_READ
      );
    }

    const config = await this.ensureConfigurationExists(hackathonId);

    return {
      hackathonId: hackathon.id,
      hackathonName: hackathon.name,
      participationMode: config.participationMode as ParticipationMode,
      minTeamSize: config.minTeamSize ?? null,
      maxTeamSize: config.maxTeamSize ?? null,
      eligibilityType: config.eligibilityType as EligibilityType,
      allowedBranches: config.allowedBranches || [],
      allowedColleges: config.allowedColleges || [],
      graduationYearFrom: config.graduationYearFrom ?? null,
      graduationYearTo: config.graduationYearTo ?? null,
      aiUsagePolicy: config.aiUsagePolicy as AIUsagePolicy,
      aiDisclosureRequired: Boolean(config.aiDisclosureRequired),
      preExistingCodePolicy: config.preExistingCodePolicy as PreExistingCodePolicy,
      openSourcePolicy: config.openSourcePolicy as OpenSourcePolicy,
      githubRequired: Boolean(config.githubRequired),
      repositoryPolicy: config.repositoryPolicy as RepositoryPolicy,
      rulesMarkdown: config.rulesMarkdown ?? null,
      updatedAt: new Date(config.updatedAt).toISOString(),
    };
  }

  /**
   * PATCH /api/v1/hackathons/:hackathonId/rules
   */
  public async updateHackathonRules(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    hackathonId: string,
    dto: UpdateHackathonRulesDto
  ): Promise<HackathonRulesResponse> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found',
      });
    }

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    if (
      effectiveStatus === HackathonStatus.LIVE ||
      effectiveStatus === HackathonStatus.COMPLETED ||
      effectiveStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_CONFIGURATION_LOCKED',
        message: `Hackathon rules are locked in '${effectiveStatus}' state and cannot be modified.`,
      });
    }

    if (dto.rulesMarkdown && dto.rulesMarkdown.length > 100000) {
      throw new BadRequestException({
        code: 'INVALID_RULES_CONTENT',
        message: 'rulesMarkdown content exceeds maximum allowed limit of 100,000 characters',
      });
    }

    await this.ensureConfigurationExists(hackathonId);

    await this.prisma.hackathonConfiguration.update({
      where: { hackathonId },
      data: {
        rulesMarkdown: dto.rulesMarkdown !== undefined ? dto.rulesMarkdown : null,
      },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.rules_updated',
      hackathonId,
      { organizationId: hackathon.organizationId }
    );

    return this.getHackathonRules(userId, userRoles, hackathonId);
  }

  // ==========================================
  // S2-03: HACKATHON TRACKS DOMAIN METHODS
  // ==========================================

  public formatTrack(track: any): HackathonTrackEntity {
    return {
      id: track.id,
      hackathonId: track.hackathonId,
      name: track.name,
      slug: track.slug,
      shortDescription: track.shortDescription ?? null,
      description: track.description ?? null,
      displayOrder: track.displayOrder,
      isActive: track.isActive,
      createdAt: new Date(track.createdAt).toISOString(),
      updatedAt: new Date(track.updatedAt).toISOString(),
      challengesCount: track._count?.challenges ?? (track.challenges ? track.challenges.length : undefined),
      challenges: track.challenges ? track.challenges.map((c: any) => this.formatChallenge(c)) : undefined,
    };
  }

  public formatChallenge(challenge: any): HackathonChallengeEntity {
    let resources = [];
    if (challenge.resources) {
      if (Array.isArray(challenge.resources)) {
        resources = challenge.resources;
      } else if (typeof challenge.resources === 'string') {
        try {
          resources = JSON.parse(challenge.resources);
        } catch {
          resources = [];
        }
      }
    }
    return {
      id: challenge.id,
      trackId: challenge.trackId,
      name: challenge.name,
      slug: challenge.slug,
      description: challenge.description ?? null,
      problemStatement: challenge.problemStatement,
      requirements: challenge.requirements ?? null,
      constraints: challenge.constraints ?? null,
      expectedOutcome: challenge.expectedOutcome ?? null,
      resources,
      displayOrder: challenge.displayOrder,
      status: challenge.status as ChallengeStatus,
      createdAt: new Date(challenge.createdAt).toISOString(),
      updatedAt: new Date(challenge.updatedAt).toISOString(),
    };
  }

  /**
   * Helper: Validates if hackathon configuration is locked for structural changes.
   */
  private assertHackathonNotLocked(effectiveStatus: HackathonStatus, actionName: string): void {
    if (
      effectiveStatus === HackathonStatus.LIVE ||
      effectiveStatus === HackathonStatus.COMPLETED ||
      effectiveStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_CONFIGURATION_LOCKED',
        message: `Cannot ${actionName}: Hackathon is locked in '${effectiveStatus}' state.`,
      });
    }
  }

  /**
   * Lists tracks for a hackathon.
   */
  public async getHackathonTracks(
    userId: string,
    userRoles: RoleName[],
    hackathonId: string
  ): Promise<HackathonTrackEntity[]> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: `Hackathon with id '${hackathonId}' was not found.`,
      });
    }

    const hasOrgPermission = await this.authorizationService.canAsync(
      { id: userId, roles: userRoles },
      Permission.HACKATHON_READ,
      { type: ScopeType.ORGANIZATION, id: hackathon.organizationId }
    );

    const isPublic = hackathon.visibility === HackathonVisibility.PUBLIC && hackathon.status !== HackathonStatus.DRAFT;

    if (!hasOrgPermission && !isPublic) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access to this private hackathon is restricted to organization members.',
      });
    }

    const tracks = await this.prisma.hackathonTrack.findMany({
      where: {
        hackathonId,
        ...(hasOrgPermission ? {} : { isActive: true }),
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: {
          select: {
            challenges: hasOrgPermission ? true : { where: { status: ChallengeStatus.PUBLISHED } },
          },
        },
      },
    });

    return tracks.map((t) => this.formatTrack(t));
  }

  /**
   * Creates a track within a hackathon.
   */
  public async createHackathonTrack(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    hackathonId: string,
    dto: CreateTrackDto
  ): Promise<HackathonTrackEntity> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: `Hackathon with id '${hackathonId}' was not found.`,
      });
    }

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    this.assertHackathonNotLocked(effectiveStatus, 'create track');

    const slug = this.generateSlug(dto.name, dto.slug);

    const existingSlug = await this.prisma.hackathonTrack.findUnique({
      where: {
        hackathonId_slug: {
          hackathonId,
          slug,
        },
      },
    });

    if (existingSlug) {
      throw new ConflictException({
        code: 'TRACK_SLUG_CONFLICT',
        message: `Track with slug '${slug}' already exists in this hackathon.`,
      });
    }

    let displayOrder = dto.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.prisma.hackathonTrack.aggregate({
        where: { hackathonId },
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? 0) + 1;
    }

    const track = await this.prisma.hackathonTrack.create({
      data: {
        hackathonId,
        name: dto.name.trim(),
        slug,
        shortDescription: dto.shortDescription?.trim() ?? null,
        description: dto.description?.trim() ?? null,
        displayOrder,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: {
        _count: { select: { challenges: true } },
      },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.track_created',
      hackathonId,
      { organizationId: hackathon.organizationId, trackId: track.id, name: track.name, slug: track.slug }
    );

    return this.formatTrack(track);
  }

  /**
   * Gets a specific track by ID with its challenges.
   */
  public async getHackathonTrack(
    userId: string,
    userRoles: RoleName[],
    hackathonId: string,
    trackId: string
  ): Promise<HackathonTrackEntity> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: `Hackathon with id '${hackathonId}' was not found.`,
      });
    }

    const hasOrgPermission = await this.authorizationService.canAsync(
      { id: userId, roles: userRoles },
      Permission.HACKATHON_READ,
      { type: ScopeType.ORGANIZATION, id: hackathon.organizationId }
    );

    const isPublic = hackathon.visibility === HackathonVisibility.PUBLIC && hackathon.status !== HackathonStatus.DRAFT;

    if (!hasOrgPermission && !isPublic) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access to this track is restricted.',
      });
    }

    const track = await this.prisma.hackathonTrack.findFirst({
      where: {
        id: trackId,
        hackathonId,
        ...(hasOrgPermission ? {} : { isActive: true }),
      },
      include: {
        challenges: {
          where: hasOrgPermission ? {} : { status: ChallengeStatus.PUBLISHED },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
        },
        _count: { select: { challenges: true } },
      },
    });

    if (!track) {
      throw new NotFoundException({
        code: 'TRACK_NOT_FOUND',
        message: `Track with id '${trackId}' was not found in this hackathon.`,
      });
    }

    return this.formatTrack(track);
  }

  /**
   * Updates a track.
   */
  public async updateHackathonTrack(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    hackathonId: string,
    trackId: string,
    dto: UpdateTrackDto
  ): Promise<HackathonTrackEntity> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: `Hackathon with id '${hackathonId}' was not found.`,
      });
    }

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    this.assertHackathonNotLocked(effectiveStatus, 'update track');

    const track = await this.prisma.hackathonTrack.findFirst({
      where: { id: trackId, hackathonId },
    });

    if (!track) {
      throw new NotFoundException({
        code: 'TRACK_NOT_FOUND',
        message: `Track with id '${trackId}' was not found in this hackathon.`,
      });
    }

    let newSlug = track.slug;
    if (dto.slug || dto.name) {
      const candidateSlug = this.generateSlug(
        dto.name || track.name,
        dto.slug || (dto.name ? undefined : track.slug)
      );
      if (candidateSlug !== track.slug) {
        const conflict = await this.prisma.hackathonTrack.findUnique({
          where: {
            hackathonId_slug: {
              hackathonId,
              slug: candidateSlug,
            },
          },
        });
        if (conflict) {
          throw new ConflictException({
            code: 'TRACK_SLUG_CONFLICT',
            message: `Track with slug '${candidateSlug}' already exists in this hackathon.`,
          });
        }
        newSlug = candidateSlug;
      }
    }

    const updated = await this.prisma.hackathonTrack.update({
      where: { id: trackId },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        slug: newSlug,
        shortDescription: dto.shortDescription !== undefined ? (dto.shortDescription ? dto.shortDescription.trim() : null) : undefined,
        description: dto.description !== undefined ? (dto.description ? dto.description.trim() : null) : undefined,
        displayOrder: dto.displayOrder !== undefined ? dto.displayOrder : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
      include: {
        _count: { select: { challenges: true } },
      },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.track_updated',
      hackathonId,
      { organizationId: hackathon.organizationId, trackId, updatedFields: Object.keys(dto) }
    );

    return this.formatTrack(updated);
  }

  /**
   * Deletes a track and cascades its challenges.
   */
  public async deleteHackathonTrack(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    hackathonId: string,
    trackId: string
  ): Promise<{ success: boolean; id: string }> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: `Hackathon with id '${hackathonId}' was not found.`,
      });
    }

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    this.assertHackathonNotLocked(effectiveStatus, 'delete track');

    const track = await this.prisma.hackathonTrack.findFirst({
      where: { id: trackId, hackathonId },
    });

    if (!track) {
      throw new NotFoundException({
        code: 'TRACK_NOT_FOUND',
        message: `Track with id '${trackId}' was not found in this hackathon.`,
      });
    }

    await this.prisma.hackathonTrack.delete({
      where: { id: trackId },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.track_deleted',
      hackathonId,
      { organizationId: hackathon.organizationId, trackId, name: track.name }
    );

    return { success: true, id: trackId };
  }

  /**
   * Atomically reorders tracks within a hackathon.
   */
  public async reorderHackathonTracks(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    hackathonId: string,
    dto: ReorderTracksDto
  ): Promise<HackathonTrackEntity[]> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: `Hackathon with id '${hackathonId}' was not found.`,
      });
    }

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    this.assertHackathonNotLocked(effectiveStatus, 'reorder tracks');

    const itemIds = dto.items.map((i) => i.id);
    const existingTracks = await this.prisma.hackathonTrack.findMany({
      where: {
        hackathonId,
        id: { in: itemIds },
      },
    });

    if (existingTracks.length !== itemIds.length) {
      throw new BadRequestException({
        code: 'INVALID_REORDER_ITEMS',
        message: 'One or more track IDs do not belong to this hackathon.',
      });
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.hackathonTrack.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.tracks_reordered',
      hackathonId,
      { organizationId: hackathon.organizationId, count: dto.items.length }
    );

    return this.getHackathonTracks(userId, userRoles, hackathonId);
  }

  // ==========================================
  // S2-03: HACKATHON CHALLENGES DOMAIN METHODS
  // ==========================================

  /**
   * Helper: Resolves track and parent hackathon for authorization and parent checks.
   */
  private async resolveTrackWithHackathon(trackId: string) {
    const track = await this.prisma.hackathonTrack.findUnique({
      where: { id: trackId },
      include: { hackathon: true },
    });

    if (!track) {
      throw new NotFoundException({
        code: 'TRACK_NOT_FOUND',
        message: `Track with id '${trackId}' was not found.`,
      });
    }

    return track;
  }

  /**
   * Lists challenges for a track.
   */
  public async getTrackChallenges(
    userId: string,
    userRoles: RoleName[],
    trackId: string
  ): Promise<HackathonChallengeEntity[]> {
    const track = await this.resolveTrackWithHackathon(trackId);

    const hasOrgPermission = await this.authorizationService.canAsync(
      { id: userId, roles: userRoles },
      Permission.HACKATHON_READ,
      { type: ScopeType.ORGANIZATION, id: track.hackathon.organizationId }
    );

    const isPublic = track.hackathon.visibility === HackathonVisibility.PUBLIC && track.hackathon.status !== HackathonStatus.DRAFT;

    if (!hasOrgPermission && !isPublic) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access to these challenges is restricted.',
      });
    }

    const challenges = await this.prisma.hackathonChallenge.findMany({
      where: {
        trackId,
        ...(hasOrgPermission ? {} : { status: ChallengeStatus.PUBLISHED }),
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return challenges.map((c) => this.formatChallenge(c));
  }

  /**
   * Creates a challenge inside a track.
   */
  public async createTrackChallenge(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    trackId: string,
    dto: CreateChallengeDto
  ): Promise<HackathonChallengeEntity> {
    const track = await this.resolveTrackWithHackathon(trackId);

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      track.hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      track.hackathon.status as HackathonStatus,
      track.hackathon.startsAt,
      track.hackathon.endsAt,
      now
    );

    this.assertHackathonNotLocked(effectiveStatus, 'create challenge');

    const slug = this.generateSlug(dto.name, dto.slug);

    const existingSlug = await this.prisma.hackathonChallenge.findUnique({
      where: {
        trackId_slug: {
          trackId,
          slug,
        },
      },
    });

    if (existingSlug) {
      throw new ConflictException({
        code: 'CHALLENGE_SLUG_CONFLICT',
        message: `Challenge with slug '${slug}' already exists in this track.`,
      });
    }

    let displayOrder = dto.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.prisma.hackathonChallenge.aggregate({
        where: { trackId },
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? 0) + 1;
    }

    const challenge = await this.prisma.hackathonChallenge.create({
      data: {
        trackId,
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() ?? null,
        problemStatement: dto.problemStatement.trim(),
        requirements: dto.requirements?.trim() ?? null,
        constraints: dto.constraints?.trim() ?? null,
        expectedOutcome: dto.expectedOutcome?.trim() ?? null,
        resources: dto.resources ? (dto.resources as any) : [],
        displayOrder,
        status: (dto.status as ChallengeStatus) ?? ChallengeStatus.DRAFT,
      },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.challenge_created',
      track.hackathon.id,
      { organizationId: track.hackathon.organizationId, trackId, challengeId: challenge.id, name: challenge.name, slug }
    );

    return this.formatChallenge(challenge);
  }

  /**
   * Gets a specific challenge by ID.
   */
  public async getTrackChallenge(
    userId: string,
    userRoles: RoleName[],
    trackId: string,
    challengeId: string
  ): Promise<HackathonChallengeEntity> {
    const track = await this.resolveTrackWithHackathon(trackId);

    const hasOrgPermission = await this.authorizationService.canAsync(
      { id: userId, roles: userRoles },
      Permission.HACKATHON_READ,
      { type: ScopeType.ORGANIZATION, id: track.hackathon.organizationId }
    );

    const isPublic = track.hackathon.visibility === HackathonVisibility.PUBLIC && track.hackathon.status !== HackathonStatus.DRAFT;

    if (!hasOrgPermission && !isPublic) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access to this challenge is restricted.',
      });
    }

    const challenge = await this.prisma.hackathonChallenge.findFirst({
      where: {
        id: challengeId,
        trackId,
        ...(hasOrgPermission ? {} : { status: ChallengeStatus.PUBLISHED }),
      },
    });

    if (!challenge) {
      throw new NotFoundException({
        code: 'CHALLENGE_NOT_FOUND',
        message: `Challenge with id '${challengeId}' was not found in this track.`,
      });
    }

    return this.formatChallenge(challenge);
  }

  /**
   * Updates a challenge within a track.
   */
  public async updateTrackChallenge(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    trackId: string,
    challengeId: string,
    dto: UpdateChallengeDto
  ): Promise<HackathonChallengeEntity> {
    const track = await this.resolveTrackWithHackathon(trackId);

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      track.hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      track.hackathon.status as HackathonStatus,
      track.hackathon.startsAt,
      track.hackathon.endsAt,
      now
    );

    this.assertHackathonNotLocked(effectiveStatus, 'update challenge');

    const challenge = await this.prisma.hackathonChallenge.findFirst({
      where: { id: challengeId, trackId },
    });

    if (!challenge) {
      throw new NotFoundException({
        code: 'CHALLENGE_NOT_FOUND',
        message: `Challenge with id '${challengeId}' was not found in this track.`,
      });
    }

    let newSlug = challenge.slug;
    if (dto.slug || dto.name) {
      const candidateSlug = this.generateSlug(
        dto.name || challenge.name,
        dto.slug || (dto.name ? undefined : challenge.slug)
      );
      if (candidateSlug !== challenge.slug) {
        const conflict = await this.prisma.hackathonChallenge.findUnique({
          where: {
            trackId_slug: {
              trackId,
              slug: candidateSlug,
            },
          },
        });
        if (conflict) {
          throw new ConflictException({
            code: 'CHALLENGE_SLUG_CONFLICT',
            message: `Challenge with slug '${candidateSlug}' already exists in this track.`,
          });
        }
        newSlug = candidateSlug;
      }
    }

    const updated = await this.prisma.hackathonChallenge.update({
      where: { id: challengeId },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        slug: newSlug,
        description: dto.description !== undefined ? (dto.description ? dto.description.trim() : null) : undefined,
        problemStatement: dto.problemStatement !== undefined ? dto.problemStatement.trim() : undefined,
        requirements: dto.requirements !== undefined ? (dto.requirements ? dto.requirements.trim() : null) : undefined,
        constraints: dto.constraints !== undefined ? (dto.constraints ? dto.constraints.trim() : null) : undefined,
        expectedOutcome: dto.expectedOutcome !== undefined ? (dto.expectedOutcome ? dto.expectedOutcome.trim() : null) : undefined,
        resources: dto.resources !== undefined ? (dto.resources as any) : undefined,
        displayOrder: dto.displayOrder !== undefined ? dto.displayOrder : undefined,
        status: dto.status !== undefined ? (dto.status as ChallengeStatus) : undefined,
      },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.challenge_updated',
      track.hackathon.id,
      { organizationId: track.hackathon.organizationId, trackId, challengeId, updatedFields: Object.keys(dto) }
    );

    return this.formatChallenge(updated);
  }

  /**
   * Deletes a challenge.
   */
  public async deleteTrackChallenge(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    trackId: string,
    challengeId: string
  ): Promise<{ success: boolean; id: string }> {
    const track = await this.resolveTrackWithHackathon(trackId);

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      track.hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      track.hackathon.status as HackathonStatus,
      track.hackathon.startsAt,
      track.hackathon.endsAt,
      now
    );

    this.assertHackathonNotLocked(effectiveStatus, 'delete challenge');

    const challenge = await this.prisma.hackathonChallenge.findFirst({
      where: { id: challengeId, trackId },
    });

    if (!challenge) {
      throw new NotFoundException({
        code: 'CHALLENGE_NOT_FOUND',
        message: `Challenge with id '${challengeId}' was not found in this track.`,
      });
    }

    await this.prisma.hackathonChallenge.delete({
      where: { id: challengeId },
    });

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.challenge_deleted',
      track.hackathon.id,
      { organizationId: track.hackathon.organizationId, trackId, challengeId, name: challenge.name }
    );

    return { success: true, id: challengeId };
  }

  /**
   * Atomically reorders challenges within a track.
   */
  public async reorderTrackChallenges(
    userId: string,
    userRoles: RoleName[],
    userEmail: string,
    trackId: string,
    dto: ReorderChallengesDto
  ): Promise<HackathonChallengeEntity[]> {
    const track = await this.resolveTrackWithHackathon(trackId);

    await this.checkOrganizationPermission(
      userId,
      userRoles,
      track.hackathon.organizationId,
      Permission.HACKATHON_UPDATE
    );

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      track.hackathon.status as HackathonStatus,
      track.hackathon.startsAt,
      track.hackathon.endsAt,
      now
    );

    this.assertHackathonNotLocked(effectiveStatus, 'reorder challenges');

    const itemIds = dto.items.map((i) => i.id);
    const existing = await this.prisma.hackathonChallenge.findMany({
      where: {
        trackId,
        id: { in: itemIds },
      },
    });

    if (existing.length !== itemIds.length) {
      throw new BadRequestException({
        code: 'INVALID_REORDER_ITEMS',
        message: 'One or more challenge IDs do not belong to this track.',
      });
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.hackathonChallenge.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    await this.createAuditLog(
      userId,
      userEmail,
      'hackathon.challenges_reordered',
      track.hackathon.id,
      { organizationId: track.hackathon.organizationId, trackId, count: dto.items.length }
    );

    return this.getTrackChallenges(userId, userRoles, trackId);
  }

  // ====================================================
  // S2-04: PARTICIPANT REGISTRATION DOMAIN METHODS
  // ====================================================

  /**
   * Helper: Formats ParticipantRegistration record to ParticipantRegistrationEntity.
   */
  public formatRegistration(reg: any): ParticipantRegistrationEntity {
    return {
      id: reg.id,
      hackathonId: reg.hackathonId,
      userId: reg.userId,
      trackId: reg.trackId,
      challengeId: reg.challengeId,
      status: reg.status as ParticipantRegistrationStatus,
      registeredAt: reg.registeredAt instanceof Date ? reg.registeredAt.toISOString() : reg.registeredAt,
      withdrawnAt: reg.withdrawnAt ? (reg.withdrawnAt instanceof Date ? reg.withdrawnAt.toISOString() : reg.withdrawnAt) : null,
      createdAt: reg.createdAt instanceof Date ? reg.createdAt.toISOString() : reg.createdAt,
      updatedAt: reg.updatedAt instanceof Date ? reg.updatedAt.toISOString() : reg.updatedAt,
      track: reg.track ? this.formatTrack(reg.track) : null,
      challenge: reg.challenge ? this.formatChallenge(reg.challenge) : null,
    };
  }

  /**
   * Evaluates user profile eligibility against HackathonConfiguration.
   */
  public checkUserEligibility(user: any, config: any): EligibilityCheckResult {
    const reasons: string[] = [];

    if (!config) {
      return { isEligible: true, reasons: [] };
    }

    if (config.eligibilityType === EligibilityType.STUDENTS_ONLY) {
      if (!user?.college || !user.college.trim()) {
        reasons.push('Student status required: College profile information is missing.');
      }
    }

    // Allowed Colleges check
    if (config.allowedColleges && config.allowedColleges.length > 0) {
      const userCollegeNorm = (user?.college || '').trim().toLowerCase();
      const isCollegeAllowed = config.allowedColleges.some(
        (c: string) => c.trim().toLowerCase() === userCollegeNorm
      );
      if (!userCollegeNorm || !isCollegeAllowed) {
        reasons.push('College is not in the list of allowed institutions.');
      }
    }

    // Allowed Branches check
    if (config.allowedBranches && config.allowedBranches.length > 0) {
      const userBranchNorm = (user?.branch || '').trim().toLowerCase();
      const isBranchAllowed = config.allowedBranches.some(
        (b: string) => b.trim().toLowerCase() === userBranchNorm
      );
      if (!userBranchNorm || !isBranchAllowed) {
        reasons.push('Academic branch is not in the list of allowed branches.');
      }
    }

    // Graduation Year range check
    if (config.graduationYearFrom !== null && config.graduationYearFrom !== undefined) {
      if (!user?.graduationYear || user.graduationYear < config.graduationYearFrom) {
        reasons.push(`Graduation year must be on or after ${config.graduationYearFrom}.`);
      }
    }
    if (config.graduationYearTo !== null && config.graduationYearTo !== undefined) {
      if (!user?.graduationYear || user.graduationYear > config.graduationYearTo) {
        reasons.push(`Graduation year must be on or before ${config.graduationYearTo}.`);
      }
    }

    return {
      isEligible: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Retrieves current user's registration for a hackathon.
   */
  public async getParticipantRegistration(
    userId: string,
    hackathonId: string
  ): Promise<ParticipantRegistrationEntity | null> {
    const registration = await this.prisma.participantRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
      include: {
        track: true,
        challenge: true,
      },
    });

    if (!registration) {
      return null;
    }

    return this.formatRegistration(registration);
  }

  /**
   * Registers current user for a hackathon (or reactivates a previous withdrawn registration).
   */
  public async createParticipantRegistration(
    userId: string,
    userEmail: string,
    hackathonId: string,
    dto: CreateParticipantRegistrationDto
  ): Promise<ParticipantRegistrationEntity> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: { configuration: true },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: `Hackathon with id '${hackathonId}' was not found.`,
      });
    }

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    if (
      effectiveStatus === HackathonStatus.DRAFT ||
      effectiveStatus === HackathonStatus.COMPLETED ||
      effectiveStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_REGISTRATION_UNAVAILABLE',
        message: `Registration is unavailable when hackathon is in '${effectiveStatus}' status.`,
      });
    }

    const regStatus = this.deriveRegistrationStatus(
      hackathon.registrationStartsAt,
      hackathon.registrationEndsAt,
      now
    );

    if (regStatus !== RegistrationStatus.OPEN) {
      throw new ConflictException({
        code: 'REGISTRATION_NOT_OPEN',
        message: `Registration is not open. Current registration window status: ${regStatus}`,
      });
    }

    // Evaluate Eligibility
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User profile not found.',
      });
    }

    const config = hackathon.configuration || (await this.ensureConfigurationExists(hackathonId));
    const eligibility = this.checkUserEligibility(user, config);

    if (!eligibility.isEligible) {
      throw new ForbiddenException({
        code: 'REGISTRATION_NOT_ELIGIBLE',
        message: 'User is not eligible to register for this hackathon.',
        details: eligibility.reasons,
      });
    }

    // Validate Track & Challenge Selection
    if (dto.trackId) {
      const track = await this.prisma.hackathonTrack.findUnique({
        where: { id: dto.trackId },
      });
      if (!track || track.hackathonId !== hackathonId) {
        throw new BadRequestException({
          code: 'INVALID_TRACK_SELECTION',
          message: 'Selected track does not belong to this hackathon.',
        });
      }
      if (!track.isActive) {
        throw new BadRequestException({
          code: 'TRACK_NOT_ACTIVE',
          message: 'Selected track is not active.',
        });
      }
    }

    if (dto.challengeId) {
      if (!dto.trackId) {
        throw new BadRequestException({
          code: 'TRACK_REQUIRED_FOR_CHALLENGE',
          message: 'A track must be selected when selecting a challenge.',
        });
      }
      const challenge = await this.prisma.hackathonChallenge.findUnique({
        where: { id: dto.challengeId },
      });
      if (!challenge || challenge.trackId !== dto.trackId) {
        throw new BadRequestException({
          code: 'INVALID_CHALLENGE_SELECTION',
          message: 'Selected challenge does not belong to the selected track.',
        });
      }
      if (challenge.status !== ChallengeStatus.PUBLISHED) {
        throw new BadRequestException({
          code: 'CHALLENGE_NOT_SELECTABLE',
          message: 'Selected challenge is not published.',
        });
      }
    }

    // Check existing registration
    const existing = await this.prisma.participantRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
    });

    if (existing) {
      if (existing.status === ParticipantRegistrationStatus.REGISTERED) {
        throw new ConflictException({
          code: 'REGISTRATION_ALREADY_EXISTS',
          message: 'User is already registered for this hackathon.',
        });
      }

      // Reactivate withdrawn registration
      const [updated] = await this.prisma.$transaction([
        this.prisma.participantRegistration.update({
          where: { id: existing.id },
          data: {
            status: ParticipantRegistrationStatus.REGISTERED,
            trackId: dto.trackId || null,
            challengeId: dto.challengeId || null,
            registeredAt: now,
            withdrawnAt: null,
          },
          include: {
            track: true,
            challenge: true,
          },
        }),
        this.prisma.auditLog.create({
          data: {
            actorId: userId,
            actorEmail: userEmail,
            action: 'participant.registration_created',
            targetEntity: 'Hackathon',
            targetId: hackathonId,
            metadata: {
              organizationId: hackathon.organizationId,
              registrationId: existing.id,
              trackId: dto.trackId || null,
              challengeId: dto.challengeId || null,
              reactivated: true,
            },
          },
        }),
      ]);

      return this.formatRegistration(updated);
    }

    // Create new registration atomically with audit log
    const [created] = await this.prisma.$transaction([
      this.prisma.participantRegistration.create({
        data: {
          hackathonId,
          userId,
          trackId: dto.trackId || null,
          challengeId: dto.challengeId || null,
          status: ParticipantRegistrationStatus.REGISTERED,
          registeredAt: now,
        },
        include: {
          track: true,
          challenge: true,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'participant.registration_created',
          targetEntity: 'Hackathon',
          targetId: hackathonId,
          metadata: {
            organizationId: hackathon.organizationId,
            trackId: dto.trackId || null,
            challengeId: dto.challengeId || null,
          },
        },
      }),
    ]);

    return this.formatRegistration(created);
  }

  /**
   * Updates allowed track/challenge selection for current user's registration.
   */
  public async updateParticipantRegistration(
    userId: string,
    userEmail: string,
    hackathonId: string,
    dto: UpdateParticipantRegistrationDto
  ): Promise<ParticipantRegistrationEntity> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: `Hackathon with id '${hackathonId}' was not found.`,
      });
    }

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    if (effectiveStatus === HackathonStatus.COMPLETED || effectiveStatus === HackathonStatus.ARCHIVED) {
      throw new ConflictException({
        code: 'HACKATHON_REGISTRATION_LOCKED',
        message: `Registration selections cannot be updated when hackathon is in '${effectiveStatus}' status.`,
      });
    }

    const existing = await this.prisma.participantRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'REGISTRATION_NOT_FOUND',
        message: 'No registration found for this hackathon.',
      });
    }

    if (existing.status !== ParticipantRegistrationStatus.REGISTERED) {
      throw new ConflictException({
        code: 'REGISTRATION_NOT_ACTIVE',
        message: 'Cannot update selection on a withdrawn registration.',
      });
    }

    const targetTrackId = dto.trackId !== undefined ? (dto.trackId || null) : existing.trackId;
    let targetChallengeId = dto.challengeId !== undefined ? (dto.challengeId || null) : existing.challengeId;

    if (dto.trackId !== undefined && !dto.trackId) {
      targetChallengeId = null;
    }

    // Validate Track
    if (targetTrackId) {
      const track = await this.prisma.hackathonTrack.findUnique({
        where: { id: targetTrackId },
      });
      if (!track || track.hackathonId !== hackathonId) {
        throw new BadRequestException({
          code: 'INVALID_TRACK_SELECTION',
          message: 'Selected track does not belong to this hackathon.',
        });
      }
      if (!track.isActive) {
        throw new BadRequestException({
          code: 'TRACK_NOT_ACTIVE',
          message: 'Selected track is not active.',
        });
      }
    }

    // Validate Challenge
    if (targetChallengeId) {
      if (!targetTrackId) {
        throw new BadRequestException({
          code: 'TRACK_REQUIRED_FOR_CHALLENGE',
          message: 'A track must be selected when selecting a challenge.',
        });
      }
      const challenge = await this.prisma.hackathonChallenge.findUnique({
        where: { id: targetChallengeId },
      });
      if (!challenge || challenge.trackId !== targetTrackId) {
        throw new BadRequestException({
          code: 'INVALID_CHALLENGE_SELECTION',
          message: 'Selected challenge does not belong to the selected track.',
        });
      }
      if (challenge.status !== ChallengeStatus.PUBLISHED) {
        throw new BadRequestException({
          code: 'CHALLENGE_NOT_SELECTABLE',
          message: 'Selected challenge is not published.',
        });
      }
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.participantRegistration.update({
        where: { id: existing.id },
        data: {
          trackId: targetTrackId,
          challengeId: targetChallengeId,
        },
        include: {
          track: true,
          challenge: true,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'participant.registration_updated',
          targetEntity: 'Hackathon',
          targetId: hackathonId,
          metadata: {
            organizationId: hackathon.organizationId,
            registrationId: existing.id,
            trackId: targetTrackId,
            challengeId: targetChallengeId,
          },
        },
      }),
    ]);

    return this.formatRegistration(updated);
  }

  /**
   * Withdraws current user's registration from a hackathon.
   */
  public async withdrawParticipantRegistration(
    userId: string,
    userEmail: string,
    hackathonId: string
  ): Promise<{ success: boolean; id: string }> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: `Hackathon with id '${hackathonId}' was not found.`,
      });
    }

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );

    if (effectiveStatus === HackathonStatus.COMPLETED || effectiveStatus === HackathonStatus.ARCHIVED) {
      throw new ConflictException({
        code: 'HACKATHON_REGISTRATION_LOCKED',
        message: `Cannot withdraw from a hackathon in '${effectiveStatus}' status.`,
      });
    }

    const existing = await this.prisma.participantRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'REGISTRATION_NOT_FOUND',
        message: 'No registration found for this hackathon.',
      });
    }

    if (existing.status === ParticipantRegistrationStatus.WITHDRAWN) {
      throw new ConflictException({
        code: 'ALREADY_WITHDRAWN',
        message: 'Registration has already been withdrawn.',
      });
    }

    await this.prisma.$transaction([
      this.prisma.participantRegistration.update({
        where: { id: existing.id },
        data: {
          status: ParticipantRegistrationStatus.WITHDRAWN,
          withdrawnAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'participant.registration_withdrawn',
          targetEntity: 'Hackathon',
          targetId: hackathonId,
          metadata: {
            organizationId: hackathon.organizationId,
            registrationId: existing.id,
          },
        },
      }),
    ]);

    return { success: true, id: existing.id };
  }

  // ==========================================
  // S2-05: TEAMS & TEAM FORMATION DOMAIN
  // ==========================================

  public formatTeam(team: any, currentUserId?: string): TeamEntity {
    const activeMembers = (team.members || []).filter((m: any) => m.status === TeamMemberStatus.ACTIVE);
    const isCaptain = currentUserId ? activeMembers.some((m: any) => m.userId === currentUserId && m.role === TeamMemberRole.CAPTAIN) : false;

    return {
      id: team.id,
      hackathonId: team.hackathonId,
      name: team.name,
      slug: team.slug,
      description: team.description ?? null,
      createdByUserId: team.createdByUserId,
      status: team.status as TeamStatus,
      createdAt: team.createdAt instanceof Date ? team.createdAt.toISOString() : team.createdAt,
      updatedAt: team.updatedAt instanceof Date ? team.updatedAt.toISOString() : team.updatedAt,
      memberCount: activeMembers.length,
      members: (team.members || []).map((m: any) => ({
        id: m.id,
        teamId: m.teamId,
        userId: m.userId,
        role: m.role as TeamMemberRole,
        status: m.status as TeamMemberStatus,
        joinedAt: m.joinedAt instanceof Date ? m.joinedAt.toISOString() : m.joinedAt,
        leftAt: m.leftAt ? (m.leftAt instanceof Date ? m.leftAt.toISOString() : m.leftAt) : null,
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
        updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
        user: m.user
          ? {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
              avatarUrl: m.user.avatarUrl ?? null,
              college: m.user.college ?? null,
              branch: m.user.branch ?? null,
              skills: m.user.skills || [],
            }
          : undefined,
      })),
      invitations: isCaptain && team.invitations
        ? team.invitations.map((inv: any) => ({
            id: inv.id,
            teamId: inv.teamId,
            inviteeUserId: inv.inviteeUserId,
            invitedByUserId: inv.invitedByUserId,
            status: inv.status as TeamInvitationStatus,
            expiresAt: inv.expiresAt instanceof Date ? inv.expiresAt.toISOString() : inv.expiresAt,
            respondedAt: inv.respondedAt ? (inv.respondedAt instanceof Date ? inv.respondedAt.toISOString() : inv.respondedAt) : null,
            createdAt: inv.createdAt instanceof Date ? inv.createdAt.toISOString() : inv.createdAt,
            updatedAt: inv.updatedAt instanceof Date ? inv.updatedAt.toISOString() : inv.updatedAt,
            inviteeUser: inv.inviteeUser
              ? {
                  id: inv.inviteeUser.id,
                  name: inv.inviteeUser.name,
                  email: inv.inviteeUser.email,
                  avatarUrl: inv.inviteeUser.avatarUrl ?? null,
                  college: inv.inviteeUser.college ?? null,
                  branch: inv.inviteeUser.branch ?? null,
                  skills: inv.inviteeUser.skills || [],
                }
              : undefined,
          }))
        : undefined,
    };
  }

  public async createTeam(
    hackathonId: string,
    userId: string,
    userEmail: string,
    dto: CreateTeamDto,
  ): Promise<TeamEntity> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: { configuration: true },
    });

    if (!hackathon) {
      throw new NotFoundException({
        code: 'HACKATHON_NOT_FOUND',
        message: 'Hackathon not found.',
      });
    }

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      hackathon.status as HackathonStatus,
      hackathon.startsAt,
      hackathon.endsAt,
      now
    );
    if (
      effectiveStatus === HackathonStatus.DRAFT ||
      effectiveStatus === HackathonStatus.COMPLETED ||
      effectiveStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'TEAM_FORMATION_UNAVAILABLE',
        message: `Team formation is unavailable when hackathon is in '${effectiveStatus}' status.`,
      });
    }

    if (hackathon.configuration?.participationMode === ParticipationMode.INDIVIDUAL) {
      throw new ConflictException({
        code: 'TEAMS_NOT_ALLOWED',
        message: 'This hackathon only permits individual participation.',
      });
    }

    // Verify user registration
    const registration = await this.prisma.participantRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
    });

    if (!registration || registration.status !== ParticipantRegistrationStatus.REGISTERED) {
      throw new ForbiddenException({
        code: 'NOT_REGISTERED',
        message: 'You must be registered for this hackathon to create a team.',
      });
    }

    const name = dto.name.trim();
    const slug = dto.slug?.trim().toLowerCase() || this.generateSlug(name);
    const description = dto.description?.trim() || null;

    // Create Team, Captain TeamMember, and AuditLog atomically in interactive transaction
    const team = await this.prisma.$transaction(async (tx) => {
      // Row lock participant registration for this hackathon to prevent concurrent team creation
      await tx.participantRegistration.update({
        where: {
          hackathonId_userId: {
            hackathonId,
            userId,
          },
        },
        data: {
          updatedAt: new Date(),
        },
      });

      // Re-verify inside transaction to prevent race conditions
      const existingActiveMembership = await tx.teamMember.findFirst({
        where: {
          userId,
          status: TeamMemberStatus.ACTIVE,
          team: {
            hackathonId,
            status: TeamStatus.ACTIVE,
          },
        },
      });

      if (existingActiveMembership) {
        throw new ConflictException({
          code: 'ALREADY_ON_TEAM',
          message: 'You are already an active member of a team in this hackathon.',
        });
      }

      // Verify slug uniqueness in hackathon
      const existingTeamWithSlug = await tx.team.findUnique({
        where: {
          hackathonId_slug: {
            hackathonId,
            slug,
          },
        },
      });

      if (existingTeamWithSlug) {
        throw new ConflictException({
          code: 'TEAM_ALREADY_EXISTS',
          message: `A team with slug '${slug}' already exists in this hackathon.`,
        });
      }

      const createdTeam = await tx.team.create({
        data: {
          hackathonId,
          name,
          slug,
          description,
          createdByUserId: userId,
          status: TeamStatus.ACTIVE,
          members: {
            create: {
              userId,
              role: TeamMemberRole.CAPTAIN,
              status: TeamMemberStatus.ACTIVE,
            },
          },
        },
        include: {
          members: {
            include: { user: true },
          },
          invitations: {
            include: {
              inviteeUser: true,
              invitedByUser: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.created',
          targetEntity: 'Team',
          targetId: createdTeam.id,
          metadata: {
            organizationId: hackathon.organizationId,
            hackathonId,
            name,
            slug,
          },
        },
      });

      return createdTeam;
    });

    return this.formatTeam(team, userId);
  }

  public async getMyTeam(hackathonId: string, userId: string): Promise<TeamEntity | null> {
    const membership = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        status: TeamMemberStatus.ACTIVE,
        team: {
          hackathonId,
          status: TeamStatus.ACTIVE,
        },
      },
      include: {
        team: {
          include: {
            members: {
              include: { user: true },
            },
            invitations: {
              where: {
                status: TeamInvitationStatus.PENDING,
                expiresAt: { gt: new Date() },
              },
              include: {
                inviteeUser: true,
                invitedByUser: true,
              },
            },
          },
        },
      },
    });

    if (!membership || !membership.team) {
      return null;
    }

    return this.formatTeam(membership.team, userId);
  }

  public async getMyTeamInvitations(hackathonId: string, userId: string): Promise<TeamInvitationEntity[]> {
    const invitations = await this.prisma.teamInvitation.findMany({
      where: {
        inviteeUserId: userId,
        status: TeamInvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
        team: {
          hackathonId,
          status: TeamStatus.ACTIVE,
        },
      },
      include: {
        team: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
        invitedByUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => ({
      id: inv.id,
      teamId: inv.teamId,
      inviteeUserId: inv.inviteeUserId,
      invitedByUserId: inv.invitedByUserId,
      status: inv.status as TeamInvitationStatus,
      expiresAt: inv.expiresAt.toISOString(),
      respondedAt: inv.respondedAt ? inv.respondedAt.toISOString() : null,
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      team: this.formatTeam(inv.team, userId),
      invitedByUser: inv.invitedByUser
        ? {
            id: inv.invitedByUser.id,
            name: inv.invitedByUser.name,
            email: inv.invitedByUser.email,
            avatarUrl: inv.invitedByUser.avatarUrl ?? null,
            college: inv.invitedByUser.college ?? null,
            branch: inv.invitedByUser.branch ?? null,
            skills: inv.invitedByUser.skills || [],
          }
        : undefined,
    }));
  }

  public async getTeamById(teamId: string, userId: string): Promise<TeamEntity> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { user: true },
        },
        invitations: {
          include: {
            inviteeUser: true,
            invitedByUser: true,
          },
        },
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    return this.formatTeam(team, userId);
  }

  public async updateTeam(
    teamId: string,
    userId: string,
    userEmail: string,
    dto: UpdateTeamDto,
  ): Promise<TeamEntity> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: true,
        members: {
          include: { user: true },
        },
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      team.hackathon.status as HackathonStatus,
      team.hackathon.startsAt,
      team.hackathon.endsAt,
      now
    );
    if (
      effectiveStatus === HackathonStatus.COMPLETED ||
      effectiveStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_LOCKED',
        message: 'Team cannot be updated after hackathon is completed or archived.',
      });
    }

    const isCaptain = team.members.some(
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN && m.status === TeamMemberStatus.ACTIVE,
    );

    if (!isCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the team captain can update team details.',
      });
    }

    const updateData: any = {};
    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description?.trim() || null;
    }
    if (dto.slug !== undefined) {
      const slug = dto.slug.trim().toLowerCase();
      if (slug !== team.slug) {
        const conflict = await this.prisma.team.findUnique({
          where: {
            hackathonId_slug: {
              hackathonId: team.hackathonId,
              slug,
            },
          },
        });
        if (conflict) {
          throw new ConflictException({
            code: 'TEAM_ALREADY_EXISTS',
            message: `A team with slug '${slug}' already exists in this hackathon.`,
          });
        }
        updateData.slug = slug;
      }
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.team.update({
        where: { id: teamId },
        data: updateData,
        include: {
          members: {
            include: { user: true },
          },
          invitations: {
            include: {
              inviteeUser: true,
              invitedByUser: true,
            },
          },
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.updated',
          targetEntity: 'Team',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
            updatedFields: Object.keys(updateData),
          },
        },
      }),
    ]);

    return this.formatTeam(updated, userId);
  }

  public async dissolveTeam(
    teamId: string,
    userId: string,
    userEmail: string,
  ): Promise<{ success: true }> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: true,
        members: true,
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      team.hackathon.status as HackathonStatus,
      team.hackathon.startsAt,
      team.hackathon.endsAt,
      now
    );
    if (
      effectiveStatus === HackathonStatus.COMPLETED ||
      effectiveStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_LOCKED',
        message: 'Team cannot be dissolved after hackathon is completed or archived.',
      });
    }

    const isCaptain = team.members.some(
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN && m.status === TeamMemberStatus.ACTIVE,
    );

    if (!isCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the team captain can dissolve the team.',
      });
    }

    await this.prisma.$transaction([
      this.prisma.team.update({
        where: { id: teamId },
        data: { status: TeamStatus.DISSOLVED },
      }),
      this.prisma.teamMember.updateMany({
        where: { teamId, status: TeamMemberStatus.ACTIVE },
        data: { status: TeamMemberStatus.LEFT, leftAt: now },
      }),
      this.prisma.teamInvitation.updateMany({
        where: { teamId, status: TeamInvitationStatus.PENDING },
        data: { status: TeamInvitationStatus.CANCELLED, respondedAt: now },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.dissolved',
          targetEntity: 'Team',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
          },
        },
      }),
    ]);

    return { success: true };
  }

  public async inviteTeamMember(
    teamId: string,
    userId: string,
    userEmail: string,
    dto: InviteTeamMemberDto,
  ): Promise<TeamInvitationEntity> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: {
          include: { configuration: true },
        },
        members: {
          where: { status: TeamMemberStatus.ACTIVE },
        },
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    const now = new Date();
    const effectiveStatus = this.deriveEffectiveStatus(
      team.hackathon.status as HackathonStatus,
      team.hackathon.startsAt,
      team.hackathon.endsAt,
      now
    );
    if (
      effectiveStatus === HackathonStatus.COMPLETED ||
      effectiveStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_LOCKED',
        message: 'Invitations cannot be created after hackathon is completed or archived.',
      });
    }

    const isCaptain = team.members.some(
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN,
    );

    if (!isCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the team captain can invite members.',
      });
    }

    // Resolve invitee user
    let invitee: any = null;
    if (dto.inviteeUserId) {
      invitee = await this.prisma.user.findUnique({ where: { id: dto.inviteeUserId } });
    } else if (dto.inviteeEmail) {
      invitee = await this.prisma.user.findUnique({ where: { email: dto.inviteeEmail.trim().toLowerCase() } });
    }

    if (!invitee) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Invitee user not found.',
      });
    }

    if (invitee.id === userId) {
      throw new BadRequestException({
        code: 'CANNOT_INVITE_SELF',
        message: 'You cannot invite yourself to your own team.',
      });
    }

    // Check invitee is registered for this hackathon
    const inviteeReg = await this.prisma.participantRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: team.hackathonId,
          userId: invitee.id,
        },
      },
    });

    if (!inviteeReg || inviteeReg.status !== ParticipantRegistrationStatus.REGISTERED) {
      throw new BadRequestException({
        code: 'INVITEE_NOT_REGISTERED',
        message: 'The invited user is not registered for this hackathon.',
      });
    }

    // Check invitee is not already active member on any active team in this hackathon
    const alreadyOnTeam = await this.prisma.teamMember.findFirst({
      where: {
        userId: invitee.id,
        status: TeamMemberStatus.ACTIVE,
        team: {
          hackathonId: team.hackathonId,
          status: TeamStatus.ACTIVE,
        },
      },
    });

    if (alreadyOnTeam) {
      throw new ConflictException({
        code: 'ALREADY_ON_TEAM',
        message: 'The invited user is already an active member of a team in this hackathon.',
      });
    }

    // Check max team size
    const maxTeamSize = team.hackathon.configuration?.maxTeamSize ?? 4;
    if (team.members.length >= maxTeamSize) {
      throw new ConflictException({
        code: 'TEAM_SIZE_LIMIT_REACHED',
        message: `Team has reached its maximum size of ${maxTeamSize} members.`,
      });
    }

    // Check for existing pending invitation
    const existingPending = await this.prisma.teamInvitation.findFirst({
      where: {
        teamId,
        inviteeUserId: invitee.id,
        status: TeamInvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingPending) {
      throw new ConflictException({
        code: 'INVITATION_ALREADY_EXISTS',
        message: 'A pending invitation for this user already exists.',
      });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invitation] = await this.prisma.$transaction([
      this.prisma.teamInvitation.create({
        data: {
          teamId,
          inviteeUserId: invitee.id,
          invitedByUserId: userId,
          status: TeamInvitationStatus.PENDING,
          expiresAt,
        },
        include: {
          inviteeUser: true,
          invitedByUser: true,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.invitation_created',
          targetEntity: 'Team',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
            inviteeUserId: invitee.id,
          },
        },
      }),
    ]);

    return {
      id: invitation.id,
      teamId: invitation.teamId,
      inviteeUserId: invitation.inviteeUserId,
      invitedByUserId: invitation.invitedByUserId,
      status: invitation.status as TeamInvitationStatus,
      expiresAt: invitation.expiresAt.toISOString(),
      respondedAt: invitation.respondedAt ? invitation.respondedAt.toISOString() : null,
      createdAt: invitation.createdAt.toISOString(),
      updatedAt: invitation.updatedAt.toISOString(),
      inviteeUser: {
        id: invitation.inviteeUser.id,
        name: invitation.inviteeUser.name,
        email: invitation.inviteeUser.email,
        avatarUrl: invitation.inviteeUser.avatarUrl ?? null,
        college: invitation.inviteeUser.college ?? null,
        branch: invitation.inviteeUser.branch ?? null,
        skills: invitation.inviteeUser.skills || [],
      },
    };
  }

  public async getTeamInvitations(teamId: string, userId: string): Promise<TeamInvitationEntity[]> {
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

    const isCaptain = team.members.some(
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN,
    );

    if (!isCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the team captain can view team invitations.',
      });
    }

    const invitations = await this.prisma.teamInvitation.findMany({
      where: { teamId },
      include: {
        inviteeUser: true,
        invitedByUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => ({
      id: inv.id,
      teamId: inv.teamId,
      inviteeUserId: inv.inviteeUserId,
      invitedByUserId: inv.invitedByUserId,
      status: inv.status as TeamInvitationStatus,
      expiresAt: inv.expiresAt.toISOString(),
      respondedAt: inv.respondedAt ? inv.respondedAt.toISOString() : null,
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      inviteeUser: inv.inviteeUser
        ? {
            id: inv.inviteeUser.id,
            name: inv.inviteeUser.name,
            email: inv.inviteeUser.email,
            avatarUrl: inv.inviteeUser.avatarUrl ?? null,
            college: inv.inviteeUser.college ?? null,
            branch: inv.inviteeUser.branch ?? null,
            skills: inv.inviteeUser.skills || [],
          }
        : undefined,
      invitedByUser: inv.invitedByUser
        ? {
            id: inv.invitedByUser.id,
            name: inv.invitedByUser.name,
            email: inv.invitedByUser.email,
            avatarUrl: inv.invitedByUser.avatarUrl ?? null,
            college: inv.invitedByUser.college ?? null,
            branch: inv.invitedByUser.branch ?? null,
            skills: inv.invitedByUser.skills || [],
          }
        : undefined,
    }));
  }

  public async cancelTeamInvitation(
    teamId: string,
    invitationId: string,
    userId: string,
    userEmail: string,
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
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN,
    );

    if (!isCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the team captain can cancel invitations.',
      });
    }

    const invitation = await this.prisma.teamInvitation.findFirst({
      where: { id: invitationId, teamId },
    });

    if (!invitation) {
      throw new NotFoundException({
        code: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found.',
      });
    }

    if (invitation.status !== TeamInvitationStatus.PENDING) {
      throw new ConflictException({
        code: 'INVITATION_NOT_PENDING',
        message: `Cannot cancel an invitation with status '${invitation.status}'.`,
      });
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: TeamInvitationStatus.CANCELLED,
          respondedAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.invitation_cancelled',
          targetEntity: 'Team',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
            invitationId,
          },
        },
      }),
    ]);

    return { success: true };
  }

  public async acceptTeamInvitation(
    invitationId: string,
    userId: string,
    userEmail: string,
  ): Promise<{ success: true; teamId: string }> {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        team: {
          include: {
            hackathon: {
              include: { configuration: true },
            },
            members: {
              where: { status: TeamMemberStatus.ACTIVE },
            },
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException({
        code: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found.',
      });
    }

    if (invitation.inviteeUserId !== userId) {
      throw new ForbiddenException({
        code: 'INVITATION_NOT_YOURS',
        message: 'You are not the recipient of this invitation.',
      });
    }

    if (invitation.status !== TeamInvitationStatus.PENDING) {
      throw new ConflictException({
        code: 'INVITATION_NOT_PENDING',
        message: `Cannot accept an invitation with status '${invitation.status}'.`,
      });
    }

    const now = new Date();
    if (invitation.expiresAt <= now) {
      await this.prisma.teamInvitation.update({
        where: { id: invitationId },
        data: { status: TeamInvitationStatus.EXPIRED, respondedAt: now },
      });
      throw new ConflictException({
        code: 'INVITATION_EXPIRED',
        message: 'This invitation has expired.',
      });
    }

    if (invitation.team.status === TeamStatus.DISSOLVED) {
      throw new ConflictException({
        code: 'TEAM_DISSOLVED',
        message: 'The team has been dissolved.',
      });
    }

    const { status: hStatus, startsAt, endsAt } = invitation.team.hackathon;
    const effectiveStatus = this.deriveEffectiveStatus(
      hStatus as HackathonStatus,
      startsAt,
      endsAt,
      now
    );
    if (
      effectiveStatus === HackathonStatus.COMPLETED ||
      effectiveStatus === HackathonStatus.ARCHIVED
    ) {
      throw new ConflictException({
        code: 'HACKATHON_LOCKED',
        message: 'Cannot join team after hackathon is completed or archived.',
      });
    }

    // Verify user registration for this hackathon
    const reg = await this.prisma.participantRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: invitation.team.hackathonId,
          userId,
        },
      },
    });

    if (!reg || reg.status !== ParticipantRegistrationStatus.REGISTERED) {
      throw new ForbiddenException({
        code: 'NOT_REGISTERED',
        message: 'You must be registered for this hackathon to join a team.',
      });
    }

    // Execute acceptance in transaction
    await this.prisma.$transaction(async (tx) => {
      // Row lock team to serialize concurrent invitation acceptances for the same team
      await tx.team.update({
        where: { id: invitation.teamId },
        data: { updatedAt: now },
      });

      // Row lock participant registration to serialize concurrent acceptance
      await tx.participantRegistration.update({
        where: {
          hackathonId_userId: {
            hackathonId: invitation.team.hackathonId,
            userId,
          },
        },
        data: {
          updatedAt: now,
        },
      });

      // Check user is not already active on another team in this hackathon
      const currentActiveTeam = await tx.teamMember.findFirst({
        where: {
          userId,
          status: TeamMemberStatus.ACTIVE,
          team: {
            hackathonId: invitation.team.hackathonId,
            status: TeamStatus.ACTIVE,
          },
        },
      });

      if (currentActiveTeam) {
        throw new ConflictException({
          code: 'ALREADY_ON_TEAM',
          message: 'You are already an active member of another team in this hackathon.',
        });
      }

      // Check current active members in team
      const maxTeamSize = invitation.team.hackathon.configuration?.maxTeamSize ?? 4;
      const activeMemberCount = await tx.teamMember.count({
        where: {
          teamId: invitation.teamId,
          status: TeamMemberStatus.ACTIVE,
        },
      });

      if (activeMemberCount >= maxTeamSize) {
        throw new ConflictException({
          code: 'TEAM_SIZE_LIMIT_REACHED',
          message: `Team has reached its maximum size of ${maxTeamSize} members.`,
        });
      }

      // 1. Update invitation status
      await tx.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: TeamInvitationStatus.ACCEPTED,
          respondedAt: now,
        },
      });

      // 2. Upsert / reactivate team member
      const existingMember = await tx.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: invitation.teamId,
            userId,
          },
        },
      });

      if (existingMember) {
        await tx.teamMember.update({
          where: { id: existingMember.id },
          data: {
            status: TeamMemberStatus.ACTIVE,
            role: TeamMemberRole.MEMBER,
            joinedAt: now,
            leftAt: null,
          },
        });
      } else {
        await tx.teamMember.create({
          data: {
            teamId: invitation.teamId,
            userId,
            role: TeamMemberRole.MEMBER,
            status: TeamMemberStatus.ACTIVE,
            joinedAt: now,
          },
        });
      }

      // 3. Cancel other pending invitations for this user in this hackathon
      const otherPending = await tx.teamInvitation.findMany({
        where: {
          inviteeUserId: userId,
          status: TeamInvitationStatus.PENDING,
          team: {
            hackathonId: invitation.team.hackathonId,
          },
          id: { not: invitationId },
        },
        select: { id: true },
      });

      if (otherPending.length > 0) {
        await tx.teamInvitation.updateMany({
          where: {
            id: { in: otherPending.map((p) => p.id) },
          },
          data: {
            status: TeamInvitationStatus.CANCELLED,
            respondedAt: now,
          },
        });
      }

      // 4. Audit log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.member_joined',
          targetEntity: 'Team',
          targetId: invitation.teamId,
          metadata: {
            organizationId: invitation.team.hackathon.organizationId,
            hackathonId: invitation.team.hackathonId,
            invitationId,
          },
        },
      });
    });

    return { success: true, teamId: invitation.teamId };
  }

  public async declineTeamInvitation(
    invitationId: string,
    userId: string,
    userEmail: string,
  ): Promise<{ success: true }> {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: { include: { hackathon: true } } },
    });

    if (!invitation) {
      throw new NotFoundException({
        code: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found.',
      });
    }

    if (invitation.inviteeUserId !== userId) {
      throw new ForbiddenException({
        code: 'INVITATION_NOT_YOURS',
        message: 'You are not the recipient of this invitation.',
      });
    }

    if (invitation.status !== TeamInvitationStatus.PENDING) {
      throw new ConflictException({
        code: 'INVITATION_NOT_PENDING',
        message: `Cannot decline an invitation with status '${invitation.status}'.`,
      });
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: TeamInvitationStatus.DECLINED,
          respondedAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.invitation_declined',
          targetEntity: 'Team',
          targetId: invitation.teamId,
          metadata: {
            organizationId: invitation.team.hackathon.organizationId,
            hackathonId: invitation.team.hackathonId,
            invitationId,
          },
        },
      }),
    ]);

    return { success: true };
  }

  public async leaveTeam(
    teamId: string,
    userId: string,
    userEmail: string,
  ): Promise<{ success: true }> {
    const membership = await this.prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
        status: TeamMemberStatus.ACTIVE,
      },
      include: {
        team: {
          include: { hackathon: true },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException({
        code: 'NOT_TEAM_MEMBER',
        message: 'You are not an active member of this team.',
      });
    }

    if (membership.role === TeamMemberRole.CAPTAIN) {
      throw new ConflictException({
        code: 'CAPTAIN_CANNOT_LEAVE',
        message: 'Team captains cannot leave the team directly. You must transfer captaincy first or dissolve the team.',
      });
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.teamMember.update({
        where: { id: membership.id },
        data: {
          status: TeamMemberStatus.LEFT,
          leftAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.member_left',
          targetEntity: 'Team',
          targetId: teamId,
          metadata: {
            organizationId: membership.team.hackathon.organizationId,
            hackathonId: membership.team.hackathonId,
          },
        },
      }),
    ]);

    return { success: true };
  }

  public async removeTeamMember(
    teamId: string,
    memberId: string,
    userId: string,
    userEmail: string,
  ): Promise<{ success: true }> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: true,
        members: true,
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    const isCaptain = team.members.some(
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN && m.status === TeamMemberStatus.ACTIVE,
    );

    if (!isCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the team captain can remove team members.',
      });
    }

    const targetMember = team.members.find((m) => m.id === memberId);
    if (!targetMember) {
      throw new NotFoundException({
        code: 'TEAM_MEMBER_NOT_FOUND',
        message: 'Team member not found.',
      });
    }

    if (targetMember.userId === userId) {
      throw new BadRequestException({
        code: 'CANNOT_REMOVE_SELF',
        message: 'Team captain cannot remove themselves. Transfer captaincy first or dissolve the team.',
      });
    }

    if (targetMember.status !== TeamMemberStatus.ACTIVE) {
      throw new ConflictException({
        code: 'MEMBER_NOT_ACTIVE',
        message: 'Target member is not active.',
      });
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.teamMember.update({
        where: { id: memberId },
        data: {
          status: TeamMemberStatus.LEFT,
          leftAt: now,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.member_removed',
          targetEntity: 'Team',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
            removedUserId: targetMember.userId,
          },
        },
      }),
    ]);

    return { success: true };
  }

  public async transferCaptaincy(
    teamId: string,
    userId: string,
    userEmail: string,
    dto: TransferCaptaincyDto,
  ): Promise<{ success: true }> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: true,
        members: true,
      },
    });

    if (!team || team.status === TeamStatus.DISSOLVED) {
      throw new NotFoundException({
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    const currentCaptain = team.members.find(
      (m) => m.userId === userId && m.role === TeamMemberRole.CAPTAIN && m.status === TeamMemberStatus.ACTIVE,
    );

    if (!currentCaptain) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the current team captain can transfer captaincy.',
      });
    }

    const targetMember = team.members.find((m) => m.id === dto.targetMemberId);
    if (!targetMember) {
      throw new NotFoundException({
        code: 'TEAM_MEMBER_NOT_FOUND',
        message: 'Target team member not found.',
      });
    }

    if (targetMember.userId === userId) {
      throw new BadRequestException({
        code: 'ALREADY_CAPTAIN',
        message: 'You are already the captain.',
      });
    }

    if (targetMember.status !== TeamMemberStatus.ACTIVE) {
      throw new ConflictException({
        code: 'MEMBER_NOT_ACTIVE',
        message: 'Target member is not active.',
      });
    }

    await this.prisma.$transaction([
      this.prisma.teamMember.update({
        where: { id: currentCaptain.id },
        data: { role: TeamMemberRole.MEMBER },
      }),
      this.prisma.teamMember.update({
        where: { id: targetMember.id },
        data: { role: TeamMemberRole.CAPTAIN },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail,
          action: 'team.captain_transferred',
          targetEntity: 'Team',
          targetId: teamId,
          metadata: {
            organizationId: team.hackathon.organizationId,
            hackathonId: team.hackathonId,
            newCaptainUserId: targetMember.userId,
          },
        },
      }),
    ]);

    return { success: true };
  }
}




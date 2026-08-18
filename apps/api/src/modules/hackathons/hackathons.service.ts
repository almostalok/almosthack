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
}



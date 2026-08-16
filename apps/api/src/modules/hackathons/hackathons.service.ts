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
} from '@almosthack/types';
import { isValidIanaTimezone } from '@almosthack/validation';
import { PrismaService } from '../../database/prisma.service';
import { AuthorizationService } from '../auth/authorization.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
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

    // 6. Persistence
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
}

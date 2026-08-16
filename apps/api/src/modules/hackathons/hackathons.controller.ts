import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { RoleName, Permission, ScopeType } from '@almosthack/types';
import {
  createHackathonSchema,
  updateHackathonSchema,
} from '@almosthack/validation';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions as Permissions } from '../auth/decorators/permissions.decorator';
import { RequireScope as Scope } from '../auth/decorators/scope.decorator';
import { HackathonsService } from './hackathons.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';

@Controller()
@UseGuards(SessionAuthGuard, PermissionsGuard)
export class HackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) {}

  /**
   * POST /api/v1/organizations/:organizationId/hackathons
   * Creates a new hackathon scoped under an organization.
   */
  @Post('organizations/:organizationId/hackathons')
  @Permissions(Permission.HACKATHON_CREATE)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async create(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateHackathonDto
  ) {
    const parseResult = createHackathonSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid hackathon creation payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.createHackathon(
      user.id,
      user.roles,
      user.email,
      organizationId,
      dto
    );
  }

  /**
   * GET /api/v1/organizations/:organizationId/hackathons
   * Lists all hackathons owned by an organization.
   */
  @Get('organizations/:organizationId/hackathons')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async listOrganizationHackathons(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('organizationId') organizationId: string
  ) {
    return this.hackathonsService.getOrganizationHackathons(
      user.id,
      user.roles,
      organizationId
    );
  }

  /**
   * GET /api/v1/hackathons/:hackathonId
   * Retrieves a single hackathon.
   */
  @Get('hackathons/:hackathonId')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async getHackathon(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getHackathon(
      user.id,
      user.roles,
      hackathonId
    );
  }

  /**
   * GET /api/v1/hackathons/:hackathonId/lifecycle
   * Exposes effective hackathon lifecycle status & registration window status.
   */
  @Get('hackathons/:hackathonId/lifecycle')
  @Permissions(Permission.HACKATHON_READ)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async getLifecycle(
    @CurrentUser() user: { id: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.getLifecycle(
      user.id,
      user.roles,
      hackathonId
    );
  }

  /**
   * PATCH /api/v1/hackathons/:hackathonId
   * Updates allowed hackathon fields.
   */
  @Patch('hackathons/:hackathonId')
  @Permissions(Permission.HACKATHON_UPDATE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async update(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string,
    @Body() dto: UpdateHackathonDto
  ) {
    // Explicitly reject direct lifecycle state mutation attempts
    const rawBody = dto as Record<string, any>;
    if (
      rawBody.status !== undefined ||
      rawBody.publishedAt !== undefined ||
      rawBody.completedAt !== undefined ||
      rawBody.archivedAt !== undefined ||
      rawBody.organizationId !== undefined
    ) {
      throw new BadRequestException({
        code: 'INVALID_FIELD_MUTATION',
        message: 'Status and lifecycle fields cannot be modified through generic update.',
      });
    }

    const parseResult = updateHackathonSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid hackathon update payload',
        details: parseResult.error.flatten(),
      });
    }

    return this.hackathonsService.updateHackathon(
      user.id,
      user.roles,
      user.email,
      hackathonId,
      dto
    );
  }

  /**
   * POST /api/v1/hackathons/:hackathonId/publish
   * Publishes a DRAFT hackathon.
   */
  @Post('hackathons/:hackathonId/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.HACKATHON_PUBLISH)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async publish(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.publishHackathon(
      user.id,
      user.roles,
      user.email,
      hackathonId
    );
  }

  /**
   * POST /api/v1/hackathons/:hackathonId/archive
   * Archives a COMPLETED hackathon.
   */
  @Post('hackathons/:hackathonId/archive')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.HACKATHON_ARCHIVE)
  @Scope(ScopeType.HACKATHON, 'hackathonId')
  public async archive(
    @CurrentUser() user: { id: string; email: string; roles: RoleName[] },
    @Param('hackathonId') hackathonId: string
  ) {
    return this.hackathonsService.archiveHackathon(
      user.id,
      user.roles,
      user.email,
      hackathonId
    );
  }
}

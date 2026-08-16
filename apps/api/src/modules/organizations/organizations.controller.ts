import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions as Permissions } from '../auth/decorators/permissions.decorator';
import { RequireScope as Scope } from '../auth/decorators/scope.decorator';
import { Permission, ScopeType } from '@almosthack/types';
import { OrganizationsService } from './organizations.service';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  deleteOrganizationSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  transferOwnershipSchema,
} from '@almosthack/validation';

@Controller('organizations')
@UseGuards(SessionAuthGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * POST /organizations
   * Creates a new organization and assigns caller as OWNER.
   */
  @Post()
  @Permissions(Permission.ORGANIZATION_CREATE)
  public async create(
    @CurrentUser() user: any,
    @Body() body: any
  ) {
    const validated = createOrganizationSchema.parse(body);
    const data = await this.organizationsService.createOrganization(
      user.id,
      user.email,
      validated
    );
    return { success: true, data };
  }

  /**
   * GET /organizations/me
   * Returns all active organizations for the authenticated user.
   */
  @Get('me')
  public async getMyOrganizations(@CurrentUser() user: any) {
    const data = await this.organizationsService.getUserOrganizations(user.id);
    return { success: true, data };
  }

  /**
   * GET /organizations/:organizationId
   * Gets organization details by ID or slug.
   */
  @Get(':organizationId')
  @Permissions(Permission.ORGANIZATION_READ)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async getOne(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: any
  ) {
    const data = await this.organizationsService.getOrganizationById(
      organizationId,
      user.id,
      user.roles
    );
    return { success: true, data };
  }

  /**
   * PATCH /organizations/:organizationId
   * Updates organization profile & settings.
   */
  @Patch(':organizationId')
  @Permissions(Permission.ORGANIZATION_UPDATE)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async update(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: any,
    @Body() body: any
  ) {
    const validated = updateOrganizationSchema.parse(body);
    const data = await this.organizationsService.updateOrganization(
      organizationId,
      user.id,
      user.email,
      user.roles,
      validated
    );
    return { success: true, data };
  }

  /**
   * DELETE /organizations/:organizationId
   * Destructively deletes organization (requires body confirmation matching slug).
   */
  @Delete(':organizationId')
  @Permissions(Permission.ORGANIZATION_DELETE)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async delete(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: any,
    @Body() body: any
  ) {
    const validated = deleteOrganizationSchema.parse(body);
    const data = await this.organizationsService.deleteOrganization(
      organizationId,
      user.id,
      user.email,
      user.roles,
      validated
    );
    return { success: true, data };
  }

  /**
   * GET /organizations/:organizationId/members
   * Returns list of organization members.
   */
  @Get(':organizationId/members')
  @Permissions(Permission.ORGANIZATION_MEMBER_READ)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async getMembers(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: any
  ) {
    const data = await this.organizationsService.getMembers(
      organizationId,
      user.id,
      user.roles
    );
    return { success: true, data };
  }

  /**
   * POST /organizations/:organizationId/members
   * Adds an existing user as a member (role: MEMBER or ADMIN).
   */
  @Post(':organizationId/members')
  @Permissions(Permission.ORGANIZATION_MEMBER_ADD)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async addMember(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: any,
    @Body() body: any
  ) {
    const validated = addMemberSchema.parse(body);
    const data = await this.organizationsService.addMember(
      organizationId,
      user.id,
      user.email,
      user.roles,
      validated
    );
    return { success: true, data };
  }

  /**
   * PATCH /organizations/:organizationId/members/:userId
   * Updates member role (ADMIN or MEMBER).
   */
  @Patch(':organizationId/members/:userId')
  @Permissions(Permission.ORGANIZATION_MEMBER_UPDATE_ROLE)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async updateMemberRole(
    @Param('organizationId') organizationId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: any,
    @Body() body: any
  ) {
    const validated = updateMemberRoleSchema.parse(body);
    const data = await this.organizationsService.updateMemberRole(
      organizationId,
      user.id,
      user.email,
      user.roles,
      targetUserId,
      validated
    );
    return { success: true, data };
  }

  /**
   * DELETE /organizations/:organizationId/members/:userId
   * Removes member from organization or self leave.
   */
  @Delete(':organizationId/members/:userId')
  @Permissions(Permission.ORGANIZATION_MEMBER_REMOVE)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async removeMember(
    @Param('organizationId') organizationId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: any
  ) {
    const data = await this.organizationsService.removeMember(
      organizationId,
      user.id,
      user.email,
      user.roles,
      targetUserId
    );
    return { success: true, data };
  }

  /**
   * POST /organizations/:organizationId/transfer-ownership
   * Transfers organization ownership to another active member.
   */
  @Post(':organizationId/transfer-ownership')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.ORGANIZATION_TRANSFER_OWNERSHIP)
  @Scope(ScopeType.ORGANIZATION, 'organizationId')
  public async transferOwnership(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: any,
    @Body() body: any
  ) {
    const validated = transferOwnershipSchema.parse(body);
    const data = await this.organizationsService.transferOwnership(
      organizationId,
      user.id,
      user.email,
      user.roles,
      validated
    );
    return { success: true, data };
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  OrganizationRole,
  OrganizationMemberStatus,
  RoleName,
} from '@almosthack/types';
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  DeleteOrganizationSchema,
  UpdateMemberRoleSchema,
  TransferOwnershipSchema,
  slugRegex,
} from '@almosthack/validation';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to normalize a slug string.
   */
  public normalizeSlug(input: string): string {
    if (!input) return '';
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Helper to validate slug format.
   */
  public validateSlug(slug: string): void {
    if (!slug || slug.length < 3 || slug.length > 50 || !slugRegex.test(slug)) {
      throw new BadRequestException(
        'Invalid slug format. Must be 3-50 characters consisting of lowercase letters, numbers, and hyphens.'
      );
    }
  }

  /**
   * Safe mapping for Organization response object.
   */
  private mapOrganizationResponse(org: any) {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description || null,
      logoUrl: org.logoUrl || null,
      websiteUrl: org.websiteUrl || null,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }

  /**
   * Safe mapping for OrganizationMember response object.
   */
  private mapMemberResponse(member: any) {
    return {
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: member.user
        ? {
            id: member.user.id,
            name: member.user.name,
            email: member.user.email,
            avatarUrl: member.user.avatarUrl || null,
          }
        : undefined,
    };
  }

  /**
   * Resolves caller's membership or platform admin privileges for an organization.
   */
  private async getCallerOrgContext(
    organizationIdOrSlug: string,
    callerUserId: string,
    callerRoles: RoleName[] = []
  ) {
    // 1. Find organization
    const org = await this.prisma.organization.findFirst({
      where: {
        OR: [{ id: organizationIdOrSlug }, { slug: organizationIdOrSlug }],
      },
    });

    if (!org) {
      throw new NotFoundException('ORGANIZATION_NOT_FOUND: Organization does not exist');
    }

    // 2. Check platform ADMIN status
    const isPlatformAdmin = callerRoles.includes(RoleName.ADMIN);

    // 3. Find caller membership
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: org.id,
        userId: callerUserId,
        status: OrganizationMemberStatus.ACTIVE,
      },
    });

    return { org, member, isPlatformAdmin };
  }

  /**
   * 1. Create Organization (and transactionally make creator OWNER)
   */
  public async createOrganization(
    userId: string,
    userEmail: string,
    dto: CreateOrganizationSchema
  ) {
    const rawSlug = dto.slug ? dto.slug : this.normalizeSlug(dto.name);
    this.validateSlug(rawSlug);

    // Check slug conflict
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: rawSlug },
    });

    if (existingOrg) {
      throw new ConflictException(
        'ORGANIZATION_SLUG_CONFLICT: An organization with this slug already exists'
      );
    }

    // Execute atomic creation transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.name.trim(),
          slug: rawSlug,
          description: dto.description?.trim() || null,
          logoUrl: dto.logoUrl || null,
          websiteUrl: dto.websiteUrl || null,
        },
      });

      const member = await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId,
          role: OrganizationRole.OWNER,
          status: OrganizationMemberStatus.ACTIVE,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: userEmail || 'unknown',
          action: 'ORGANIZATION_CREATED',
          targetEntity: 'Organization',
          targetId: organization.id,
          metadata: {
            name: organization.name,
            slug: organization.slug,
            ownerId: userId,
          },
        },
      });

      return { organization, member };
    });

    return this.mapOrganizationResponse(result.organization);
  }

  /**
   * 2. Get current user's active organizations
   */
  public async getUserOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: {
        userId,
        status: OrganizationMemberStatus.ACTIVE,
      },
      include: {
        organization: true,
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      organization: this.mapOrganizationResponse(m.organization),
      role: m.role as OrganizationRole,
      status: m.status as OrganizationMemberStatus,
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * 3. Get Organization details by ID or Slug
   */
  public async getOrganizationById(
    organizationIdOrSlug: string,
    callerUserId: string,
    callerRoles: RoleName[] = []
  ) {
    const { org, member, isPlatformAdmin } = await this.getCallerOrgContext(
      organizationIdOrSlug,
      callerUserId,
      callerRoles
    );

    if (!member && !isPlatformAdmin) {
      throw new ForbiddenException(
        'Forbidden: You are not an active member of this organization'
      );
    }

    return this.mapOrganizationResponse(org);
  }

  /**
   * 4. Update Organization settings
   */
  public async updateOrganization(
    organizationId: string,
    callerUserId: string,
    callerEmail: string,
    callerRoles: RoleName[],
    dto: UpdateOrganizationSchema
  ) {
    const { org, member, isPlatformAdmin } = await this.getCallerOrgContext(
      organizationId,
      callerUserId,
      callerRoles
    );

    if (!isPlatformAdmin && (!member || (member.role !== OrganizationRole.OWNER && member.role !== OrganizationRole.ADMIN))) {
      throw new ForbiddenException(
        'Forbidden: Only organization Owners or Admins can edit settings'
      );
    }

    let newSlug = org.slug;
    if (dto.slug && dto.slug !== org.slug) {
      newSlug = this.normalizeSlug(dto.slug);
      this.validateSlug(newSlug);

      const existingSlug = await this.prisma.organization.findFirst({
        where: {
          slug: newSlug,
          NOT: { id: org.id },
        },
      });

      if (existingSlug) {
        throw new ConflictException(
          'ORGANIZATION_SLUG_CONFLICT: Organization slug is already taken'
        );
      }
    }

    const updatedOrg = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.organization.update({
        where: { id: org.id },
        data: {
          name: dto.name !== undefined ? dto.name.trim() : org.name,
          slug: newSlug,
          description:
            dto.description !== undefined
              ? dto.description
                ? dto.description.trim()
                : null
              : org.description,
          logoUrl: dto.logoUrl !== undefined ? dto.logoUrl : org.logoUrl,
          websiteUrl: dto.websiteUrl !== undefined ? dto.websiteUrl : org.websiteUrl,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: callerUserId,
          actorEmail: callerEmail || 'unknown',
          action: 'ORGANIZATION_UPDATED',
          targetEntity: 'Organization',
          targetId: org.id,
          metadata: {
            updatedFields: Object.keys(dto),
            slug: updated.slug,
          },
        },
      });

      return updated;
    });

    return this.mapOrganizationResponse(updatedOrg);
  }

  /**
   * 5. Delete Organization (Destructive - requires slug confirmation)
   */
  public async deleteOrganization(
    organizationId: string,
    callerUserId: string,
    callerEmail: string,
    callerRoles: RoleName[],
    dto: DeleteOrganizationSchema
  ) {
    const { org, member, isPlatformAdmin } = await this.getCallerOrgContext(
      organizationId,
      callerUserId,
      callerRoles
    );

    if (!isPlatformAdmin && (!member || member.role !== OrganizationRole.OWNER)) {
      throw new ForbiddenException(
        'Forbidden: Only organization Owners can delete an organization'
      );
    }

    if (dto.confirmation !== org.slug) {
      throw new BadRequestException(
        `Confirmation mismatch. Enter "${org.slug}" to confirm deletion.`
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.organizationMember.deleteMany({
        where: { organizationId: org.id },
      });

      await tx.organization.delete({
        where: { id: org.id },
      });

      await tx.auditLog.create({
        data: {
          actorId: callerUserId,
          actorEmail: callerEmail || 'unknown',
          action: 'ORGANIZATION_DELETED',
          targetEntity: 'Organization',
          targetId: org.id,
          metadata: {
            deletedSlug: org.slug,
          },
        },
      });
    });

    return { success: true, message: 'Organization deleted successfully' };
  }

  /**
   * 6. Get Organization members list
   */
  public async getMembers(
    organizationId: string,
    callerUserId: string,
    callerRoles: RoleName[] = []
  ) {
    const { org, member, isPlatformAdmin } = await this.getCallerOrgContext(
      organizationId,
      callerUserId,
      callerRoles
    );

    if (!member && !isPlatformAdmin) {
      throw new ForbiddenException(
        'Forbidden: You must be a member to view organization member list'
      );
    }

    const members = await this.prisma.organizationMember.findMany({
      where: {
        organizationId: org.id,
        status: OrganizationMemberStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return members.map((m) => this.mapMemberResponse(m));
  }

  /**
   * 7. Add member to organization
   */
  public async addMember(
    organizationId: string,
    callerUserId: string,
    callerEmail: string,
    callerRoles: RoleName[],
    dto: { userId: string; role?: OrganizationRole }
  ) {
    const { org, member, isPlatformAdmin } = await this.getCallerOrgContext(
      organizationId,
      callerUserId,
      callerRoles
    );

    if (!isPlatformAdmin && (!member || (member.role !== OrganizationRole.OWNER && member.role !== OrganizationRole.ADMIN))) {
      throw new ForbiddenException(
        'Forbidden: Only organization Owners or Admins can add members'
      );
    }

    // Verify target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    if (!targetUser) {
      throw new NotFoundException('USER_NOT_FOUND: Target user does not exist');
    }

    // Check existing membership
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: org.id,
        userId: dto.userId,
      },
    });

    if (existingMember && existingMember.status === OrganizationMemberStatus.ACTIVE) {
      throw new ConflictException(
        'ALREADY_MEMBER: User is already an active member of this organization'
      );
    }

    const targetRole = dto.role === OrganizationRole.ADMIN ? OrganizationRole.ADMIN : OrganizationRole.MEMBER;

    const resultMember = await this.prisma.$transaction(async (tx) => {
      let createdOrUpdated;
      if (existingMember) {
        createdOrUpdated = await tx.organizationMember.update({
          where: { id: existingMember.id },
          data: {
            status: OrganizationMemberStatus.ACTIVE,
            role: targetRole,
            joinedAt: new Date(),
          },
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        });
      } else {
        createdOrUpdated = await tx.organizationMember.create({
          data: {
            organizationId: org.id,
            userId: dto.userId,
            role: targetRole,
            status: OrganizationMemberStatus.ACTIVE,
          },
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: callerUserId,
          actorEmail: callerEmail || 'unknown',
          action: 'ORGANIZATION_MEMBER_ADDED',
          targetEntity: 'OrganizationMember',
          targetId: createdOrUpdated.id,
          metadata: {
            organizationId: org.id,
            targetUserId: dto.userId,
            role: targetRole,
          },
        },
      });

      return createdOrUpdated;
    });

    return this.mapMemberResponse(resultMember);
  }

  /**
   * 8. Update member role
   */
  public async updateMemberRole(
    organizationId: string,
    callerUserId: string,
    callerEmail: string,
    callerRoles: RoleName[],
    targetUserId: string,
    dto: UpdateMemberRoleSchema
  ) {
    const { org, member: callerMember, isPlatformAdmin } = await this.getCallerOrgContext(
      organizationId,
      callerUserId,
      callerRoles
    );

    if (!isPlatformAdmin && (!callerMember || (callerMember.role !== OrganizationRole.OWNER && callerMember.role !== OrganizationRole.ADMIN))) {
      throw new ForbiddenException(
        'Forbidden: Only organization Owners or Admins can modify member roles'
      );
    }

    const targetMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: org.id,
        userId: targetUserId,
        status: OrganizationMemberStatus.ACTIVE,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    if (!targetMember) {
      throw new NotFoundException('MEMBER_NOT_FOUND: Target active member does not exist');
    }

    // Role Invariants
    if (targetMember.role === OrganizationRole.OWNER) {
      throw new ForbiddenException(
        'Forbidden: Cannot change Owner role through generic role endpoint. Use transfer ownership.'
      );
    }

    if (!isPlatformAdmin && callerMember?.role === OrganizationRole.ADMIN) {
      if (targetMember.role === OrganizationRole.ADMIN) {
        throw new ForbiddenException(
          'Forbidden: Organization Admins cannot change roles of other Admins'
        );
      }
    }

    const newRole = dto.role === OrganizationRole.ADMIN ? OrganizationRole.ADMIN : OrganizationRole.MEMBER;

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.organizationMember.update({
        where: { id: targetMember.id },
        data: { role: newRole },
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: callerUserId,
          actorEmail: callerEmail || 'unknown',
          action: 'ORGANIZATION_MEMBER_ROLE_CHANGED',
          targetEntity: 'OrganizationMember',
          targetId: targetMember.id,
          metadata: {
            organizationId: org.id,
            targetUserId,
            previousRole: targetMember.role,
            newRole,
          },
        },
      });

      return res;
    });

    return this.mapMemberResponse(updated);
  }

  /**
   * 9. Remove member (or self leave)
   */
  public async removeMember(
    organizationId: string,
    callerUserId: string,
    callerEmail: string,
    callerRoles: RoleName[],
    targetUserId: string
  ) {
    const { org, member: callerMember, isPlatformAdmin } = await this.getCallerOrgContext(
      organizationId,
      callerUserId,
      callerRoles
    );

    const isSelfLeave = callerUserId === targetUserId;

    if (!isSelfLeave && !isPlatformAdmin && (!callerMember || (callerMember.role !== OrganizationRole.OWNER && callerMember.role !== OrganizationRole.ADMIN))) {
      throw new ForbiddenException(
        'Forbidden: Only organization Owners or Admins can remove members'
      );
    }

    const targetMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: org.id,
        userId: targetUserId,
        status: OrganizationMemberStatus.ACTIVE,
      },
    });

    if (!targetMember) {
      throw new NotFoundException('MEMBER_NOT_FOUND: Target member is not active');
    }

    // Invariant: Last Owner Protection
    if (targetMember.role === OrganizationRole.OWNER) {
      const ownerCount = await this.prisma.organizationMember.count({
        where: {
          organizationId: org.id,
          role: OrganizationRole.OWNER,
          status: OrganizationMemberStatus.ACTIVE,
        },
      });

      if (ownerCount <= 1) {
        throw new ConflictException(
          'LAST_OWNER_CONSTRAINT: Cannot remove the last owner of an organization'
        );
      }
    }

    // Invariant: ADMIN permissions
    if (!isSelfLeave && !isPlatformAdmin && callerMember?.role === OrganizationRole.ADMIN) {
      if (targetMember.role === OrganizationRole.OWNER || targetMember.role === OrganizationRole.ADMIN) {
        throw new ForbiddenException(
          'Forbidden: Admins cannot remove owners or other admins'
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.organizationMember.delete({
        where: { id: targetMember.id },
      });

      await tx.auditLog.create({
        data: {
          actorId: callerUserId,
          actorEmail: callerEmail || 'unknown',
          action: 'ORGANIZATION_MEMBER_REMOVED',
          targetEntity: 'OrganizationMember',
          targetId: targetMember.id,
          metadata: {
            organizationId: org.id,
            removedUserId: targetUserId,
            removedBy: callerUserId,
          },
        },
      });
    });

    return { success: true, message: 'Member removed successfully' };
  }

  /**
   * 10. Transfer Ownership
   */
  public async transferOwnership(
    organizationId: string,
    callerUserId: string,
    callerEmail: string,
    callerRoles: RoleName[],
    dto: TransferOwnershipSchema
  ) {
    const { org, member: callerMember, isPlatformAdmin } = await this.getCallerOrgContext(
      organizationId,
      callerUserId,
      callerRoles
    );

    if (!isPlatformAdmin && (!callerMember || callerMember.role !== OrganizationRole.OWNER)) {
      throw new ForbiddenException(
        'Forbidden: Only current organization Owner can transfer ownership'
      );
    }

    if (callerUserId === dto.newOwnerId) {
      throw new BadRequestException('User is already the organization owner');
    }

    const targetMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: org.id,
        userId: dto.newOwnerId,
        status: OrganizationMemberStatus.ACTIVE,
      },
    });

    if (!targetMember) {
      throw new BadRequestException(
        'Target new owner must be an active member of the organization'
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Promote target member to OWNER
      await tx.organizationMember.update({
        where: { id: targetMember.id },
        data: { role: OrganizationRole.OWNER },
      });

      // 2. Demote former owner to ADMIN if caller was member
      if (callerMember) {
        await tx.organizationMember.update({
          where: { id: callerMember.id },
          data: { role: OrganizationRole.ADMIN },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: callerUserId,
          actorEmail: callerEmail || 'unknown',
          action: 'ORGANIZATION_OWNERSHIP_TRANSFERRED',
          targetEntity: 'Organization',
          targetId: org.id,
          metadata: {
            previousOwnerId: callerUserId,
            newOwnerId: dto.newOwnerId,
          },
        },
      });
    });

    return { success: true, message: 'Ownership transferred successfully' };
  }
}

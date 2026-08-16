import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import {
  RoleName,
  Permission,
  PermissionAction,
  ScopeContext,
  AuthorizationContext,
  PermissionMode,
  RoleMode,
  ScopeType,
  ORGANIZATION_ROLE_PERMISSIONS,
} from '@almosthack/types';
import {
  getPermissionsForRoles,
  evaluateRoles,
  evaluatePermissions,
} from '@almosthack/utils';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Constructs a standardized AuthorizationContext from a user identity and optional scope.
   */
  public buildContext(
    user: { id: string; roles?: RoleName[] },
    scope?: ScopeContext
  ): AuthorizationContext {
    const roles = user.roles || [RoleName.PARTICIPANT];
    const permissions = getPermissionsForRoles(roles);
    return {
      userId: user.id,
      roles,
      permissions,
      scope,
    };
  }

  /**
   * Extracts user roles array from either a user object or AuthorizationContext.
   */
  private extractUserRoles(userOrContext: any): RoleName[] {
    if (!userOrContext) return [];
    if (Array.isArray(userOrContext.roles)) return userOrContext.roles;
    return [];
  }

  /**
   * Checks if user has a specific role.
   */
  public hasRole(userOrContext: any, role: RoleName): boolean {
    const roles = this.extractUserRoles(userOrContext);
    return roles.includes(role);
  }

  /**
   * Checks if user has any of the specified roles.
   */
  public hasAnyRole(userOrContext: any, roles: RoleName[]): boolean {
    const userRoles = this.extractUserRoles(userOrContext);
    return evaluateRoles(userRoles, roles, 'OR');
  }

  /**
   * Checks if user has all of the specified roles.
   */
  public hasAllRoles(userOrContext: any, roles: RoleName[]): boolean {
    const userRoles = this.extractUserRoles(userOrContext);
    return evaluateRoles(userRoles, roles, 'AND');
  }

  /**
   * Evaluates user roles against requirements with configurable mode (default: OR).
   */
  public evaluateRoles(
    userOrContext: any,
    roles: RoleName[],
    mode: RoleMode = 'OR'
  ): boolean {
    const userRoles = this.extractUserRoles(userOrContext);
    return evaluateRoles(userRoles, roles, mode);
  }

  /**
   * Checks if user has a specific permission action.
   */
  public hasPermission(userOrContext: any, permission: PermissionAction): boolean {
    const roles = this.extractUserRoles(userOrContext);
    const granted = getPermissionsForRoles(roles);
    return granted.includes(permission);
  }

  /**
   * Checks if user has any of the required permissions.
   */
  public hasAnyPermission(
    userOrContext: any,
    permissions: PermissionAction[]
  ): boolean {
    const roles = this.extractUserRoles(userOrContext);
    return evaluatePermissions(roles, permissions, 'OR');
  }

  /**
   * Checks if user has all of the required permissions.
   */
  public hasAllPermissions(
    userOrContext: any,
    permissions: PermissionAction[]
  ): boolean {
    const roles = this.extractUserRoles(userOrContext);
    return evaluatePermissions(roles, permissions, 'AND');
  }

  /**
   * Evaluates user permissions against requirements with configurable mode (default: AND).
   */
  public evaluatePermissions(
    userOrContext: any,
    permissions: PermissionAction[],
    mode: PermissionMode = 'AND'
  ): boolean {
    const roles = this.extractUserRoles(userOrContext);
    return evaluatePermissions(roles, permissions, mode);
  }

  /**
   * Evaluates authorization decision for a permission and optional scope contract.
   */
  public can(
    userOrContext: any,
    permission: PermissionAction,
    scope?: ScopeContext
  ): boolean {
    if (!this.hasPermission(userOrContext, permission)) {
      return false;
    }

    // Scope contract evaluation
    if (scope) {
      if (scope.type === ScopeType.GLOBAL) {
        return true;
      }

      // Contract placeholder for future resource-scoped resolution
      // S1-03 rule: scope IDs must not be blindly trusted; domain resolvers will handle resource checks
      return true;
    }

    return true;
  }

  /**
   * Asserts permission and throws ForbiddenException if denied.
   */
  public assertPermission(
    userOrContext: any,
    permission: PermissionAction,
    scope?: ScopeContext
  ): void {
    if (!this.can(userOrContext, permission, scope)) {
      throw new ForbiddenException('Forbidden resource');
    }
  }

  /**
   * Resolves active OrganizationMember record from database.
   */
  public async getOrganizationMember(userId: string, organizationId: string) {
    if (!userId || !organizationId) return null;
    return this.prisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Evaluates organization-scoped authorization checking platform admin permission
   * or resolving database OrganizationMember role permissions.
   */
  public async evaluateOrganizationPermission(
    userId: string,
    userRoles: RoleName[],
    organizationId: string,
    permission: PermissionAction
  ): Promise<boolean> {
    // 1. Platform ADMIN override check
    const platformPermissions = getPermissionsForRoles(userRoles || []);
    if (platformPermissions.includes(Permission.PLATFORM_ORGANIZATION_MANAGE)) {
      return true;
    }

    // 2. Resolve organization membership from DB
    const member = await this.getOrganizationMember(userId, organizationId);
    if (!member) {
      return false;
    }

    // 3. Evaluate organization role permissions
    const orgRolePermissions =
      ORGANIZATION_ROLE_PERMISSIONS[member.role as keyof typeof ORGANIZATION_ROLE_PERMISSIONS] || [];
    return orgRolePermissions.includes(permission);
  }

  /**
   * Async permission assertion with full scope context evaluation.
   */
  public async canAsync(
    userOrContext: any,
    permission: PermissionAction,
    scope?: ScopeContext
  ): Promise<boolean> {
    const userId = userOrContext?.id || userOrContext?.userId;
    const userRoles = this.extractUserRoles(userOrContext);

    if (scope && scope.type === ScopeType.ORGANIZATION && scope.id) {
      return this.evaluateOrganizationPermission(userId, userRoles, scope.id, permission);
    }

    if (scope && scope.type === ScopeType.HACKATHON && scope.id) {
      const hackathon = await this.prisma.hackathon.findUnique({
        where: { id: scope.id },
        select: { organizationId: true, visibility: true, status: true },
      });
      if (hackathon) {
        if (
          hackathon.visibility === 'PUBLIC' &&
          hackathon.status !== 'DRAFT' &&
          (permission === Permission.HACKATHON_READ || permission === Permission.HACKATHON_VIEW)
        ) {
          return true;
        }
        return this.evaluateOrganizationPermission(userId, userRoles, hackathon.organizationId, permission);
      }
    }

    return this.can(userOrContext, permission, scope);
  }

  /**
   * Safely logs authorization denial events to AuditLog.
   */
  public async logDenied(
    actorId: string,
    actorEmail: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId,
          actorEmail: actorEmail || 'unknown',
          action: 'AUTHORIZATION_DENIED',
          targetEntity: metadata?.targetEntity || 'System',
          targetId: metadata?.targetId || 'unknown',
          metadata: {
            attemptedAction: action,
            ...metadata,
          },
        },
      });
    } catch (err: any) {
      this.logger.error(`Failed to record authorization denial audit log: ${err?.message}`);
    }
  }
}


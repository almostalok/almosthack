import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  RoleName,
  PermissionAction,
  PermissionMode,
  RoleMode,
  ScopeContext,
} from '@almosthack/types';
import { AuthorizationService } from '../authorization.service';
import { PERMISSIONS_KEY, PERMISSIONS_MODE_KEY } from '../decorators/permissions.decorator';
import { ROLES_KEY, ROLES_MODE_KEY } from '../decorators/roles.decorator';
import { SCOPE_KEY, ScopeMetadata } from '../decorators/scope.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const targetClass = context.getClass();

    const requiredPermissions = this.reflector.getAllAndOverride<PermissionAction[]>(
      PERMISSIONS_KEY,
      [handler, targetClass]
    );

    const permissionsMode =
      this.reflector.getAllAndOverride<PermissionMode>(PERMISSIONS_MODE_KEY, [
        handler,
        targetClass,
      ]) || 'AND';

    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      handler,
      targetClass,
    ]);

    const rolesMode =
      this.reflector.getAllAndOverride<RoleMode>(ROLES_MODE_KEY, [
        handler,
        targetClass,
      ]) || 'OR';

    const scopeMetadata = this.reflector.getAllAndOverride<ScopeMetadata>(SCOPE_KEY, [
      handler,
      targetClass,
    ]);

    // If no authorization metadata is defined, authorization guard allows execution (independent of auth guard)
    if (!requiredPermissions && !requiredRoles && !scopeMetadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Deny by default: If user is missing or invalid, reject with 403 Forbidden
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      if (user?.id) {
        await this.authorizationService.logDenied(
          user.id,
          user.email || 'unknown',
          request.url || 'UNKNOWN_ROUTE',
          {
            reason: 'Missing user roles context',
            path: request.url,
            method: request.method,
          }
        );
      }
      throw new ForbiddenException('Forbidden resource');
    }

    // 1. Evaluate required roles if specified
    if (requiredRoles && requiredRoles.length > 0) {
      const rolesAllowed = this.authorizationService.evaluateRoles(
        user,
        requiredRoles,
        rolesMode
      );

      if (!rolesAllowed) {
        await this.authorizationService.logDenied(
          user.id,
          user.email,
          request.url || 'UNKNOWN_ROUTE',
          {
            requiredRoles,
            rolesMode,
            userRoles: user.roles,
            path: request.url,
            method: request.method,
          }
        );
        throw new ForbiddenException('Forbidden resource');
      }
    }

    // 2. Evaluate scope context if specified
    let scopeContext: ScopeContext | undefined = undefined;
    if (scopeMetadata) {
      const scopeId = scopeMetadata.paramName ? request.params[scopeMetadata.paramName] : undefined;
      scopeContext = {
        type: scopeMetadata.type,
        id: scopeId,
      };
    }

    // 3. Evaluate required permissions if specified
    if (requiredPermissions && requiredPermissions.length > 0) {
      const permissionsAllowed = this.authorizationService.evaluatePermissions(
        user,
        requiredPermissions,
        permissionsMode
      );

      if (!permissionsAllowed) {
        await this.authorizationService.logDenied(
          user.id,
          user.email,
          request.url || 'UNKNOWN_ROUTE',
          {
            requiredPermissions,
            permissionsMode,
            userRoles: user.roles,
            scopeContext,
            path: request.url,
            method: request.method,
          }
        );
        throw new ForbiddenException('Forbidden resource');
      }

      // Check contract for individual permission + scope evaluation
      for (const permission of requiredPermissions) {
        if (!this.authorizationService.can(user, permission, scopeContext)) {
          await this.authorizationService.logDenied(
            user.id,
            user.email,
            request.url || 'UNKNOWN_ROUTE',
            {
              failedPermission: permission,
              scopeContext,
              path: request.url,
              method: request.method,
            }
          );
          throw new ForbiddenException('Forbidden resource');
        }
      }
    }

    return true;
  }
}

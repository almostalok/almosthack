import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName, ROLE_PERMISSIONS, PermissionAction } from '@almosthack/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionAction[]>(
      'permissions',
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) return false;

    const userRoles: RoleName[] = user.roles;
    const userPermissions = new Set<PermissionAction>();

    for (const role of userRoles) {
      const perms = ROLE_PERMISSIONS[role] || [];
      perms.forEach((p) => userPermissions.add(p));
    }

    return requiredPermissions.every((perm) => userPermissions.has(perm));
  }
}

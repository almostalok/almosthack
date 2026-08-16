import { SetMetadata, applyDecorators } from '@nestjs/common';
import { RoleName, RoleMode } from '@almosthack/types';

export const ROLES_KEY = 'roles';
export const ROLES_MODE_KEY = 'roles_mode';

export function RequireRoles(...roles: RoleName[]) {
  return SetMetadata(ROLES_KEY, roles);
}

export function RequireRolesWithOptions(
  roles: RoleName[],
  options: { mode?: RoleMode } = {}
) {
  const mode = options.mode || 'OR';
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    SetMetadata(ROLES_MODE_KEY, mode)
  );
}

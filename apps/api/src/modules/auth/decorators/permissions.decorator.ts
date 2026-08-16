import { SetMetadata, applyDecorators } from '@nestjs/common';
import { PermissionAction, PermissionMode } from '@almosthack/types';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSIONS_MODE_KEY = 'permissions_mode';

export function RequirePermissions(...permissions: PermissionAction[]) {
  return SetMetadata(PERMISSIONS_KEY, permissions);
}

export function RequirePermissionsWithOptions(
  permissions: PermissionAction[],
  options: { mode?: PermissionMode } = {}
) {
  const mode = options.mode || 'AND';
  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    SetMetadata(PERMISSIONS_MODE_KEY, mode)
  );
}

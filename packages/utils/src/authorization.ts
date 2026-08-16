import {
  RoleName,
  PermissionAction,
  ROLE_PERMISSIONS,
  PermissionMode,
  RoleMode,
} from '@almosthack/types';

/**
  * Resolves all distinct permissions granted to a given set of roles.
  */
export function getPermissionsForRoles(roles: RoleName[] = []): PermissionAction[] {
  const permissionsSet = new Set<PermissionAction>();
  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role] || [];
    for (const p of perms) {
      permissionsSet.add(p);
    }
  }
  return Array.from(permissionsSet);
}

/**
  * Checks if the user roles include a specific role.
  */
export function hasRole(userRoles: RoleName[] = [], targetRole: RoleName): boolean {
  return userRoles.includes(targetRole);
}

/**
  * Checks if the user roles include any of the specified roles (OR mode).
  */
export function hasAnyRole(userRoles: RoleName[] = [], targetRoles: RoleName[] = []): boolean {
  if (targetRoles.length === 0) return true;
  return targetRoles.some((role) => userRoles.includes(role));
}

/**
  * Checks if the user roles include all of the specified roles (AND mode).
  */
export function hasAllRoles(userRoles: RoleName[] = [], targetRoles: RoleName[] = []): boolean {
  if (targetRoles.length === 0) return true;
  return targetRoles.every((role) => userRoles.includes(role));
}

/**
  * Evaluates roles based on specified mode (default: OR).
  */
export function evaluateRoles(
  userRoles: RoleName[] = [],
  requiredRoles: RoleName[] = [],
  mode: RoleMode = 'OR'
): boolean {
  if (requiredRoles.length === 0) return true;
  return mode === 'AND'
    ? hasAllRoles(userRoles, requiredRoles)
    : hasAnyRole(userRoles, requiredRoles);
}

/**
  * Checks if a set of user roles has a specific permission action.
  */
export function hasPermission(
  userRoles: RoleName[] = [],
  permission: PermissionAction
): boolean {
  const granted = getPermissionsForRoles(userRoles);
  return granted.includes(permission);
}

/**
  * Checks if user roles have any of the required permissions (OR mode).
  */
export function hasAnyPermission(
  userRoles: RoleName[] = [],
  permissions: PermissionAction[] = []
): boolean {
  if (permissions.length === 0) return true;
  const granted = new Set(getPermissionsForRoles(userRoles));
  return permissions.some((p) => granted.has(p));
}

/**
  * Checks if user roles have all of the required permissions (AND mode).
  */
export function hasAllPermissions(
  userRoles: RoleName[] = [],
  permissions: PermissionAction[] = []
): boolean {
  if (permissions.length === 0) return true;
  const granted = new Set(getPermissionsForRoles(userRoles));
  return permissions.every((p) => granted.has(p));
}

/**
  * Evaluates permissions based on specified mode (default: AND).
  */
export function evaluatePermissions(
  userRoles: RoleName[] = [],
  requiredPermissions: PermissionAction[] = [],
  mode: PermissionMode = 'AND'
): boolean {
  if (requiredPermissions.length === 0) return true;
  return mode === 'OR'
    ? hasAnyPermission(userRoles, requiredPermissions)
    : hasAllPermissions(userRoles, requiredPermissions);
}

/**
 * Role-Based Access Control (RBAC) System for almosthack
 * Complete granular permissions matrix supporting enterprise security & auditability.
 */

export enum RoleName {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  JUDGE = 'JUDGE',
  PARTICIPANT = 'PARTICIPANT',
  MENTOR = 'MENTOR',
  SPONSOR = 'SPONSOR',
}

export const Permission = {
  // Profile & User
  PROFILE_READ_SELF: 'profile:read_self',
  PROFILE_UPDATE_SELF: 'profile:update_self',
  USER_READ_SELF: 'user:read_self',
  USER_UPDATE_SELF: 'user:update_self',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',

  // System & Audit
  SYSTEM_HEALTH_READ: 'system:health_read',
  SYSTEM_MANAGE: 'system:manage',
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',
  AUTH_MANAGE_SESSIONS: 'auth:manage_sessions',

  // Hackathons (Scope contract placeholders)
  HACKATHON_CREATE: 'hackathon:create',
  HACKATHON_UPDATE: 'hackathon:update',
  HACKATHON_DELETE: 'hackathon:delete',
  HACKATHON_PUBLISH: 'hackathon:publish',
  HACKATHON_VIEW: 'hackathon:view',

  // Submissions
  SUBMISSION_CREATE: 'submission:create',
  SUBMISSION_UPDATE: 'submission:update',
  SUBMISSION_DELETE: 'submission:delete',
  SUBMISSION_VIEW: 'submission:view',

  // Judging
  JUDGING_ASSIGN: 'judging:assign',
  JUDGING_SUBMIT_SCORE: 'judging:submit_score',
  JUDGING_CALIBRATE: 'judging:calibrate',
  JUDGING_VIEW_RESULTS: 'judging:view_results',

  // Mentorship
  MENTOR_CLAIM_TICKET: 'mentor:claim_ticket',
  MENTOR_VIEW_REQUESTS: 'mentor:view_requests',

  // Sponsorship
  SPONSOR_VIEW_ANALYTICS: 'sponsor:view_analytics',
  SPONSOR_MANAGE_PRIZES: 'sponsor:manage_prizes',
} as const;

export type PermissionAction = (typeof Permission)[keyof typeof Permission];

export enum ScopeType {
  GLOBAL = 'GLOBAL',
  ORGANIZATION = 'ORGANIZATION',
  HACKATHON = 'HACKATHON',
  ROUND = 'ROUND',
  TEAM = 'TEAM',
  SUBMISSION = 'SUBMISSION',
}

export interface ScopeContext {
  type: ScopeType;
  id?: string;
}

export interface AuthorizationContext {
  userId: string;
  roles: RoleName[];
  permissions: PermissionAction[];
  scope?: ScopeContext;
}

export type PermissionMode = 'AND' | 'OR';
export type RoleMode = 'OR' | 'AND';

export const ROLE_PERMISSIONS: Record<RoleName, PermissionAction[]> = {
  [RoleName.ADMIN]: [
    Permission.PROFILE_READ_SELF,
    Permission.PROFILE_UPDATE_SELF,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.SYSTEM_HEALTH_READ,
    Permission.SYSTEM_MANAGE,
    Permission.AUDIT_READ,
    Permission.AUDIT_EXPORT,
    Permission.AUTH_MANAGE_SESSIONS,
    Permission.HACKATHON_CREATE,
    Permission.HACKATHON_UPDATE,
    Permission.HACKATHON_DELETE,
    Permission.HACKATHON_PUBLISH,
    Permission.HACKATHON_VIEW,
    Permission.SUBMISSION_CREATE,
    Permission.SUBMISSION_UPDATE,
    Permission.SUBMISSION_DELETE,
    Permission.SUBMISSION_VIEW,
    Permission.JUDGING_ASSIGN,
    Permission.JUDGING_SUBMIT_SCORE,
    Permission.JUDGING_CALIBRATE,
    Permission.JUDGING_VIEW_RESULTS,
    Permission.MENTOR_CLAIM_TICKET,
    Permission.MENTOR_VIEW_REQUESTS,
    Permission.SPONSOR_VIEW_ANALYTICS,
    Permission.SPONSOR_MANAGE_PRIZES,
  ],
  [RoleName.ORGANIZER]: [
    Permission.PROFILE_READ_SELF,
    Permission.PROFILE_UPDATE_SELF,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.AUDIT_READ,
    Permission.HACKATHON_CREATE,
    Permission.HACKATHON_UPDATE,
    Permission.HACKATHON_PUBLISH,
    Permission.HACKATHON_VIEW,
    Permission.SUBMISSION_VIEW,
    Permission.JUDGING_ASSIGN,
    Permission.JUDGING_CALIBRATE,
    Permission.JUDGING_VIEW_RESULTS,
    Permission.SPONSOR_VIEW_ANALYTICS,
    Permission.SPONSOR_MANAGE_PRIZES,
  ],
  [RoleName.JUDGE]: [
    Permission.PROFILE_READ_SELF,
    Permission.PROFILE_UPDATE_SELF,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.HACKATHON_VIEW,
    Permission.SUBMISSION_VIEW,
    Permission.JUDGING_SUBMIT_SCORE,
  ],
  [RoleName.PARTICIPANT]: [
    Permission.PROFILE_READ_SELF,
    Permission.PROFILE_UPDATE_SELF,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.HACKATHON_VIEW,
    Permission.SUBMISSION_CREATE,
    Permission.SUBMISSION_UPDATE,
    Permission.SUBMISSION_VIEW,
  ],
  [RoleName.MENTOR]: [
    Permission.PROFILE_READ_SELF,
    Permission.PROFILE_UPDATE_SELF,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.HACKATHON_VIEW,
    Permission.SUBMISSION_VIEW,
    Permission.MENTOR_CLAIM_TICKET,
    Permission.MENTOR_VIEW_REQUESTS,
  ],
  [RoleName.SPONSOR]: [
    Permission.PROFILE_READ_SELF,
    Permission.PROFILE_UPDATE_SELF,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.HACKATHON_VIEW,
    Permission.SPONSOR_VIEW_ANALYTICS,
    Permission.SPONSOR_MANAGE_PRIZES,
  ],
};


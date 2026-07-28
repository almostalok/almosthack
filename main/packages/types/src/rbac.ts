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

export type PermissionAction =
  // Platform Admin
  | 'system:manage'
  | 'audit:read'
  | 'audit:export'
  
  // Hackathon Lifecycle
  | 'hackathon:create'
  | 'hackathon:update'
  | 'hackathon:delete'
  | 'hackathon:publish'
  | 'hackathon:view'
  
  // Submissions & Projects
  | 'submission:create'
  | 'submission:update'
  | 'submission:delete'
  | 'submission:view'
  
  // Judging & Calibration
  | 'judging:assign'
  | 'judging:submit_score'
  | 'judging:calibrate'
  | 'judging:view_results'
  
  // Mentorship & Support
  | 'mentor:claim_ticket'
  | 'mentor:view_requests'
  
  // Sponsorship
  | 'sponsor:view_analytics'
  | 'sponsor:manage_prizes';

export const ROLE_PERMISSIONS: Record<RoleName, PermissionAction[]> = {
  [RoleName.ADMIN]: [
    'system:manage',
    'audit:read',
    'audit:export',
    'hackathon:create',
    'hackathon:update',
    'hackathon:delete',
    'hackathon:publish',
    'hackathon:view',
    'submission:create',
    'submission:update',
    'submission:delete',
    'submission:view',
    'judging:assign',
    'judging:submit_score',
    'judging:calibrate',
    'judging:view_results',
    'mentor:claim_ticket',
    'mentor:view_requests',
    'sponsor:view_analytics',
    'sponsor:manage_prizes',
  ],
  [RoleName.ORGANIZER]: [
    'audit:read',
    'hackathon:create',
    'hackathon:update',
    'hackathon:publish',
    'hackathon:view',
    'submission:view',
    'judging:assign',
    'judging:calibrate',
    'judging:view_results',
    'sponsor:view_analytics',
    'sponsor:manage_prizes',
  ],
  [RoleName.JUDGE]: [
    'hackathon:view',
    'submission:view',
    'judging:submit_score',
  ],
  [RoleName.PARTICIPANT]: [
    'hackathon:view',
    'submission:create',
    'submission:update',
    'submission:view',
  ],
  [RoleName.MENTOR]: [
    'hackathon:view',
    'submission:view',
    'mentor:claim_ticket',
    'mentor:view_requests',
  ],
  [RoleName.SPONSOR]: [
    'hackathon:view',
    'sponsor:view_analytics',
    'sponsor:manage_prizes',
  ],
};

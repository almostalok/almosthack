export type AuditTargetCategory =
  | 'ALL'
  | 'HACKATHON'
  | 'PARTICIPANT'
  | 'TEAM'
  | 'SUBMISSION'
  | 'EVALUATION'
  | 'RESULT'
  | 'CERTIFICATE'
  | 'ANNOUNCEMENT'
  | 'ORGANIZATION';

export type AuditDateRange = 'ALL' | 'TODAY' | '7D' | '30D' | 'CUSTOM';

export interface AuditLogActor {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  isSystem?: boolean;
}

export interface AuditFieldDiff {
  field: string;
  label: string;
  before: any;
  after: any;
}

export interface AuditLogItem {
  id: string;
  hackathonId?: string;
  organizationId?: string;
  actorId: string;
  actorEmail: string;
  actor: AuditLogActor;
  action: string;
  actionLabel: string;
  targetEntity: AuditTargetCategory;
  targetId: string;
  targetLabel: string;
  targetUrl?: string;
  diffs?: AuditFieldDiff[];
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  checksum: string;
  createdAt: string;
}

export interface AuditLogMetrics {
  totalEvents: number;
  configEvents: number;
  participantTeamEvents: number;
  judgingEvents: number;
  credentialBroadcastEvents: number;
}

export interface AuditLogFilterState {
  search: string;
  category: AuditTargetCategory;
  actorId: string;
  dateRange: AuditDateRange;
  page: number;
  limit: number;
}

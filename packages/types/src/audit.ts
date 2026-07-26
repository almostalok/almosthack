export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string; // e.g. 'judging.score_submitted', 'hackathon.created'
  targetEntity: string; // e.g. 'Submission', 'Hackathon'
  targetId: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

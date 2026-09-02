export type RegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WAITLISTED'
  | 'CHECKED_IN';

export interface ParticipantItem {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status: RegistrationStatus;
  registeredAt: string;
  college: string;
  branch: string;
  gradYear: number;
  skills: string[];
  bio?: string;
  githubHandle?: string;
  linkedinUrl?: string;
  trackId?: string;
  trackName?: string;
  teamId?: string;
  teamName?: string;
  teamRole?: 'CAPTAIN' | 'MEMBER';
  teamMemberCount?: number;
  teamStatus?: 'ACTIVE' | 'FORMING' | 'SUBMITTED';
  checkInStatus?: boolean;
  rejectionReason?: string;
  notes?: string;
}

export interface RegistrationMetrics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  waitlisted: number;
  checkedIn: number;
}

export interface RegistrationFilterState {
  search: string;
  status: string; // 'ALL' | RegistrationStatus
  teamStatus: string; // 'ALL' | 'HAS_TEAM' | 'NO_TEAM'
  trackId: string; // 'ALL' | trackId
  page: number;
  pageSize: number;
}

export interface BulkActionPayload {
  participantIds: string[];
  action: 'APPROVE' | 'REJECT' | 'WAITLIST';
  reason?: string;
}

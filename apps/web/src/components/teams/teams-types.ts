export type TeamStatus = 'ACTIVE' | 'LOCKED' | 'DISSOLVED';
export type TeamSizeStatus = 'COMPLETE' | 'INCOMPLETE' | 'BELOW_MIN' | 'FULL';

export interface TeamMemberItem {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  college?: string;
  branch?: string;
  skills: string[];
  role: 'CAPTAIN' | 'MEMBER';
  status: 'ACTIVE' | 'LEFT';
  joinedAt: string;
}

export interface TeamInvitationItem {
  id: string;
  inviteeUserId: string;
  inviteeName: string;
  inviteeEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  createdAt: string;
}

export interface TeamItem {
  id: string;
  hackathonId: string;
  name: string;
  slug: string;
  description?: string;
  trackId?: string;
  trackName?: string;
  status: TeamStatus;
  sizeStatus: TeamSizeStatus;
  memberCount: number;
  minTeamSize: number;
  maxTeamSize: number;
  captain: {
    id: string;
    userId: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  members: TeamMemberItem[];
  invitations: TeamInvitationItem[];
  submissionStatus?: 'SUBMITTED' | 'DRAFT' | 'NONE';
  submissionTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnassignedParticipantItem {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  college: string;
  branch: string;
  skills: string[];
  trackName?: string;
  registeredAt: string;
}

export interface TeamMetrics {
  totalTeams: number;
  completeTeams: number;
  incompleteTeams: number;
  soloTeams: number;
  unassignedParticipants: number;
  belowMinTeams: number;
}

export interface TeamFilterState {
  search: string;
  status: string; // 'ALL' | TeamStatus
  sizeFilter: string; // 'ALL' | 'FULL' | 'HAS_SLOTS' | 'BELOW_MIN'
  trackId: string; // 'ALL' | trackId
  tab: 'TEAMS' | 'UNASSIGNED';
  page: number;
  pageSize: number;
}

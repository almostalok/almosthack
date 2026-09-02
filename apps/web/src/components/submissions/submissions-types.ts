import { SubmissionStatus } from '@almosthack/types';
export type { SubmissionStatus };

export type SubmissionReadiness = 'READY' | 'NEEDS_ATTENTION' | 'INCOMPLETE';

export interface SubmissionMember {
  id: string;
  userId: string;
  name: string;
  role: 'CAPTAIN' | 'MEMBER';
}

export interface SubmissionRepositoryInfo {
  id: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  commitSha: string;
  isVerified: boolean;
  pushedAt?: string;
}

export interface SubmissionChecklist {
  descriptionComplete: boolean;
  repositoryConnected: boolean;
  demoUrlProvided: boolean;
  onTimeSubmission: boolean;
  integrityPassed: boolean;
}

export interface SubmissionItem {
  id: string;
  hackathonId: string;
  teamId: string;
  teamName: string;
  teamSlug: string;
  teamMembers: SubmissionMember[];
  title: string;
  description: string;
  trackId?: string;
  trackName?: string;
  challengeId?: string;
  challengeName?: string;
  status: SubmissionStatus;
  repository?: SubmissionRepositoryInfo | null;
  demoUrl?: string | null;
  documentationUrl?: string | null;
  videoUrl?: string | null;
  submittedAt?: string | null;
  isLate: boolean;
  lateDurationMinutes?: number;
  checks: SubmissionChecklist;
  integrityScore?: number;
  integrityStatus?: 'PASSED' | 'FLAGGED' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionMetrics {
  total: number;
  submitted: number;
  drafts: number;
  readyForJudging: number;
  needsAttention: number;
  late: number;
}

export interface SubmissionFilterState {
  search: string;
  status: string; // 'ALL' | SubmissionStatus
  trackId: string; // 'ALL' | trackId
  readiness: string; // 'ALL' | 'READY' | 'NEEDS_ATTENTION'
  repoFilter: string; // 'ALL' | 'VERIFIED' | 'MISSING'
  page: number;
  pageSize: number;
}

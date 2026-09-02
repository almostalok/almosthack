import {
  ResultSetStatus,
  ResultEligibilityStatus,
} from '@almosthack/types';

export type ResultsLifecycleStatus =
  | 'DRAFT'
  | 'CALCULATING'
  | 'READY_FOR_APPROVAL'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export interface AwardItem {
  id: string;
  name: string;
  category: 'OVERALL' | 'TRACK' | 'SPECIAL';
  description: string;
  prizeAmount?: string;
  winnerSubmissionId?: string;
  winnerProjectTitle?: string;
  winnerTeamName?: string;
  trackId?: string;
  trackName?: string;
}

export interface ResultRankingItem {
  id: string;
  submissionId: string;
  rank: number;
  projectTitle: string;
  teamName: string;
  teamSlug: string;
  trackId?: string;
  trackName: string;
  finalScore: number;
  maxScore: number;
  isTie: boolean;
  isDisqualified: boolean;
  disqualificationReason?: string;
  isFinalist: boolean;
  awards: AwardItem[];
  evaluationsCount: number;
  certificateEligible: boolean;
  demoUrl?: string;
  repositoryUrl?: string;
}

export interface ResultsReadinessSummary {
  isJudgingComplete: boolean;
  completedEvaluations: number;
  requiredEvaluations: number;
  unresolvedTiesCount: number;
  awardsAssignedCount: number;
  totalAwardsCount: number;
  isReadyForFinalization: boolean;
  isReadyForPublication: boolean;
}

export interface ResultsFilterState {
  tab: 'LEADERBOARD' | 'WINNERS' | 'AWARDS';
  trackId: string;
  search: string;
  statusFilter: string; // 'ALL' | 'WINNER' | 'FINALIST' | 'DISQUALIFIED'
  page: number;
  pageSize: number;
}

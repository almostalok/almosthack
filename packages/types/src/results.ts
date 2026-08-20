export enum ResultSetStatus {
  CALCULATED = 'CALCULATED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  SUPERSEDED = 'SUPERSEDED',
}

export enum ResultEligibilityStatus {
  ELIGIBLE = 'ELIGIBLE',
  INELIGIBLE = 'INELIGIBLE',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

export interface CriterionScoreBreakdown {
  criterionId: string;
  criterionName: string;
  weight: number;
  maxScore: number;
  averageScore: number;
}

export interface ScoreBreakdown {
  criteria: CriterionScoreBreakdown[];
  judgeCount: number;
  rawAveragePercentage: number;
  finalScore: number;
}

export interface ResultEntryEntity {
  id: string;
  resultSetId: string;
  teamId: string;
  teamName: string;
  teamSlug?: string;
  submissionId: string;
  submissionTitle: string;
  trackId?: string | null;
  trackName?: string | null;
  score: number;
  rank: number;
  eligibilityStatus: ResultEligibilityStatus;
  eligibilityReason?: string | null;
  isWinner: boolean;
  awardTitle?: string | null;
  judgeCount: number;
  scoreBreakdown?: ScoreBreakdown | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResultSetEntity {
  id: string;
  hackathonId: string;
  status: ResultSetStatus;
  calculationVersion: number;
  scoringConfigVersion: number;
  tieBreakRule: string;
  inputFingerprint: string;
  calculatedAt: string;
  approvedAt?: string | null;
  publishedAt?: string | null;
  approvedByUserId?: string | null;
  publishedByUserId?: string | null;
  metadata?: Record<string, unknown> | null;
  entries?: ResultEntryEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntryEntity {
  rank: number;
  teamId: string;
  teamName: string;
  teamSlug: string;
  submissionId: string;
  submissionTitle: string;
  trackId?: string | null;
  trackName?: string | null;
  score: number;
  isWinner: boolean;
  awardTitle?: string | null;
}

export interface LeaderboardResponseDto {
  hackathonId: string;
  hackathonName: string;
  isPublished: boolean;
  publishedAt?: string | null;
  totalEntries: number;
  entries: LeaderboardEntryEntity[];
}

export interface CalculateResultsOptions {
  forceRecalculate?: boolean;
}

export interface ApproveResultsDto {
  notes?: string;
}

export interface PublishResultsDto {
  notifyParticipants?: boolean;
}

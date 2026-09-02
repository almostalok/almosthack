import {
  JudgingCriterionEntity,
  JudgeAssignmentStatus,
  EvaluationStatus,
} from '@almosthack/types';

export type JudgingLifecycleState = 'NOT_STARTED' | 'OPEN' | 'PAUSED' | 'CLOSED';
export type JudgePerformanceStatus = 'ON_TRACK' | 'PENDING' | 'BEHIND' | 'COMPLETED';

export interface JudgeItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  organization?: string;
  assignedCount: number;
  completedCount: number;
  remainingCount: number;
  completionRate: number;
  status: JudgePerformanceStatus;
  isCalibrated: boolean;
  averageScoreGiven?: number;
  conflicts: { submissionId: string; projectTitle: string; reason: string }[];
}

export interface SubmissionJudgingItem {
  id: string;
  submissionId: string;
  projectTitle: string;
  teamName: string;
  teamSlug: string;
  trackName?: string;
  requiredEvaluations: number;
  completedEvaluations: number;
  assignedJudges: {
    judgeId: string;
    judgeName: string;
    status: JudgeAssignmentStatus;
    score?: number;
  }[];
  averageScore?: number;
  status: 'COMPLETE' | 'IN_PROGRESS' | 'NEEDS_JUDGES';
}

export interface EvaluationItem {
  id: string;
  assignmentId: string;
  submissionId: string;
  projectTitle: string;
  teamName: string;
  judgeUserId: string;
  judgeName: string;
  status: EvaluationStatus;
  totalScore: number;
  maxScore: number;
  generalFeedback?: string;
  criterionScores: {
    criterionId: string;
    criterionName: string;
    score: number;
    maxScore: number;
    weight: number;
    comment?: string;
  }[];
  submittedAt?: string;
  createdAt: string;
}

export interface JudgingMetrics {
  totalSubmissions: number;
  requiredEvaluations: number;
  completedEvaluations: number;
  remainingEvaluations: number;
  completionPercentage: number;
  totalJudges: number;
  calibratedJudges: number;
  submissionsNeedingAttention: number;
  activeConflicts: number;
}

export interface JudgingFilterState {
  tab: 'OVERVIEW' | 'JUDGES' | 'SUBMISSIONS' | 'EVALUATIONS';
  search: string;
  judgeStatus: string; // 'ALL' | JudgePerformanceStatus
  submissionStatus: string; // 'ALL' | 'COMPLETE' | 'IN_PROGRESS' | 'NEEDS_JUDGES'
  trackId: string;
  page: number;
  pageSize: number;
}

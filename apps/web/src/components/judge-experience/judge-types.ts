import {
  JudgeAssignmentEntity,
  JudgingCriterionEntity,
  SubmissionEntity,
  EvaluationScoreEntity,
  JudgeEvaluationEntity,
} from '@almosthack/types';

export type JudgeAssignmentFilterStatus =
  | 'ALL'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REVOKED';

export type JudgeAssignmentStatus = JudgeAssignmentFilterStatus;

export interface JudgeScoreState {
  score: number;
  comment?: string;
}

export interface JudgeMetrics {
  totalAssigned: number;
  inProgress: number;
  completed: number;
  conflicts: number;
  progressPercent: number;
}

export interface JudgeFilterState {
  search: string;
  status: JudgeAssignmentFilterStatus;
  trackId: string;
  sortBy: 'assignedAt' | 'title' | 'status';
}

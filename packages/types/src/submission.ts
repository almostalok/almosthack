export type SubmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'FINALIZED'
  | 'WITHDRAWN';

export type JudgeAssignmentStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REVOKED';

export type EvaluationStatus = 'DRAFT' | 'SUBMITTED';

export interface SubmissionEntity {
  id: string;
  hackathonId: string;
  teamId: string;
  trackId?: string | null;
  challengeId?: string | null;
  repositoryId?: string | null;
  title: string;
  description?: string | null;
  demoUrl?: string | null;
  documentationUrl?: string | null;
  commitSha?: string | null;
  snapshotBranch?: string | null;
  snapshotCapturedAt?: string | null;
  status: SubmissionStatus;
  submittedAt?: string | null;
  finalizedAt?: string | null;
  withdrawnAt?: string | null;
  createdAt: string;
  updatedAt: string;
  team?: {
    id: string;
    name: string;
    slug: string;
  };
  track?: {
    id: string;
    name: string;
  } | null;
  challenge?: {
    id: string;
    name: string;
  } | null;
  repository?: {
    id: string;
    repositoryFullName: string;
    repositoryUrl: string;
    defaultBranch: string;
  } | null;
}

export interface JudgingCriterionEntity {
  id: string;
  hackathonId: string;
  name: string;
  description?: string | null;
  weight: number;
  maxScore: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface JudgeAssignmentEntity {
  id: string;
  hackathonId: string;
  submissionId: string;
  judgeUserId: string;
  assignedByUserId: string;
  status: JudgeAssignmentStatus;
  assignedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  submission?: SubmissionEntity;
  judgeUser?: {
    id: string;
    name: string;
    email: string;
  };
  evaluation?: JudgeEvaluationEntity | null;
}

export interface EvaluationScoreEntity {
  id: string;
  evaluationId: string;
  criterionId: string;
  score: number;
  comment?: string | null;
  criterion?: JudgingCriterionEntity;
}

export interface JudgeEvaluationEntity {
  id: string;
  assignmentId: string;
  submissionId: string;
  judgeUserId: string;
  status: EvaluationStatus;
  generalFeedback?: string | null;
  totalScore?: number | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  scores?: EvaluationScoreEntity[];
  submission?: SubmissionEntity;
}

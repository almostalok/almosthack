export type ScorePublicationStatus = 'FINAL' | 'PROVISIONAL' | 'PENDING_PUBLICATION' | 'NOT_STARTED';

export interface TransparentCriterionScore {
  criterionId: string;
  name: string;
  description?: string;
  weight: number; // e.g. 0.40
  weightPercentage: number; // e.g. 40
  rawScore: number;
  maxRawScore: number;
  weightedScore: number;
  maxWeightedScore: number;
  percentageAchieved: number;
}

export interface ReviewerFeedbackItem {
  id: string;
  reviewerDisplay: string; // "Verified Reviewer #1" or judge name in organizer view
  reviewerRole?: string;
  isAnonymized: boolean;
  submittedAt: string;
  generalComment?: string;
  criterionComments: {
    criterionName: string;
    comment: string;
  }[];
}

export interface EvaluationTimelineStep {
  id: string;
  title: string;
  timestamp?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  description: string;
}

export interface TransparentSubmissionData {
  submissionId: string;
  projectTitle: string;
  tagline?: string;
  teamName: string;
  teamSlug: string;
  trackName: string;
  repositoryUrl?: string;
  demoUrl?: string;
  status: ScorePublicationStatus;
  finalScore: number;
  maxScore: number;
  rank?: number;
  totalRanked?: number;
  completedEvaluations: number;
  requiredEvaluations: number;
  isPublished: boolean;
  publishedAt?: string;
  criteriaBreakdown: TransparentCriterionScore[];
  feedbackList: ReviewerFeedbackItem[];
  timeline: EvaluationTimelineStep[];
  guarantees: {
    isAnonymized: boolean;
    criteriaAuditVerified: boolean;
    weightsNormalized: boolean;
    calibrationApplied: boolean;
  };
}

export interface TransparentJudgingFilterState {
  viewMode: 'PARTICIPANT' | 'ORGANIZER_AUDIT';
  selectedSubmissionId: string;
}

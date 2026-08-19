export type IntegrityAnalysisStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type IntegrityFindingType =
  | 'CODE_SIMILARITY'
  | 'FILE_OVERLAP'
  | 'STRUCTURAL_SIMILARITY'
  | 'SUSPICIOUS_COPY_PATTERN';

export type IntegrityFindingStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'CONFIRMED'
  | 'DISMISSED';

export type IntegritySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface IntegrityEvidenceEntity {
  id: string;
  findingId: string;
  sourcePath: string;
  targetPath: string;
  sourceStart: number;
  sourceEnd: number;
  targetStart: number;
  targetEnd: number;
  matchedFragmentHash?: string | null;
  similarityMetric?: number | null;
  sourceSnippet?: string | null;
  targetSnippet?: string | null;
  createdAt: string;
}

export interface IntegrityReviewEntity {
  id: string;
  findingId: string;
  reviewerId: string;
  fromStatus: IntegrityFindingStatus;
  toStatus: IntegrityFindingStatus;
  reason: string;
  notes?: string | null;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface IntegrityFindingEntity {
  id: string;
  analysisId: string;
  submissionId: string;
  comparisonSubmissionId: string;
  type: IntegrityFindingType;
  severity: IntegritySeverity;
  confidence: number;
  similarity: number;
  status: IntegrityFindingStatus;
  summary: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  evidence?: IntegrityEvidenceEntity[];
  reviews?: IntegrityReviewEntity[];
  submission?: {
    id: string;
    title: string;
    teamId: string;
    team?: {
      id: string;
      name: string;
    };
  };
  comparisonSubmission?: {
    id: string;
    title: string;
    teamId: string;
    team?: {
      id: string;
      name: string;
    };
  };
}

export interface IntegrityAnalysisEntity {
  id: string;
  hackathonId: string;
  submissionId: string;
  repositoryId?: string | null;
  commitSha: string;
  status: IntegrityAnalysisStatus;
  engineVersion: string;
  configurationVersion: number;
  summary?: Record<string, any> | null;
  failureReason?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  findings?: IntegrityFindingEntity[];
  submission?: {
    id: string;
    title: string;
    teamId: string;
    team?: {
      id: string;
      name: string;
    };
  };
}

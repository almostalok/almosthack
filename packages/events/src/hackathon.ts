import { HackathonStatus } from '@almosthack/types';

export interface HackathonCreatedPayload {
  hackathonId: string;
  organizationId: string;
  name: string;
  slug: string;
  timezone: string;
  status: HackathonStatus;
  createdBy: string;
  createdAt: string;
}

export interface HackathonUpdatedPayload {
  hackathonId: string;
  organizationId: string;
  updatedFields: string[];
  updatedBy: string;
  updatedAt: string;
}

export interface HackathonPublishedPayload {
  hackathonId: string;
  organizationId: string;
  publishedBy: string;
  publishedAt: string;
}

export interface HackathonArchivedPayload {
  hackathonId: string;
  organizationId: string;
  archivedBy: string;
  archivedAt: string;
}

export interface HackathonConfigurationCreatedPayload {
  hackathonId: string;
  organizationId: string;
  createdAt: string;
}

export interface HackathonConfigurationUpdatedPayload {
  hackathonId: string;
  organizationId: string;
  updatedFields: string[];
  updatedBy: string;
  updatedAt: string;
}

export interface HackathonRulesUpdatedPayload {
  hackathonId: string;
  organizationId: string;
  updatedBy: string;
  updatedAt: string;
}

export interface HackathonTrackCreatedPayload {
  trackId: string;
  hackathonId: string;
  organizationId: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}

export interface HackathonTrackUpdatedPayload {
  trackId: string;
  hackathonId: string;
  organizationId: string;
  updatedFields: string[];
  updatedBy: string;
  updatedAt: string;
}

export interface HackathonTrackDeletedPayload {
  trackId: string;
  hackathonId: string;
  organizationId: string;
  deletedBy: string;
  deletedAt: string;
}

export interface HackathonTracksReorderedPayload {
  hackathonId: string;
  organizationId: string;
  reorderedBy: string;
  reorderedAt: string;
}

export interface HackathonChallengeCreatedPayload {
  challengeId: string;
  trackId: string;
  hackathonId: string;
  organizationId: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}

export interface HackathonChallengeUpdatedPayload {
  challengeId: string;
  trackId: string;
  hackathonId: string;
  organizationId: string;
  updatedFields: string[];
  updatedBy: string;
  updatedAt: string;
}

export interface HackathonChallengeDeletedPayload {
  challengeId: string;
  trackId: string;
  hackathonId: string;
  organizationId: string;
  deletedBy: string;
  deletedAt: string;
}

export interface HackathonChallengesReorderedPayload {
  trackId: string;
  hackathonId: string;
  organizationId: string;
  reorderedBy: string;
  reorderedAt: string;
}

// ==========================================
// S2-04: PARTICIPANT REGISTRATION EVENTS
// ==========================================

export interface ParticipantRegistrationCreatedPayload {
  registrationId: string;
  hackathonId: string;
  userId: string;
  trackId: string | null;
  challengeId: string | null;
  registeredAt: string;
}

export interface ParticipantRegistrationUpdatedPayload {
  registrationId: string;
  hackathonId: string;
  userId: string;
  trackId: string | null;
  challengeId: string | null;
  updatedAt: string;
}

export interface ParticipantRegistrationWithdrawnPayload {
  registrationId: string;
  hackathonId: string;
  userId: string;
  withdrawnAt: string;
}

// ==========================================
// S2-05: TEAMS & TEAM FORMATION EVENTS
// ==========================================

export interface TeamCreatedPayload {
  teamId: string;
  hackathonId: string;
  name: string;
  slug: string;
  captainUserId: string;
  createdAt: string;
}

export interface TeamUpdatedPayload {
  teamId: string;
  hackathonId: string;
  updatedFields: string[];
  updatedBy: string;
  updatedAt: string;
}

export interface TeamMemberJoinedPayload {
  teamId: string;
  hackathonId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface TeamMemberLeftPayload {
  teamId: string;
  hackathonId: string;
  userId: string;
  leftAt: string;
}

export interface TeamMemberRemovedPayload {
  teamId: string;
  hackathonId: string;
  userId: string;
  removedBy: string;
  removedAt: string;
}

export interface TeamInvitationCreatedPayload {
  invitationId: string;
  teamId: string;
  hackathonId: string;
  inviteeUserId: string;
  invitedByUserId: string;
  createdAt: string;
}

export interface TeamInvitationAcceptedPayload {
  invitationId: string;
  teamId: string;
  hackathonId: string;
  inviteeUserId: string;
  acceptedAt: string;
}

export interface TeamInvitationDeclinedPayload {
  invitationId: string;
  teamId: string;
  hackathonId: string;
  inviteeUserId: string;
  declinedAt: string;
}

export interface TeamInvitationCancelledPayload {
  invitationId: string;
  teamId: string;
  hackathonId: string;
  cancelledBy: string;
  cancelledAt: string;
}

export interface TeamCaptainTransferredPayload {
  teamId: string;
  hackathonId: string;
  oldCaptainUserId: string;
  newCaptainUserId: string;
  transferredAt: string;
}

export interface TeamDissolvedPayload {
  teamId: string;
  hackathonId: string;
  dissolvedBy: string;
  dissolvedAt: string;
}

// ==========================================
// S2-06: GITHUB INTEGRATION & REPOSITORY EVENTS
// ==========================================

export interface GitHubAccountConnectedPayload {
  userId: string;
  githubUserId: string;
  githubUsername: string;
  connectedAt: string;
}

export interface GitHubAccountDisconnectedPayload {
  userId: string;
  githubUserId: string;
  disconnectedAt: string;
}

export interface TeamRepositoryCreatedPayload {
  teamId: string;
  repositoryId: string;
  repositoryFullName: string;
  repositoryUrl: string;
  createdBy: string;
  createdAt: string;
}

export interface TeamRepositoryConnectedPayload {
  teamId: string;
  repositoryId: string;
  repositoryFullName: string;
  repositoryUrl: string;
  connectedBy: string;
  connectedAt: string;
}

export interface TeamRepositoryDisconnectedPayload {
  teamId: string;
  repositoryId: string;
  disconnectedBy: string;
  disconnectedAt: string;
}

// ==========================================
// S3: SUBMISSIONS & JUDGING EVENTS
// ==========================================

export interface SubmissionCreatedPayload {
  submissionId: string;
  hackathonId: string;
  teamId: string;
  title: string;
  createdAt: string;
}

export interface SubmissionUpdatedPayload {
  submissionId: string;
  hackathonId: string;
  teamId: string;
  updatedFields: string[];
  updatedAt: string;
}

export interface SubmissionFinalizedPayload {
  submissionId: string;
  hackathonId: string;
  teamId: string;
  commitSha: string | null;
  finalizedAt: string;
}

export interface SubmissionWithdrawnPayload {
  submissionId: string;
  hackathonId: string;
  teamId: string;
  withdrawnAt: string;
}

export interface JudgeAssignedPayload {
  assignmentId: string;
  hackathonId: string;
  submissionId: string;
  judgeUserId: string;
  assignedByUserId: string;
  assignedAt: string;
}

export interface JudgeAssignmentRevokedPayload {
  assignmentId: string;
  hackathonId: string;
  submissionId: string;
  judgeUserId: string;
  revokedAt: string;
}

export interface EvaluationSubmittedPayload {
  evaluationId: string;
  assignmentId: string;
  submissionId: string;
  judgeUserId: string;
  totalScore: number;
  submittedAt: string;
}

// ==========================================
// S4: INTEGRITY & FORENSICS EVENTS
// ==========================================

export interface IntegrityAnalysisStartedPayload {
  analysisId: string;
  hackathonId: string;
  submissionId: string;
  commitSha: string;
  startedAt: string;
}

export interface IntegrityAnalysisCompletedPayload {
  analysisId: string;
  hackathonId: string;
  submissionId: string;
  findingsCount: number;
  completedAt: string;
}

export interface IntegrityAnalysisFailedPayload {
  analysisId: string;
  hackathonId: string;
  submissionId: string;
  reason: string;
  failedAt: string;
}

export interface IntegrityFindingCreatedPayload {
  findingId: string;
  analysisId: string;
  submissionId: string;
  comparisonSubmissionId: string;
  type: string;
  severity: string;
  confidence: number;
  similarity: number;
  createdAt: string;
}

export interface IntegrityFindingConfirmedPayload {
  findingId: string;
  reviewerId: string;
  reason: string;
  confirmedAt: string;
}

export interface IntegrityFindingDismissedPayload {
  findingId: string;
  reviewerId: string;
  reason: string;
  dismissedAt: string;
}






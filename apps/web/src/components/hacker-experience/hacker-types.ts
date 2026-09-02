import {
  HackathonEntity,
  TeamEntity,
  TeamMemberEntity,
  TeamInvitationEntity,
  SubmissionEntity,
  HackathonStatus,
  JudgingCriterionEntity,
  AnnouncementEntity,
} from '@almosthack/types';
import { CertificateItem } from '../certificates/certificates-types';

export type HackerNextActionType =
  | 'COMPLETE_REGISTRATION'
  | 'CREATE_OR_JOIN_TEAM'
  | 'CONNECT_REPOSITORY'
  | 'COMPLETE_SUBMISSION'
  | 'SUBMIT_PROJECT'
  | 'AWAIT_JUDGING'
  | 'VIEW_RESULTS'
  | 'DOWNLOAD_CERTIFICATE';

export interface HackerNextAction {
  type: HackerNextActionType;
  title: string;
  description: string;
  actionLabel: string;
  actionTarget: 'team' | 'submission' | 'registration' | 'judging' | 'results' | 'certificates';
  progressPercent?: number;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
}

export interface HackerMilestoneState {
  registration: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  team: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  repository: 'COMPLETED' | 'PENDING';
  submission: {
    status: 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW';
    completionPercent: number;
    completedItems: number;
    totalItems: number;
  };
  judging: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  results: 'UNPUBLISHED' | 'PUBLISHED';
  certificate: 'NONE' | 'ELIGIBLE' | 'ISSUED';
}

export interface HackerSubmissionFormState {
  title: string;
  description: string;
  trackId: string;
  demoUrl: string;
  videoUrl: string;
  repositoryUrl: string;
}

export type { CertificateItem };

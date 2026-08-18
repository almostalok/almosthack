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



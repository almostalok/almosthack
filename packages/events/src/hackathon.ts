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

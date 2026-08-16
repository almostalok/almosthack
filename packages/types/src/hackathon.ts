export enum HackathonStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum RegistrationStatus {
  NOT_OPEN = 'NOT_OPEN',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum HackathonVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export interface HackathonEntity {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  timezone: string;
  status: HackathonStatus;
  visibility: HackathonVisibility;
  registrationStartsAt: string;
  registrationEndsAt: string;
  startsAt: string;
  endsAt: string;
  publishedAt: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HackathonLifecycleResponse {
  hackathonId: string;
  hackathonStatus: HackathonStatus;
  registrationStatus: RegistrationStatus;
  now: string;
  timezone: string;
  publishedAt: string | null;
  completedAt: string | null;
  archivedAt: string | null;
}

export interface CreateHackathonInput {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  timezone?: string;
  registrationStartsAt: string;
  registrationEndsAt: string;
  startsAt: string;
  endsAt: string;
}

export interface UpdateHackathonInput {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  timezone?: string;
  registrationStartsAt?: string;
  registrationEndsAt?: string;
  startsAt?: string;
  endsAt?: string;
}

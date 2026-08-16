import { HackathonStatus, RegistrationStatus, HackathonVisibility } from '@almosthack/types';

export interface HackathonResponseDto {
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

export interface HackathonLifecycleResponseDto {
  hackathonId: string;
  hackathonStatus: HackathonStatus;
  registrationStatus: RegistrationStatus;
  now: string;
  timezone: string;
  publishedAt: string | null;
  completedAt: string | null;
  archivedAt: string | null;
}

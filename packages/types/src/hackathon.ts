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
export enum ParticipationMode {
  INDIVIDUAL = 'INDIVIDUAL',
  TEAM = 'TEAM',
  BOTH = 'BOTH',
}

export enum EligibilityType {
  OPEN = 'OPEN',
  STUDENTS_ONLY = 'STUDENTS_ONLY',
  INVITE_ONLY = 'INVITE_ONLY',
}

export enum AIUsagePolicy {
  ALLOWED = 'ALLOWED',
  RESTRICTED = 'RESTRICTED',
  PROHIBITED = 'PROHIBITED',
}

export enum PreExistingCodePolicy {
  PROHIBITED = 'PROHIBITED',
  ALLOWED = 'ALLOWED',
  ALLOWED_WITH_DISCLOSURE = 'ALLOWED_WITH_DISCLOSURE',
}

export enum OpenSourcePolicy {
  ALLOWED = 'ALLOWED',
  ALLOWED_WITH_ATTRIBUTION = 'ALLOWED_WITH_ATTRIBUTION',
  RESTRICTED = 'RESTRICTED',
  PROHIBITED = 'PROHIBITED',
}

export enum RepositoryPolicy {
  PLATFORM_MANAGED = 'PLATFORM_MANAGED',
  EXTERNAL_ALLOWED = 'EXTERNAL_ALLOWED',
}

export interface HackathonConfigurationEntity {
  id: string;
  hackathonId: string;
  participationMode: ParticipationMode;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  eligibilityType: EligibilityType;
  allowedBranches: string[];
  allowedColleges: string[];
  graduationYearFrom: number | null;
  graduationYearTo: number | null;
  aiUsagePolicy: AIUsagePolicy;
  aiDisclosureRequired: boolean;
  preExistingCodePolicy: PreExistingCodePolicy;
  openSourcePolicy: OpenSourcePolicy;
  githubRequired: boolean;
  repositoryPolicy: RepositoryPolicy;
  rulesMarkdown: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateHackathonConfigurationInput {
  participationMode?: ParticipationMode;
  minTeamSize?: number | null;
  maxTeamSize?: number | null;
  eligibilityType?: EligibilityType;
  allowedBranches?: string[];
  allowedColleges?: string[];
  graduationYearFrom?: number | null;
  graduationYearTo?: number | null;
  aiUsagePolicy?: AIUsagePolicy;
  aiDisclosureRequired?: boolean;
  preExistingCodePolicy?: PreExistingCodePolicy;
  openSourcePolicy?: OpenSourcePolicy;
  githubRequired?: boolean;
  repositoryPolicy?: RepositoryPolicy;
}

export interface UpdateHackathonRulesInput {
  rulesMarkdown?: string | null;
}

export interface HackathonRulesResponse {
  hackathonId: string;
  hackathonName: string;
  participationMode: ParticipationMode;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  eligibilityType: EligibilityType;
  allowedBranches: string[];
  allowedColleges: string[];
  graduationYearFrom: number | null;
  graduationYearTo: number | null;
  aiUsagePolicy: AIUsagePolicy;
  aiDisclosureRequired: boolean;
  preExistingCodePolicy: PreExistingCodePolicy;
  openSourcePolicy: OpenSourcePolicy;
  githubRequired: boolean;
  repositoryPolicy: RepositoryPolicy;
  rulesMarkdown: string | null;
  updatedAt: string;
}

export enum ChallengeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface ChallengeResource {
  title: string;
  url: string;
}

export interface HackathonTrackEntity {
  id: string;
  hackathonId: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  challengesCount?: number;
  challenges?: HackathonChallengeEntity[];
}

export interface HackathonChallengeEntity {
  id: string;
  trackId: string;
  name: string;
  slug: string;
  description: string | null;
  problemStatement: string;
  requirements: string | null;
  constraints: string | null;
  expectedOutcome: string | null;
  resources: ChallengeResource[];
  displayOrder: number;
  status: ChallengeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackInput {
  name: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateTrackInput {
  name?: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ReorderItemInput {
  id: string;
  displayOrder: number;
}

export interface ReorderTracksInput {
  items: ReorderItemInput[];
}

export interface CreateChallengeInput {
  name: string;
  slug?: string;
  description?: string | null;
  problemStatement: string;
  requirements?: string | null;
  constraints?: string | null;
  expectedOutcome?: string | null;
  resources?: ChallengeResource[];
  displayOrder?: number;
  status?: ChallengeStatus;
}

export interface UpdateChallengeInput {
  name?: string;
  slug?: string;
  description?: string | null;
  problemStatement?: string;
  requirements?: string | null;
  constraints?: string | null;
  expectedOutcome?: string | null;
  resources?: ChallengeResource[];
  displayOrder?: number;
  status?: ChallengeStatus;
}

export interface ReorderChallengesInput {
  items: ReorderItemInput[];
}


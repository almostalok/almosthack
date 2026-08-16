import { OrganizationRole, OrganizationMemberStatus } from './rbac';

export { OrganizationRole, OrganizationMemberStatus };

export interface Organization {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface OrganizationMemberUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  status: OrganizationMemberStatus;
  joinedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: OrganizationMemberUser;
}

export interface UserOrganizationSummary {
  organization: Organization;
  role: OrganizationRole;
  status: OrganizationMemberStatus;
  joinedAt: Date | string;
}

import { OrganizationRole, OrganizationMemberStatus } from '@almosthack/types';

export interface OrganizationCreatedPayload {
  organizationId: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface OrganizationUpdatedPayload {
  organizationId: string;
  name?: string;
  slug?: string;
  updatedFields: string[];
  updatedAt: string;
}

export interface OrganizationDeletedPayload {
  organizationId: string;
  slug: string;
  deletedAt: string;
}

export interface OrganizationMemberAddedPayload {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  status: OrganizationMemberStatus;
  addedBy: string;
  joinedAt: string;
}

export interface OrganizationMemberRemovedPayload {
  organizationId: string;
  userId: string;
  removedBy: string;
  removedAt: string;
}

export interface OrganizationMemberRoleChangedPayload {
  organizationId: string;
  userId: string;
  previousRole: OrganizationRole;
  newRole: OrganizationRole;
  changedBy: string;
  changedAt: string;
}

export interface OrganizationOwnershipTransferredPayload {
  organizationId: string;
  previousOwnerId: string;
  newOwnerId: string;
  transferredAt: string;
}

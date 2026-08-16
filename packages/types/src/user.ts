import { RoleName } from './rbac';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  college?: string | null;
  branch?: string | null;
  graduationYear?: number | null;
  skills: string[];
  githubUsername?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  roles: RoleName[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  college?: string | null;
  branch?: string | null;
  graduationYear?: number | null;
  skills?: string[];
  githubUsername?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
}


import { RoleName } from './rbac';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  githubUsername?: string;
  roles: RoleName[];
  createdAt: string;
  updatedAt: string;
}

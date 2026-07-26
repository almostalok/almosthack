import { RoleName } from './rbac';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    roles: RoleName[];
  };
  accessToken: string;
  expiresAt: string;
}

export type OAuthProvider = 'github' | 'google';

export interface LoginPayload {
  email: string;
  password?: string;
  provider?: OAuthProvider;
  code?: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password?: string;
}

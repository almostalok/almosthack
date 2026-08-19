export type RepositoryStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface GitHubConnectionStatus {
  isConnected: boolean;
  githubUsername?: string | null;
  githubAvatarUrl?: string | null;
  connectedAt?: string | null;
}

export interface TeamRepositoryEntity {
  id: string;
  teamId: string;
  provider: string;
  providerRepositoryId: string;
  ownerLogin: string;
  repositoryName: string;
  repositoryFullName: string;
  repositoryUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  status: RepositoryStatus;
  connectedAt: string;
  createdAt: string;
  updatedAt: string;
  disconnectedAt?: string | null;
}

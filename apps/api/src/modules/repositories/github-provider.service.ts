import {
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  BadGatewayException,
} from '@nestjs/common';

export interface GitHubUserResponse {
  id: number;
  login: string;
  avatar_url: string;
  email?: string | null;
  name?: string | null;
}

export interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
  };
  permissions?: {
    admin?: boolean;
    push?: boolean;
    pull?: boolean;
  };
}

@Injectable()
export class GitHubProviderService {
  private readonly logger = new Logger(GitHubProviderService.name);

  private get clientId(): string {
    return process.env.GITHUB_CLIENT_ID || 'mock_github_client_id';
  }

  private get clientSecret(): string {
    return process.env.GITHUB_CLIENT_SECRET || 'mock_github_client_secret';
  }

  public getOAuthAuthorizationUrl(state: string, redirectUri?: string): string {
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const params = new URLSearchParams({
      client_id: this.clientId,
      state,
      scope: 'user:email public_repo',
    });

    if (redirectUri) {
      params.append('redirect_uri', redirectUri);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  public async exchangeCodeForToken(code: string, redirectUri?: string): Promise<{ accessToken: string; tokenType: string; scope: string }> {
    const url = 'https://github.com/login/oauth/access_token';
    const payload: Record<string, string> = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
    };

    if (redirectUri) {
      payload.redirect_uri = redirectUri;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'AlmostHack-App',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new BadGatewayException({
          code: 'GITHUB_OAUTH_FAILED',
          message: 'Failed to exchange authorization code with GitHub.',
        });
      }

      const data = (await response.json()) as any;

      if (data.error || !data.access_token) {
        this.logger.warn(`GitHub OAuth token exchange error: ${data.error_description || data.error || 'Unknown error'}`);
        throw new UnauthorizedException({
          code: 'INVALID_OAUTH_CODE',
          message: data.error_description || 'Invalid or expired authorization code.',
        });
      }

      return {
        accessToken: data.access_token,
        tokenType: data.token_type || 'bearer',
        scope: data.scope || '',
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadGatewayException) {
        throw err;
      }
      this.logger.error(`GitHub OAuth code exchange network error: ${err.message}`);
      throw new BadGatewayException({
        code: 'GITHUB_UNAVAILABLE',
        message: 'Unable to communicate with GitHub OAuth service.',
      });
    }
  }

  public async getAuthenticatedUser(accessToken: string): Promise<GitHubUserResponse> {
    return this.githubFetch<GitHubUserResponse>('/user', accessToken);
  }

  public async createRepository(
    accessToken: string,
    options: { name: string; description?: string; isPrivate?: boolean }
  ): Promise<GitHubRepoResponse> {
    return this.githubFetch<GitHubRepoResponse>('/user/repos', accessToken, {
      method: 'POST',
      body: JSON.stringify({
        name: options.name,
        description: options.description || 'Repository provisioned by AlmostHack',
        private: options.isPrivate ?? false,
        auto_init: true,
      }),
    });
  }

  public async getRepository(accessToken: string, owner: string, repo: string): Promise<GitHubRepoResponse> {
    return this.githubFetch<GitHubRepoResponse>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, accessToken);
  }

  public async verifyRepositoryAccess(accessToken: string, owner: string, repo: string): Promise<GitHubRepoResponse> {
    const repository = await this.getRepository(accessToken, owner, repo);

    // Verify user has push or admin permissions on the repository
    if (repository.permissions && !repository.permissions.push && !repository.permissions.admin) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_REPO_PERMISSIONS',
        message: `You do not have write/push access to repository '${owner}/${repo}'.`,
      });
    }

    return repository;
  }

  public async revokeToken(accessToken: string): Promise<void> {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return;
    }

    const url = `https://api.github.com/applications/${this.clientId}/grant`;
    try {
      const authHeader = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`;
      await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'AlmostHack-App',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });
    } catch (err: any) {
      this.logger.warn(`Failed to revoke GitHub token remotely: ${err.message}`);
    }
  }

  private async githubFetch<T>(
    path: string,
    accessToken: string,
    init?: RequestInit
  ): Promise<T> {
    const url = `https://api.github.com${path.startsWith('/') ? path : `/${path}`}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'AlmostHack-App',
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });

      if (!response.ok) {
        await this.handleGitHubErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (
        err instanceof UnauthorizedException ||
        err instanceof ForbiddenException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException ||
        err instanceof UnprocessableEntityException ||
        err instanceof BadGatewayException
      ) {
        throw err;
      }

      this.logger.error(`GitHub API HTTP request failed: ${err.message}`);
      throw new BadGatewayException({
        code: 'GITHUB_API_ERROR',
        message: 'Failed to communicate with GitHub API.',
      });
    }
  }

  private async handleGitHubErrorResponse(response: Response): Promise<never> {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // Body not JSON
    }

    const status = response.status;
    const message = errorData?.message || `GitHub returned status ${status}`;

    if (status === 401) {
      throw new UnauthorizedException({
        code: 'GITHUB_TOKEN_EXPIRED',
        message: 'Your GitHub access token is invalid or has expired. Please reconnect your GitHub account.',
      });
    }

    if (status === 403) {
      throw new ForbiddenException({
        code: 'GITHUB_FORBIDDEN',
        message: `GitHub access denied: ${message}`,
      });
    }

    if (status === 404) {
      throw new NotFoundException({
        code: 'GITHUB_RESOURCE_NOT_FOUND',
        message: 'Target GitHub user or repository was not found.',
      });
    }

    if (status === 409 || status === 422) {
      throw new ConflictException({
        code: 'GITHUB_REPOSITORY_EXISTS',
        message: `GitHub repository error: ${message}`,
      });
    }

    throw new BadGatewayException({
      code: 'GITHUB_PROVIDER_ERROR',
      message: `GitHub provider error (${status}): ${message}`,
    });
  }
}

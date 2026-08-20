import { ApiClientConfig, RequestOptions, ApiSuccessResponse, ApiErrorResponse } from './types';
import { ApiClientError } from './errors';

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly credentials?: RequestCredentials;
  private readonly fetchImpl: typeof fetch;

  constructor(config: ApiClientConfig) {
    if (!config || !config.baseUrl) {
      throw new Error('ApiClient requires a valid baseUrl in configuration.');
    }
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.defaultHeaders = config.defaultHeaders || {};
    this.timeoutMs = config.timeout ?? 10000;
    this.credentials = config.credentials ?? 'include';
    const rawFetch = config.fetch || (typeof fetch !== 'undefined' ? fetch : (globalThis.fetch as typeof fetch));
    this.fetchImpl = rawFetch ? rawFetch.bind(typeof window !== 'undefined' ? window : globalThis) : rawFetch;

    if (!this.fetchImpl) {
      throw new Error('No global fetch implementation found. Pass a fetch implementation in ApiClientConfig.');
    }
  }

  private generateRequestId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `req_${Date.now()}_${performance.now().toString(36).replace('.', '')}`;
  }

  private buildUrl(path: string, params?: RequestOptions['params']): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fullUrl.searchParams.append(key, String(value));
        }
      });
    }

    return fullUrl.toString();
  }

  public async request<T>(
    path: string,
    options: RequestOptions & { method: string; body?: unknown }
  ): Promise<T> {
    const requestId = options.requestId || this.generateRequestId();
    const url = this.buildUrl(path, options.params);
    const timeout = options.timeout ?? this.timeoutMs;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...this.defaultHeaders,
      ...options.headers,
    };

    const controller = new AbortController();
    let isTimedOut = false;

    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      controller.abort();
    }, timeout);

    // Merge caller signal if provided
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await this.fetchImpl(url, {
        method: options.method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        credentials: options.credentials ?? this.credentials ?? 'include',
      });

      clearTimeout(timeoutId);

      const responseRequestId = response.headers.get('x-request-id') || requestId;

      let responseData: unknown = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else {
        const text = await response.text();
        if (text) {
          try {
            responseData = JSON.parse(text);
          } catch {
            responseData = text;
          }
        }
      }

      if (!response.ok) {
        let code = 'HTTP_ERROR';
        let message = `Request failed with status ${response.status}`;
        let details: unknown = undefined;

        if (responseData && typeof responseData === 'object') {
          const errObj = responseData as ApiErrorResponse;
          if (errObj.error && typeof errObj.error === 'object') {
            code = errObj.error.code || code;
            message = errObj.error.message || message;
            details = errObj.error.details;
          }
        }

        throw new ApiClientError({
          status: response.status,
          code,
          message,
          requestId: responseRequestId,
          details,
        });
      }

      // Check if response conforms to Standard ApiSuccessResponse { success: true, data: T }
      if (
        responseData &&
        typeof responseData === 'object' &&
        'success' in responseData &&
        (responseData as ApiSuccessResponse<T>).success === true &&
        'data' in responseData
      ) {
        return (responseData as ApiSuccessResponse<T>).data;
      }

      return responseData as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ApiClientError) {
        throw err;
      }

      if (isTimedOut || (err instanceof Error && err.name === 'AbortError')) {
        throw new ApiClientError({
          status: 408,
          code: 'REQUEST_TIMEOUT',
          message: `Request timed out after ${timeout}ms`,
          requestId,
        });
      }

      throw new ApiClientError({
        status: 0,
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network request failed',
        requestId,
      });
    }
  }

  public get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  public getProfile<T = any>(options?: RequestOptions): Promise<T> {
    return this.get<T>('/users/me', options);
  }

  public updateProfile<T = any>(body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>('/users/me', body, options);
  }

  // Organization Domain APIs
  public createOrganization<T = any>(body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>('/organizations', body, options);
  }

  public getUserOrganizations<T = any>(options?: RequestOptions): Promise<T> {
    return this.get<T>('/organizations/me', options);
  }

  public getOrganization<T = any>(organizationId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/organizations/${organizationId}`, options);
  }

  public updateOrganization<T = any>(organizationId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/organizations/${organizationId}`, body, options);
  }

  public deleteOrganization<T = any>(organizationId: string, body: { confirmation: string }, options?: RequestOptions): Promise<T> {
    return this.request<T>(`/organizations/${organizationId}`, { ...options, method: 'DELETE', body });
  }

  public getOrganizationMembers<T = any>(organizationId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/organizations/${organizationId}/members`, options);
  }

  public addOrganizationMember<T = any>(organizationId: string, body: { userId: string; role?: string }, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/organizations/${organizationId}/members`, body, options);
  }

  public updateOrganizationMemberRole<T = any>(organizationId: string, userId: string, body: { role: string }, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/organizations/${organizationId}/members/${userId}`, body, options);
  }

  public removeOrganizationMember<T = any>(organizationId: string, userId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/organizations/${organizationId}/members/${userId}`, options);
  }

  public transferOrganizationOwnership<T = any>(organizationId: string, body: { newOwnerId: string }, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/organizations/${organizationId}/transfer-ownership`, body, options);
  }

  // Hackathon Domain APIs
  public createHackathon<T = any>(organizationId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/organizations/${organizationId}/hackathons`, body, options);
  }

  public getOrganizationHackathons<T = any>(organizationId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/organizations/${organizationId}/hackathons`, options);
  }

  public getHackathon<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}`, options);
  }

  public getHackathonLifecycle<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/lifecycle`, options);
  }

  public updateHackathon<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/hackathons/${hackathonId}`, body, options);
  }

  public publishHackathon<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/publish`, undefined, options);
  }

  public archiveHackathon<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/archive`, undefined, options);
  }

  public getHackathonConfiguration<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/configuration`, options);
  }

  public updateHackathonConfiguration<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.put<T>(`/hackathons/${hackathonId}/configuration`, body, options);
  }

  public getHackathonRules<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/rules`, options);
  }

  public updateHackathonRules<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/hackathons/${hackathonId}/rules`, body, options);
  }

  // Hackathon Tracks Domain APIs
  public getHackathonTracks<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/tracks`, options);
  }

  public createHackathonTrack<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/tracks`, body, options);
  }

  public getHackathonTrack<T = any>(hackathonId: string, trackId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/tracks/${trackId}`, options);
  }

  public updateHackathonTrack<T = any>(hackathonId: string, trackId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/hackathons/${hackathonId}/tracks/${trackId}`, body, options);
  }

  public deleteHackathonTrack<T = any>(hackathonId: string, trackId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/hackathons/${hackathonId}/tracks/${trackId}`, options);
  }

  public reorderHackathonTracks<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/hackathons/${hackathonId}/tracks/reorder`, body, options);
  }

  // Hackathon Challenges Domain APIs
  public getTrackChallenges<T = any>(trackId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/tracks/${trackId}/challenges`, options);
  }

  public createTrackChallenge<T = any>(trackId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/tracks/${trackId}/challenges`, body, options);
  }

  public getTrackChallenge<T = any>(trackId: string, challengeId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/tracks/${trackId}/challenges/${challengeId}`, options);
  }

  public updateTrackChallenge<T = any>(trackId: string, challengeId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/tracks/${trackId}/challenges/${challengeId}`, body, options);
  }

  public deleteTrackChallenge<T = any>(trackId: string, challengeId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/tracks/${trackId}/challenges/${challengeId}`, options);
  }

  public reorderTrackChallenges<T = any>(trackId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/tracks/${trackId}/challenges/reorder`, body, options);
  }

  // ==========================================
  // S2-04: Participant Registration Domain APIs
  // ==========================================
  public getHackathonRegistration<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/registration`, options);
  }

  public createHackathonRegistration<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/registration`, body, options);
  }

  public updateHackathonRegistration<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/hackathons/${hackathonId}/registration`, body, options);
  }

  public withdrawFromHackathon<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/hackathons/${hackathonId}/registration`, options);
  }

  // ==========================================
  // S2-05: Team Formation Domain APIs
  // ==========================================
  public createTeam<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/teams`, body, options);
  }

  public getMyTeam<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/teams/me`, options);
  }

  public getMyTeamInvitations<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/teams/my-invitations`, options);
  }

  public getTeam<T = any>(teamId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/teams/${teamId}`, options);
  }

  public updateTeam<T = any>(teamId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/teams/${teamId}`, body, options);
  }

  public dissolveTeam<T = any>(teamId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/teams/${teamId}`, options);
  }

  public inviteTeamMember<T = any>(teamId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/teams/${teamId}/invitations`, body, options);
  }

  public getTeamInvitations<T = any>(teamId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/teams/${teamId}/invitations`, options);
  }

  public cancelTeamInvitation<T = any>(teamId: string, invitationId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/teams/${teamId}/invitations/${invitationId}`, options);
  }

  public acceptTeamInvitation<T = any>(invitationId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/invitations/${invitationId}/accept`, {}, options);
  }

  public declineTeamInvitation<T = any>(invitationId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/invitations/${invitationId}/decline`, {}, options);
  }

  public leaveTeam<T = any>(teamId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/teams/${teamId}/leave`, {}, options);
  }

  public removeTeamMember<T = any>(teamId: string, memberId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/teams/${teamId}/members/${memberId}/remove`, {}, options);
  }

  public transferTeamCaptaincy<T = any>(teamId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/teams/${teamId}/captain/transfer`, body, options);
  }

  // ==========================================
  // S2-06: GitHub Integration & Repository APIs
  // ==========================================
  public getGitHubConnectionStatus<T = any>(options?: RequestOptions): Promise<T> {
    return this.get<T>('/github/status', options);
  }

  public startGitHubConnect<T = any>(teamId?: string, options?: RequestOptions): Promise<T> {
    return this.get<T>('/github/connect', { ...options, params: { ...options?.params, teamId } });
  }

  public disconnectGitHub<T = any>(options?: RequestOptions): Promise<T> {
    return this.delete<T>('/github/connection', options);
  }

  public getTeamRepository<T = any>(teamId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/teams/${teamId}/repository`, options);
  }

  public provisionTeamRepository<T = any>(teamId: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/teams/${teamId}/repository/provision`, body || {}, options);
  }

  public connectTeamRepository<T = any>(teamId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/teams/${teamId}/repository/connect`, body, options);
  }

  public disconnectTeamRepository<T = any>(teamId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/teams/${teamId}/repository`, options);
  }

  // ==========================================
  // S3: Submissions & Judging APIs
  // ==========================================
  public createOrUpdateSubmissionDraft<T = any>(teamId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/teams/${teamId}/submissions`, body, options);
  }

  public getTeamSubmission<T = any>(teamId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/teams/${teamId}/submission`, options);
  }

  public getSubmissionDetail<T = any>(submissionId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/submissions/${submissionId}`, options);
  }

  public getHackathonSubmissions<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/submissions`, options);
  }

  public finalizeSubmission<T = any>(submissionId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/submissions/${submissionId}/finalize`, {}, options);
  }

  public withdrawSubmission<T = any>(submissionId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/submissions/${submissionId}/withdraw`, {}, options);
  }

  public getJudgingCriteria<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/judging-criteria`, options);
  }

  public createJudgingCriterion<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/judging-criteria`, body, options);
  }

  public deleteJudgingCriterion<T = any>(hackathonId: string, criterionId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/hackathons/${hackathonId}/judging-criteria/${criterionId}`, options);
  }

  public assignJudge<T = any>(submissionId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/submissions/${submissionId}/judges`, body, options);
  }

  public revokeJudgeAssignment<T = any>(submissionId: string, judgeUserId: string, options?: RequestOptions): Promise<T> {
    return this.delete<T>(`/submissions/${submissionId}/judges/${judgeUserId}`, options);
  }

  public getJudgeAssignments<T = any>(options?: RequestOptions): Promise<T> {
    return this.get<T>('/judge-assignments', options);
  }

  public getJudgeAssignmentDetail<T = any>(assignmentId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/judge-assignments/${assignmentId}`, options);
  }

  public saveEvaluationDraft<T = any>(assignmentId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/judge-assignments/${assignmentId}/evaluation`, body, options);
  }

  public submitEvaluation<T = any>(assignmentId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/judge-assignments/${assignmentId}/evaluation/submit`, body, options);
  }

  // ==========================================
  // S4: Integrity & Forensics APIs
  // ==========================================
  public startIntegrityAnalysis<T = any>(submissionId: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/submissions/${submissionId}/integrity/analyze`, body || {}, options);
  }

  public getSubmissionIntegrityAnalyses<T = any>(submissionId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/submissions/${submissionId}/integrity`, options);
  }

  public getHackathonIntegrityAnalyses<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/integrity/analyses`, options);
  }

  public getHackathonIntegrityFindings<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/integrity/findings`, options);
  }

  public getIntegrityFindingDetail<T = any>(findingId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/integrity/findings/${findingId}`, options);
  }

  public reviewIntegrityFinding<T = any>(findingId: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/integrity/findings/${findingId}/review`, body || {}, options);
  }

  public confirmIntegrityFinding<T = any>(findingId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/integrity/findings/${findingId}/confirm`, body, options);
  }

  public dismissIntegrityFinding<T = any>(findingId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/integrity/findings/${findingId}/dismiss`, body, options);
  }

  // ==========================================
  // S5: Results, Ranking & Leaderboard APIs
  // ==========================================
  public calculateResults<T = any>(hackathonId: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/results/calculate`, body || {}, options);
  }

  public getResults<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/results`, options);
  }

  public getResultHistory<T = any>(hackathonId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/results/history`, options);
  }

  public approveResults<T = any>(hackathonId: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/results/approve`, body || {}, options);
  }

  public publishResults<T = any>(hackathonId: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/results/publish`, body || {}, options);
  }

  public getLeaderboard<T = any>(
    hackathonId: string,
    params?: { trackId?: string; limit?: number; offset?: number },
    options?: RequestOptions
  ): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/leaderboard`, {
      ...options,
      params: {
        ...options?.params,
        ...params,
      },
    });
  }

  // ==========================================
  // S6: Notifications & Announcements APIs
  // ==========================================
  public getNotifications<T = any>(
    params?: { page?: number; limit?: number; unreadOnly?: boolean; type?: string; hackathonId?: string },
    options?: RequestOptions
  ): Promise<T> {
    return this.get<T>('/notifications', {
      ...options,
      params: {
        ...options?.params,
        ...params,
      },
    });
  }

  public getUnreadNotificationCount<T = any>(options?: RequestOptions): Promise<T> {
    return this.get<T>('/notifications/unread-count', options);
  }

  public markNotificationRead<T = any>(notificationId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/notifications/${notificationId}/read`, {}, options);
  }

  public markAllNotificationsRead<T = any>(options?: RequestOptions): Promise<T> {
    return this.post<T>('/notifications/read-all', {}, options);
  }

  public getNotificationPreferences<T = any>(options?: RequestOptions): Promise<T> {
    return this.get<T>('/notifications/preferences', options);
  }

  public updateNotificationPreferences<T = any>(body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>('/notifications/preferences', body, options);
  }

  public createAnnouncement<T = any>(hackathonId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/announcements`, body, options);
  }

  public getAnnouncements<T = any>(
    hackathonId: string,
    params?: { status?: string; targetTrackId?: string },
    options?: RequestOptions
  ): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/announcements`, {
      ...options,
      params: {
        ...options?.params,
        ...params,
      },
    });
  }

  public getAnnouncement<T = any>(hackathonId: string, announcementId: string, options?: RequestOptions): Promise<T> {
    return this.get<T>(`/hackathons/${hackathonId}/announcements/${announcementId}`, options);
  }

  public updateAnnouncement<T = any>(hackathonId: string, announcementId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.patch<T>(`/hackathons/${hackathonId}/announcements/${announcementId}`, body, options);
  }

  public scheduleAnnouncement<T = any>(hackathonId: string, announcementId: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/announcements/${announcementId}/schedule`, body, options);
  }

  public publishAnnouncement<T = any>(hackathonId: string, announcementId: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/announcements/${announcementId}/publish`, body || {}, options);
  }

  public cancelAnnouncement<T = any>(hackathonId: string, announcementId: string, options?: RequestOptions): Promise<T> {
    return this.post<T>(`/hackathons/${hackathonId}/announcements/${announcementId}/cancel`, {}, options);
  }
}









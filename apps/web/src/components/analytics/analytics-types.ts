export type AnalyticsTimeframe = 'EVENT' | '7D' | '30D' | 'CUSTOM';

export interface RegistrationTrendPoint {
  date: string;
  label: string;
  daily: number;
  cumulative: number;
}

export interface RegistrationFunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropoffPercentage: number;
  description: string;
}

export interface TeamFormationDistribution {
  size: number;
  label: string;
  count: number;
  percentage: number;
}

export interface SubmissionVelocityPoint {
  timeBucket: string;
  label: string;
  count: number;
  cumulative: number;
  isDeadlineWindow?: boolean;
}

export interface TrackAnalyticsItem {
  trackId: string;
  trackName: string;
  teamsCount: number;
  submissionsCount: number;
  completionRate: number;
  averageScore: number;
}

export interface JudgingWorkloadItem {
  judgeId: string;
  judgeName: string;
  judgeRole: string;
  assignedCount: number;
  completedCount: number;
  completionPercentage: number;
  avgScoreGiven: number;
}

export interface EventHealthItem {
  category: string;
  status: 'HEALTHY' | 'ATTENTION' | 'COMPLETED' | 'IN_PROGRESS';
  message: string;
  metric: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface OperationalInsightItem {
  id: string;
  category: 'REGISTRATION' | 'TEAMS' | 'SUBMISSIONS' | 'JUDGING' | 'OUTCOMES';
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'INFO';
  metric: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface AnalyticsFilterState {
  timeframe: AnalyticsTimeframe;
  trackId: string;
  activeSection: 'ALL' | 'PARTICIPATION' | 'TEAMS' | 'SUBMISSIONS' | 'JUDGING';
  viewMode: 'CHARTS' | 'TABLES';
}

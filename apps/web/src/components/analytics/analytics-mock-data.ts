import {
  RegistrationTrendPoint,
  RegistrationFunnelStage,
  TeamFormationDistribution,
  SubmissionVelocityPoint,
  TrackAnalyticsItem,
  JudgingWorkloadItem,
  EventHealthItem,
  OperationalInsightItem,
} from './analytics-types';

export const MOCK_REGISTRATION_GROWTH: RegistrationTrendPoint[] = [
  { date: '2026-08-20', label: 'Aug 20', daily: 42, cumulative: 42 },
  { date: '2026-08-21', label: 'Aug 21', daily: 68, cumulative: 110 },
  { date: '2026-08-22', label: 'Aug 22', daily: 95, cumulative: 205 },
  { date: '2026-08-23', label: 'Aug 23', daily: 112, cumulative: 317 },
  { date: '2026-08-24', label: 'Aug 24', daily: 84, cumulative: 401 },
  { date: '2026-08-25', label: 'Aug 25', daily: 135, cumulative: 536 },
  { date: '2026-08-26', label: 'Aug 26', daily: 160, cumulative: 696 },
  { date: '2026-08-27', label: 'Aug 27', daily: 142, cumulative: 838 },
  { date: '2026-08-28', label: 'Aug 28', daily: 120, cumulative: 958 },
  { date: '2026-08-29', label: 'Aug 29', daily: 98, cumulative: 1056 },
  { date: '2026-08-30', label: 'Aug 30', daily: 72, cumulative: 1128 },
  { date: '2026-08-31', label: 'Aug 31', daily: 54, cumulative: 1182 },
  { date: '2026-09-01', label: 'Sep 01', daily: 38, cumulative: 1220 },
  { date: '2026-09-02', label: 'Sep 02', daily: 20, cumulative: 1240 },
];

export const MOCK_REGISTRATION_FUNNEL: RegistrationFunnelStage[] = [
  {
    stage: 'Registered',
    count: 1240,
    percentage: 100,
    dropoffPercentage: 0,
    description: 'Total applicants submitted onboarding profile.',
  },
  {
    stage: 'Approved',
    count: 1080,
    percentage: 87.1,
    dropoffPercentage: 12.9,
    description: 'Passed eligibility & GitHub credential verification.',
  },
  {
    stage: 'Team Formed',
    count: 912,
    percentage: 73.5,
    dropoffPercentage: 13.6,
    description: 'Joined or created a team of 1–4 builders.',
  },
  {
    stage: 'Project Submitted',
    count: 684,
    percentage: 55.2,
    dropoffPercentage: 18.3,
    description: 'Delivered repository commits and demo submission before deadline.',
  },
];

export const MOCK_TEAM_SIZE_DISTRIBUTION: TeamFormationDistribution[] = [
  { size: 1, label: 'Solo Builders (1)', count: 12, percentage: 8.8 },
  { size: 2, label: 'Duo Teams (2)', count: 24, percentage: 17.6 },
  { size: 3, label: 'Trio Teams (3)', count: 42, percentage: 30.9 },
  { size: 4, label: 'Full Squads (4)', count: 58, percentage: 42.7 },
];

export const MOCK_SUBMISSION_VELOCITY: SubmissionVelocityPoint[] = [
  { timeBucket: 'T-24h', label: '24h Prior', count: 8, cumulative: 8 },
  { timeBucket: 'T-18h', label: '18h Prior', count: 12, cumulative: 20 },
  { timeBucket: 'T-12h', label: '12h Prior', count: 13, cumulative: 33 },
  { timeBucket: 'T-6h', label: '6h Prior', count: 21, cumulative: 54, isDeadlineWindow: true },
  { timeBucket: 'T-2h', label: '2h Prior', count: 20, cumulative: 74, isDeadlineWindow: true },
  { timeBucket: 'T-30m', label: 'Final 30m', count: 10, cumulative: 84, isDeadlineWindow: true },
];

export const MOCK_TRACK_ANALYTICS: TrackAnalyticsItem[] = [
  {
    trackId: 'trk_systems',
    trackName: 'Open Innovation / Systems',
    teamsCount: 52,
    submissionsCount: 44,
    completionRate: 84.6,
    averageScore: 84.6,
  },
  {
    trackId: 'trk_ai',
    trackName: 'AI Safety & Intelligent Workflows',
    teamsCount: 42,
    submissionsCount: 38,
    completionRate: 90.5,
    averageScore: 86.2,
  },
  {
    trackId: 'trk_fintech',
    trackName: 'DeFi & Programmable Payments',
    teamsCount: 42,
    submissionsCount: 2,
    completionRate: 66.7,
    averageScore: 81.0,
  },
];

export const MOCK_JUDGE_WORKLOAD: JudgingWorkloadItem[] = [
  {
    judgeId: 'jdg_aris',
    judgeName: 'Dr. Aris Thorne',
    judgeRole: 'Systems Lead',
    assignedCount: 21,
    completedCount: 21,
    completionPercentage: 100,
    avgScoreGiven: 84.2,
  },
  {
    judgeId: 'jdg_priya',
    judgeName: 'Priya Sharma',
    judgeRole: 'AI Research Partner',
    assignedCount: 21,
    completedCount: 21,
    completionPercentage: 100,
    avgScoreGiven: 85.8,
  },
  {
    judgeId: 'jdg_marcus',
    judgeName: 'Marcus Vance',
    judgeRole: 'Security Partner',
    assignedCount: 21,
    completedCount: 21,
    completionPercentage: 100,
    avgScoreGiven: 83.1,
  },
  {
    judgeId: 'jdg_elena',
    judgeName: 'Elena Rostova',
    judgeRole: 'DePIN Architect',
    assignedCount: 21,
    completedCount: 21,
    completionPercentage: 100,
    avgScoreGiven: 86.0,
  },
];

export const MOCK_EVENT_HEALTH: EventHealthItem[] = [
  {
    category: 'Registration Flow',
    status: 'HEALTHY',
    message: '1,240 applicants with 87.1% verified approval rate.',
    metric: '1,080 Approved',
    actionUrl: '/registrations',
    actionLabel: 'View Registrations',
  },
  {
    category: 'Team Formation',
    status: 'ATTENTION',
    message: '168 approved participants (15.5%) have not joined a roster.',
    metric: '168 Unassigned',
    actionUrl: '/teams',
    actionLabel: 'Match Teams',
  },
  {
    category: 'Submission Yield',
    status: 'HEALTHY',
    message: '84 project submissions received with verifiable commit history.',
    metric: '84 Projects (85.2%)',
    actionUrl: '/submissions',
    actionLabel: 'Review Submissions',
  },
  {
    category: 'Judging Consensus',
    status: 'COMPLETED',
    message: '100% of 84 required multi-judge reviews completed with zero unresolved ties.',
    metric: '84 / 84 Judged',
    actionUrl: '/judging',
    actionLabel: 'View Workspace',
  },
  {
    category: 'Credential Issuance',
    status: 'COMPLETED',
    message: '80 credentials issued with cryptographic SHA-256 verification.',
    metric: '80 / 84 Issued',
    actionUrl: '/certificates',
    actionLabel: 'Manage Credentials',
  },
];

export const MOCK_OPERATIONAL_INSIGHTS: OperationalInsightItem[] = [
  {
    id: 'ins_team_unassigned',
    category: 'TEAMS',
    title: '15.5% of Approved Participants Remain Unassigned',
    description: '168 builders are verified but not affiliated with any team roster. Consider broadcasting a team-matching announcement.',
    impact: 'HIGH',
    metric: '168 Solo Users',
    actionUrl: '/announcements',
    actionLabel: 'Send Announcement',
  },
  {
    id: 'ins_submission_clustering',
    category: 'SUBMISSIONS',
    title: '60.7% of Submissions Arrived in Final 6 Hours',
    description: '51 of 84 projects completed their final push within 6 hours of the deadline. Zero platform throttling or latency spikes recorded.',
    impact: 'INFO',
    metric: '51 Projects (T-6h)',
  },
  {
    id: 'ins_judging_velocity',
    category: 'JUDGING',
    title: 'Calibrated Consensus Achieved Ahead of Schedule',
    description: 'All 4 track reviewers finished evaluations with a low inter-rater variance of 2.1 pts, eliminating tie-breaking intervention.',
    impact: 'MEDIUM',
    metric: '100% On-Time',
    actionUrl: '/results',
    actionLabel: 'View Results',
  },
];

export interface MetricItem {
  value: number | string;
  label: string;
  context?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  href?: string;
}

export interface AttentionItem {
  id: string;
  severity: 'urgent' | 'warning' | 'info';
  message: string;
  actionLabel: string;
  actionHref: string;
  iconName: 'FileCode2' | 'Scale' | 'Clock' | 'Users' | 'AlertTriangle';
}

export interface RegistrationDataPoint {
  date: string;
  label: string;
  count: number;
  cumulative: number;
}

export interface SubmissionBreakdown {
  submitted: number;
  underReview: number;
  reviewed: number;
  flagged: number;
  total: number;
}

export interface RecentSubmissionItem {
  id: string;
  name: string;
  teamName: string;
  track: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED' | 'FLAGGED';
  submittedAt: string;
  score?: number;
  href: string;
}

export interface JudgingProgressData {
  totalJudges: number;
  totalAssigned: number;
  totalReviewed: number;
  totalRemaining: number;
  progressPercent: number;
  flaggedCount: number;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail?: string;
  timestamp: string;
  type: 'submission' | 'judge' | 'team' | 'announcement' | 'system';
  href?: string;
}

export interface UpcomingMilestone {
  id: string;
  label: string;
  title: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
  timeRemaining?: string;
}

export interface ActiveHackathonContext {
  id: string;
  name: string;
  slug: string;
  organization: string;
  status: 'LIVE' | 'DRAFT' | 'JUDGING' | 'COMPLETED' | 'ARCHIVED';
  startsAt: string;
  endsAt: string;
  timeRemainingLabel: string;
  primaryActionLabel: string;
  primaryActionHref: string;
}

export interface OrganizerDashboardData {
  activeHackathon: ActiveHackathonContext;
  hasMultipleHackathons: boolean;
  metrics: {
    registered: MetricItem;
    teams: MetricItem;
    submissions: MetricItem;
    judges: MetricItem;
  };
  attentionItems: AttentionItem[];
  registrationHistory: {
    '7d': RegistrationDataPoint[];
    '30d': RegistrationDataPoint[];
    'all': RegistrationDataPoint[];
  };
  submissionBreakdown: SubmissionBreakdown;
  recentSubmissions: RecentSubmissionItem[];
  judgingProgress: JudgingProgressData;
  recentActivity: ActivityItem[];
  upcomingMilestones: UpcomingMilestone[];
}

export const DETERMINISTIC_DASHBOARD_DATA: OrganizerDashboardData = {
  activeHackathon: {
    id: 'htf-2026',
    name: 'Hack The Future 2026',
    slug: 'hack-the-future-2026',
    organization: 'AlmostHack Global Foundation',
    status: 'LIVE',
    startsAt: '2026-09-01T00:00:00Z',
    endsAt: '2026-09-18T23:59:59Z',
    timeRemainingLabel: 'Registration closes in 2d 14h',
    primaryActionLabel: 'Manage Hackathon',
    primaryActionHref: '/hackathons/htf-2026',
  },
  hasMultipleHackathons: true,
  metrics: {
    registered: {
      value: 847,
      label: 'Registered',
      context: '+42 this week',
      trend: '+16% vs last 7d',
      trendDirection: 'up',
      href: '/registrations',
    },
    teams: {
      value: 132,
      label: 'Teams',
      context: '118 formed · 14 forming',
      trendDirection: 'neutral',
      href: '/teams',
    },
    submissions: {
      value: 76,
      label: 'Submissions',
      context: '14 waiting for review',
      trendDirection: 'up',
      href: '/submissions',
    },
    judges: {
      value: 24,
      label: 'Judges',
      context: '18 active · 6 pending review',
      trendDirection: 'neutral',
      href: '/judging',
    },
  },
  attentionItems: [
    {
      id: 'att-1',
      severity: 'urgent',
      message: '12 submissions are waiting for double-blind review.',
      actionLabel: 'Review Submissions',
      actionHref: '/hackathons/htf-2026/submissions',
      iconName: 'FileCode2',
    },
    {
      id: 'att-2',
      severity: 'warning',
      message: '3 judges have not completed assigned rubric evaluations.',
      actionLabel: 'Nudge Judges',
      actionHref: '/judging',
      iconName: 'Scale',
    },
    {
      id: 'att-3',
      severity: 'info',
      message: 'Registration milestone: 800+ builders verified.',
      actionLabel: 'View Registrations',
      actionHref: '/registrations',
      iconName: 'Users',
    },
  ],
  registrationHistory: {
    '7d': [
      { date: 'Aug 27', label: 'Day 1', count: 42, cumulative: 635 },
      { date: 'Aug 28', label: 'Day 2', count: 56, cumulative: 691 },
      { date: 'Aug 29', label: 'Day 3', count: 48, cumulative: 739 },
      { date: 'Aug 30', label: 'Day 4', count: 32, cumulative: 771 },
      { date: 'Aug 31', label: 'Day 5', count: 28, cumulative: 799 },
      { date: 'Sep 01', label: 'Day 6', count: 24, cumulative: 823 },
      { date: 'Sep 02', label: 'Today', count: 24, cumulative: 847 },
    ],
    '30d': [
      { date: 'Aug 04', label: 'W1', count: 180, cumulative: 180 },
      { date: 'Aug 11', label: 'W2', count: 220, cumulative: 400 },
      { date: 'Aug 18', label: 'W3', count: 190, cumulative: 590 },
      { date: 'Aug 25', label: 'W4', count: 160, cumulative: 750 },
      { date: 'Sep 02', label: 'Current', count: 97, cumulative: 847 },
    ],
    'all': [
      { date: 'Jul 2026', label: 'Month 1', count: 240, cumulative: 240 },
      { date: 'Aug 2026', label: 'Month 2', count: 510, cumulative: 750 },
      { date: 'Sep 2026', label: 'Month 3', count: 97, cumulative: 847 },
    ],
  },
  submissionBreakdown: {
    submitted: 42,
    underReview: 18,
    reviewed: 14,
    flagged: 2,
    total: 76,
  },
  recentSubmissions: [
    {
      id: 'sub-8492',
      name: 'ZeroKnowledge Climate Ledger',
      teamName: 'QuantumQuest',
      track: 'AI & Infra',
      status: 'UNDER_REVIEW',
      submittedAt: '4m ago',
      score: 87,
      href: '/hackathons/htf-2026/submissions',
    },
    {
      id: 'sub-8491',
      name: 'GreenChain Decentralized Grid',
      teamName: 'GreenChain Devs',
      track: 'Sustainability',
      status: 'SUBMITTED',
      submittedAt: '18m ago',
      href: '/hackathons/htf-2026/submissions',
    },
    {
      id: 'sub-8488',
      name: 'MedAI Assist - Clinical Copilot',
      teamName: 'HealthBytes',
      track: 'Healthcare',
      status: 'REVIEWED',
      submittedAt: '45m ago',
      score: 92,
      href: '/hackathons/htf-2026/submissions',
    },
    {
      id: 'sub-8482',
      name: 'ByteBuddy Autonomous Code Review',
      teamName: 'ByteBuilders',
      track: 'Developer Tools',
      status: 'SUBMITTED',
      submittedAt: '1h ago',
      href: '/hackathons/htf-2026/submissions',
    },
    {
      id: 'sub-8475',
      name: 'Verifiable Ballot Consensus',
      teamName: 'CivicHash',
      track: 'Governance',
      status: 'FLAGGED',
      submittedAt: '2h ago',
      href: '/hackathons/htf-2026/integrity',
    },
  ],
  judgingProgress: {
    totalJudges: 24,
    totalAssigned: 76,
    totalReviewed: 62,
    totalRemaining: 14,
    progressPercent: 82,
    flaggedCount: 3,
  },
  recentActivity: [
    {
      id: 'act-1',
      actor: 'QuantumQuest',
      action: 'submitted project',
      target: '"ZeroKnowledge Climate Ledger"',
      detail: 'AI & Infra track',
      timestamp: '4m ago',
      type: 'submission',
      href: '/hackathons/htf-2026/submissions',
    },
    {
      id: 'act-2',
      actor: 'Dr. Sarah Lin',
      action: 'submitted double-blind review for',
      target: 'Sub-8492',
      detail: 'Score: 87 · No bias flagged',
      timestamp: '25m ago',
      type: 'judge',
      href: '/judging',
    },
    {
      id: 'act-3',
      actor: 'Priya Sharma',
      action: 'assigned as judge for',
      target: 'AI & Infra track',
      timestamp: '1h ago',
      type: 'judge',
      href: '/judging',
    },
    {
      id: 'act-4',
      actor: 'System Integrity Engine',
      action: 'verified Git commit SHA-256 tree for',
      target: 'GreenChain Devs',
      detail: '34 clean commits verified',
      timestamp: '2h ago',
      type: 'system',
      href: '/hackathons/htf-2026/integrity',
    },
    {
      id: 'act-5',
      actor: 'HealthBytes',
      action: 'formed team with 4 builders for',
      target: 'Healthcare track',
      timestamp: '3h ago',
      type: 'team',
      href: '/teams',
    },
  ],
  upcomingMilestones: [
    {
      id: 'm-1',
      label: 'REGISTRATION',
      title: 'Registration Closes',
      date: 'Sep 04, 2026',
      status: 'current',
      timeRemaining: 'in 2d 14h',
    },
    {
      id: 'm-2',
      label: 'SUBMISSIONS',
      title: 'Project Submissions Deadline',
      date: 'Sep 12, 2026',
      status: 'upcoming',
      timeRemaining: 'in 10 days',
    },
    {
      id: 'm-3',
      label: 'JUDGING',
      title: 'Calibrated Double-Blind Judging',
      date: 'Sep 15, 2026',
      status: 'upcoming',
      timeRemaining: 'in 13 days',
    },
    {
      id: 'm-4',
      label: 'RESULTS',
      title: 'Final Leaderboard & Results Seal',
      date: 'Sep 18, 2026',
      status: 'upcoming',
      timeRemaining: 'in 16 days',
    },
  ],
};

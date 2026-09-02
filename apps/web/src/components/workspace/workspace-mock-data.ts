export interface WorkspaceHackathonData {
  id: string;
  name: string;
  slug: string;
  organization: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'JUDGING' | 'COMPLETED' | 'ARCHIVED';
  format: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  location: string;
  startsAt: string;
  endsAt: string;
  dateRangeLabel: string;
  participantCount: number;
  maxParticipants: number;
  teamCount: number;
  submissionCount: number;
  judgeCount: number;
  tracksCount: number;
  prizesTotal: number;
}

export interface WorkspaceLifecycleProgress {
  registration: {
    current: number;
    max: number;
    percent: number;
    statusLabel: string;
  };
  teams: {
    total: number;
    complete: number;
    forming: number;
    statusLabel: string;
  };
  submissions: {
    total: number;
    expected: number;
    percent: number;
    statusLabel: string;
  };
  judging: {
    reviewed: number;
    totalAssigned: number;
    percent: number;
    remaining: number;
    statusLabel: string;
  };
}

export interface WorkspaceTimelinePhase {
  id: string;
  title: string;
  dateLabel: string;
  status: 'completed' | 'active' | 'upcoming';
  detail: string;
}

export interface WorkspaceAttentionItem {
  id: string;
  severity: 'urgent' | 'warning' | 'info';
  message: string;
  actionLabel: string;
  actionHref: string;
  iconName: 'FileCode2' | 'Scale' | 'Clock' | 'Users' | 'AlertTriangle';
}

export interface WorkspaceActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail?: string;
  timestamp: string;
  type: 'submission' | 'judge' | 'team' | 'announcement' | 'system';
  href?: string;
}

export interface WorkspaceSummaryCard {
  id: string;
  title: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'info' | 'neutral';
  metrics: string;
  detail: string;
  actionLabel: string;
  actionHref: string;
  iconName: string;
}

export interface SingleHackathonWorkspaceData {
  hackathon: WorkspaceHackathonData;
  lifecycle: WorkspaceLifecycleProgress;
  timeline: WorkspaceTimelinePhase[];
  attentionItems: WorkspaceAttentionItem[];
  activities: WorkspaceActivityItem[];
  summaries: WorkspaceSummaryCard[];
}

export const DETERMINISTIC_WORKSPACE_DATA: SingleHackathonWorkspaceData = {
  hackathon: {
    id: 'htf-2026',
    name: 'Hack The Future 2026',
    slug: 'hack-the-future-2026',
    organization: 'AlmostHack Global Foundation',
    description: 'Global flagship sprint for verified decentralized infrastructure and AI safety systems.',
    status: 'LIVE',
    format: 'ONLINE',
    location: 'Global / Virtual',
    startsAt: '2026-09-01T00:00:00Z',
    endsAt: '2026-09-18T23:59:59Z',
    dateRangeLabel: 'Sep 01 — Sep 18, 2026',
    participantCount: 847,
    maxParticipants: 1000,
    teamCount: 132,
    submissionCount: 76,
    judgeCount: 24,
    tracksCount: 4,
    prizesTotal: 150000,
  },
  lifecycle: {
    registration: {
      current: 847,
      max: 1000,
      percent: 85,
      statusLabel: '847 / 1,000 builders (85% quota)',
    },
    teams: {
      total: 132,
      complete: 118,
      forming: 14,
      statusLabel: '132 teams formed (118 complete)',
    },
    submissions: {
      total: 76,
      expected: 132,
      percent: 58,
      statusLabel: '76 / 132 teams submitted (58%)',
    },
    judging: {
      reviewed: 62,
      totalAssigned: 76,
      percent: 82,
      remaining: 14,
      statusLabel: '82% complete (62 of 76 reviewed)',
    },
  },
  timeline: [
    {
      id: 'p-1',
      title: 'Registration & Verification',
      dateLabel: 'Sep 01 — Sep 10',
      status: 'completed',
      detail: '847 verified builder identities enrolled.',
    },
    {
      id: 'p-2',
      title: 'Hacking & Project Commits',
      dateLabel: 'Sep 10 — Sep 15',
      status: 'active',
      detail: 'Live repository sync & SHA-256 tree auditing.',
    },
    {
      id: 'p-3',
      title: 'Double-Blind Judging',
      dateLabel: 'Sep 15 — Sep 17',
      status: 'upcoming',
      detail: '24 judges scoring weighted criteria.',
    },
    {
      id: 'p-4',
      title: 'Consensus & Results Seal',
      dateLabel: 'Sep 18',
      status: 'upcoming',
      detail: 'Final leaderboard publish and prize distribution.',
    },
  ],
  attentionItems: [
    {
      id: 'wa-1',
      severity: 'urgent',
      message: '12 project submissions are waiting for double-blind review.',
      actionLabel: 'Review Submissions',
      actionHref: '/hackathons/htf-2026/submissions',
      iconName: 'FileCode2',
    },
    {
      id: 'wa-2',
      severity: 'warning',
      message: '3 judges have remaining assigned evaluations past estimated SLA.',
      actionLabel: 'Nudge Judges',
      actionHref: '/judging',
      iconName: 'Scale',
    },
    {
      id: 'wa-3',
      severity: 'info',
      message: 'Submission deadline closes in 3 days. 56 teams have not finalized drafts.',
      actionLabel: 'Send Announcement',
      actionHref: '/hackathons/htf-2026/announcements',
      iconName: 'Clock',
    },
  ],
  activities: [
    {
      id: 'wact-1',
      actor: 'QuantumQuest',
      action: 'submitted project',
      target: '"ZeroKnowledge Climate Ledger"',
      detail: 'AI & Systems track',
      timestamp: '4m ago',
      type: 'submission',
      href: '/hackathons/htf-2026/submissions',
    },
    {
      id: 'wact-2',
      actor: 'Dr. Sarah Lin',
      action: 'completed evaluation for',
      target: 'Sub-8492',
      detail: 'Score: 87 · Calibrated',
      timestamp: '25m ago',
      type: 'judge',
      href: '/judging',
    },
    {
      id: 'wact-3',
      actor: 'System Integrity Engine',
      action: 'verified Git commit SHA-256 tree for',
      target: 'GreenChain Devs',
      detail: '34 clean commits verified',
      timestamp: '1h ago',
      type: 'system',
      href: '/hackathons/htf-2026/integrity',
    },
    {
      id: 'wact-4',
      actor: 'Organizers',
      action: 'broadcasted announcement',
      target: '"Submission Deadline Checklist & Final Submission Guide"',
      timestamp: '2h ago',
      type: 'announcement',
      href: '/hackathons/htf-2026/announcements',
    },
    {
      id: 'wact-5',
      actor: 'CivicHash Team',
      action: 'formed team with 4 members in',
      target: 'Governance track',
      timestamp: '3h ago',
      type: 'team',
      href: '/teams',
    },
  ],
  summaries: [
    {
      id: 'sum-config',
      title: 'Configuration',
      badge: '4 Tracks',
      badgeVariant: 'info',
      metrics: '4 Tracks · 8 Challenges',
      detail: 'Schedule, rubric criteria weights, and registration quotas.',
      actionLabel: 'Manage Configuration',
      actionHref: '/hackathons/htf-2026/configuration',
      iconName: 'Settings',
    },
    {
      id: 'sum-registrations',
      title: 'Registrations',
      badge: '85% Quota',
      badgeVariant: 'success',
      metrics: '847 Registered Builders',
      detail: 'Participant roster, identity verification, and manual approvals.',
      actionLabel: 'View Registrations',
      actionHref: '/registrations',
      iconName: 'Users',
    },
    {
      id: 'sum-teams',
      title: 'Teams',
      badge: '118 Complete',
      badgeVariant: 'success',
      metrics: '132 Teams Formed',
      detail: '118 full teams, 14 currently seeking builders.',
      actionLabel: 'Manage Teams',
      actionHref: '/teams',
      iconName: 'Users',
    },
    {
      id: 'sum-submissions',
      title: 'Submissions',
      badge: '76 Projects',
      badgeVariant: 'info',
      metrics: '76 Submitted · 14 Pending',
      detail: 'Live project drafts, video demos, and GitHub repository links.',
      actionLabel: 'Review Submissions',
      actionHref: '/hackathons/htf-2026/submissions',
      iconName: 'FileCode2',
    },
    {
      id: 'sum-judging',
      title: 'Judging & Consensus',
      badge: '82% Done',
      badgeVariant: 'warning',
      metrics: '24 Judges · 62 / 76 Done',
      detail: 'Double-blind rubric evaluations and bias calibration algorithm.',
      actionLabel: 'Manage Judging',
      actionHref: '/judging',
      iconName: 'Scale',
    },
    {
      id: 'sum-results',
      title: 'Results & Leaderboard',
      badge: 'Pending Seal',
      badgeVariant: 'neutral',
      metrics: 'Draft Rankings Ready',
      detail: 'Consensus calculation, prize tier allotment, and leaderboard seal.',
      actionLabel: 'View Leaderboard',
      actionHref: '/hackathons/htf-2026/leaderboard',
      iconName: 'Award',
    },
    {
      id: 'sum-integrity',
      title: 'Audit Log & Integrity',
      badge: '100% Sealed',
      badgeVariant: 'success',
      metrics: 'Merkle Ledger Intact',
      detail: 'Git tree verification, forensics anomalies, and verifiable log.',
      actionLabel: 'Inspect Integrity',
      actionHref: '/hackathons/htf-2026/integrity',
      iconName: 'ShieldCheck',
    },
    {
      id: 'sum-announcements',
      title: 'Announcements',
      badge: '3 Broadcasts',
      badgeVariant: 'info',
      metrics: 'Latest: 2h ago',
      detail: 'Real-time broadcast notifications to participants and judges.',
      actionLabel: 'Manage Announcements',
      actionHref: '/hackathons/htf-2026/announcements',
      iconName: 'Megaphone',
    },
  ],
};

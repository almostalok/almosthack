'use client';

import React, { useState } from 'react';
import { useAuth } from '../../providers/auth-provider';
import { useOrganizerDashboard } from './use-organizer-dashboard';
import { OrganizerOverviewHeader } from './OrganizerOverviewHeader';
import { HackathonStatusCard } from './HackathonStatusCard';
import { MetricGrid } from './MetricGrid';
import { AttentionPanel } from './AttentionPanel';
import { QuickActions } from './QuickActions';
import { RegistrationChart } from './RegistrationChart';
import { SubmissionOverview } from './SubmissionOverview';
import { RecentSubmissions } from './RecentSubmissions';
import { JudgingOverview } from './JudgingOverview';
import { RecentActivityStream } from './RecentActivityStream';
import { UpcomingTimeline } from './UpcomingTimeline';
import { DashboardSkeleton } from './DashboardSkeleton';
import { PageErrorState, PageEmptyState } from '../application/ShellFeedbackStates';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

export const OrganizerOverview: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isEmpty } = useOrganizerDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <PageErrorState
        title="Could not load organizer command center."
        message="An issue occurred while fetching real-time hackathon telemetry. Please try again."
        onRetry={handleRefresh}
      />
    );
  }

  if (isEmpty) {
    return (
      <PageEmptyState
        title="No active hackathons yet."
        description="Create your first hackathon and everything starts here—registrations, teams, submissions, and double-blind judging."
        actionLabel="Create Hackathon"
        onAction={() => {
          window.location.href = '/organizations/new';
        }}
        icon={<Trophy className="w-6 h-6 text-[#028051]" />}
      />
    );
  }

  const userName = user?.name?.split(' ')[0] || 'Alok';

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left" role="region" aria-label="Organizer Dashboard">
      {/* 1. Page Header */}
      <OrganizerOverviewHeader
        userName={userName}
        activeHackathon={data.activeHackathon}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Active Hackathon Context Banner */}
      <HackathonStatusCard
        hackathon={data.activeHackathon}
        hasMultipleHackathons={data.hasMultipleHackathons}
      />

      {/* 3. Key Metrics Grid (Registered, Teams, Submissions, Judges) */}
      <MetricGrid metrics={data.metrics} />

      {/* 4. Attention Center & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <AttentionPanel items={data.attentionItems} />
        </div>
        <div className="lg:col-span-1">
          <QuickActions hackathonId={data.activeHackathon.id} />
        </div>
      </div>

      {/* 5. Core Activity: Registration Velocity & Submissions Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <RegistrationChart history={data.registrationHistory} />
        </div>
        <div className="lg:col-span-1">
          <SubmissionOverview
            breakdown={data.submissionBreakdown}
            hackathonId={data.activeHackathon.id}
          />
        </div>
      </div>

      {/* 6. Recent Submissions (Table on Desktop, Cards on Mobile) */}
      <RecentSubmissions
        submissions={data.recentSubmissions}
        hackathonId={data.activeHackathon.id}
      />

      {/* 7. Judging Overview & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div>
          <JudgingOverview
            data={data.judgingProgress}
            hackathonId={data.activeHackathon.id}
          />
        </div>
        <div>
          <RecentActivityStream
            activities={data.recentActivity}
            hackathonId={data.activeHackathon.id}
          />
        </div>
      </div>

      {/* 8. Upcoming Milestones Official Timeline */}
      <UpcomingTimeline milestones={data.upcomingMilestones} />
    </div>
  );
};

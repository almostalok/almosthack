'use client';

import React, { useState } from 'react';
import { useHackathonWorkspace } from './use-hackathon-workspace';
import { HackathonWorkspaceHeader } from './HackathonWorkspaceHeader';
import { WorkspaceNavigation } from './WorkspaceNavigation';
import { LifecycleProgress } from './LifecycleProgress';
import { WorkspaceAttention } from './WorkspaceAttention';
import { WorkspaceQuickActions } from './WorkspaceQuickActions';
import { EventTimeline } from './EventTimeline';
import { WorkspaceSummaries } from './WorkspaceSummaries';
import { WorkspaceActivity } from './WorkspaceActivity';
import { WorkspaceSkeleton } from './WorkspaceSkeleton';
import { PageErrorState } from '../application/ShellFeedbackStates';
import { Trophy } from 'lucide-react';

export interface HackathonWorkspaceProps {
  hackathonId: string;
}

export const HackathonWorkspace: React.FC<HackathonWorkspaceProps> = ({ hackathonId }) => {
  const { data, isLoading, isError, refetch } = useHackathonWorkspace({ hackathonId });
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
    return <WorkspaceSkeleton />;
  }

  if (isError || !data) {
    return (
      <PageErrorState
        title="Could not load hackathon workspace."
        message={`We were unable to load the operational workspace for hackathon ID "${hackathonId}".`}
        onRetry={handleRefresh}
        onBack={() => {
          window.location.href = '/hackathons';
        }}
      />
    );
  }

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label={`Hackathon Workspace: ${data.hackathon.name}`}
    >
      {/* 1. Header with Identity, Badges, Dates, and Primary Actions */}
      <HackathonWorkspaceHeader
        hackathon={data.hackathon}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Workspace Navigation Sub-Bar */}
      <WorkspaceNavigation hackathonId={hackathonId} />

      {/* 3. Lifecycle Operational Progress Ratios */}
      <LifecycleProgress lifecycle={data.lifecycle} />

      {/* 4. Attention Center & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <WorkspaceAttention items={data.attentionItems} />
        </div>
        <div className="lg:col-span-1">
          <WorkspaceQuickActions hackathonId={hackathonId} />
        </div>
      </div>

      {/* 5. Event Lifecycle Milestone Timeline */}
      <EventTimeline timeline={data.timeline} />

      {/* 6. Management Modules & Subsystem Summaries (Configuration, Registrations, Teams, Submissions, Judging, Results, Integrity, Announcements) */}
      <WorkspaceSummaries summaries={data.summaries} />

      {/* 7. Live Telemetry Stream */}
      <WorkspaceActivity activities={data.activities} hackathonId={hackathonId} />
    </div>
  );
};

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  BarChart3,
  Users,
  Users2,
  FileCode2,
  Scale,
  Layers,
} from 'lucide-react';
import { useAnalytics } from './use-analytics';
import { AnalyticsHeader } from './AnalyticsHeader';
import { EventHealthGrid } from './EventHealthGrid';
import { OperationalInsightsPanel } from './OperationalInsightsPanel';
import { RegistrationGrowthChart } from './RegistrationGrowthChart';
import { RegistrationFunnelChart } from './RegistrationFunnelChart';
import { TeamFormationAnalytics } from './TeamFormationAnalytics';
import { SubmissionVelocityChart } from './SubmissionVelocityChart';
import { TrackComparisonTable } from './TrackComparisonTable';
import { JudgingPerformanceAnalytics } from './JudgingPerformanceAnalytics';

export interface AnalyticsManagementViewProps {
  hackathonId: string;
}

export const AnalyticsManagementView: React.FC<AnalyticsManagementViewProps> = ({
  hackathonId,
}) => {
  // Fetch hackathon identity
  const { data: hackathon } = useQuery({
    queryKey: ['hackathon', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathon(hackathonId);
      } catch {
        return {
          id: hackathonId,
          name: 'Hack The Future 2026',
          slug: 'hack-the-future-2026',
          status: 'PUBLISHED',
        };
      }
    },
  });

  const {
    filters,
    updateFilters,
    tracks,
    registrationGrowth,
    registrationFunnel,
    teamSizeDistribution,
    submissionVelocity,
    trackAnalytics,
    judgeWorkload,
    eventHealth,
    operationalInsights,
    exportCsv,
  } = useAnalytics({ hackathonId });

  const showAll = filters.activeSection === 'ALL';

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Hackathon Operational Analytics Workspace"
    >
      {/* Top Header */}
      <AnalyticsHeader
        hackathonId={hackathonId}
        hackathonName={hackathon?.name}
        filters={filters}
        onUpdateFilters={updateFilters}
        tracks={tracks}
        onExportCsv={exportCsv}
      />

      {/* Section 1: Event Health Overview */}
      <EventHealthGrid healthItems={eventHealth} />

      {/* Section 2: Operational Insights */}
      <OperationalInsightsPanel insights={operationalInsights} />

      {/* Section Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#DCDDD3] select-none text-xs font-mono font-bold">
        {[
          { id: 'ALL', label: 'All Analytics', icon: BarChart3 },
          { id: 'PARTICIPATION', label: 'Participation & Funnel', icon: Users },
          { id: 'TEAMS', label: 'Team Formation', icon: Users2 },
          { id: 'SUBMISSIONS', label: 'Submissions & Tracks', icon: FileCode2 },
          { id: 'JUDGING', label: 'Judging & Workload', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = filters.activeSection === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateFilters({ activeSection: tab.id as any })}
              className={`px-3 py-1.5 rounded-[6px] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]'
                  : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 3: Participation & Funnel */}
      {(showAll || filters.activeSection === 'PARTICIPATION') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RegistrationGrowthChart
            data={registrationGrowth}
            viewMode={filters.viewMode}
          />
          <RegistrationFunnelChart
            stages={registrationFunnel}
            viewMode={filters.viewMode}
          />
        </div>
      )}

      {/* Section 4: Team Formation */}
      {(showAll || filters.activeSection === 'TEAMS') && (
        <TeamFormationAnalytics
          distributions={teamSizeDistribution}
          unassignedCount={168}
          totalApproved={1080}
        />
      )}

      {/* Section 5: Submissions & Track Performance */}
      {(showAll || filters.activeSection === 'SUBMISSIONS') && (
        <div className="space-y-4">
          <SubmissionVelocityChart velocityPoints={submissionVelocity} />
          <TrackComparisonTable tracks={trackAnalytics} />
        </div>
      )}

      {/* Section 6: Judging & Reviewer Workload */}
      {(showAll || filters.activeSection === 'JUDGING') && (
        <JudgingPerformanceAnalytics workload={judgeWorkload} />
      )}
    </div>
  );
};

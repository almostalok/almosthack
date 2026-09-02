'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Button, Breadcrumbs } from '@almosthack/ui';
import {
  Trophy,
  ArrowLeft,
  RotateCw,
  Search,
  X,
  Layers,
  Award,
  Sliders,
} from 'lucide-react';
import { useResults } from './use-results';
import { ResultsStatusHeader } from './ResultsStatusHeader';
import { WinnersPodiumHero } from './WinnersPodiumHero';
import { AwardsGrid } from './AwardsGrid';
import { OfficialLeaderboardTable } from './OfficialLeaderboardTable';
import { CalculateResultsDialog } from './CalculateResultsDialog';
import { ApproveResultsDialog } from './ApproveResultsDialog';
import { PublishResultsDialog } from './PublishResultsDialog';
import { AssignAwardDialog } from './AssignAwardDialog';

export interface ResultsManagementViewProps {
  hackathonId: string;
}

export const ResultsManagementView: React.FC<ResultsManagementViewProps> = ({
  hackathonId,
}) => {
  const router = useRouter();

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
    lifecycleStatus,
    rankings,
    allRankings,
    topWinners,
    awards,
    readiness,
    tracks,
    filters,
    updateFilters,
    resetFilters,
    isCalculateOpen,
    setIsCalculateOpen,
    isApproveOpen,
    setIsApproveOpen,
    isPublishOpen,
    setIsPublishOpen,
    selectedAwardForAssignment,
    setSelectedAwardForAssignment,
    calculateResults,
    isCalculating,
    approveResults,
    isApproving,
    publishResults,
    isPublishing,
    assignAwardWinner,
    exportCsv,
  } = useResults({ hackathonId });

  const breadcrumbs = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathon?.name || 'Workspace', href: `/hackathons/${hackathonId}` },
    { label: 'Results & Rankings', active: true },
  ];

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Official Results Command Center"
    >
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 pb-3 border-b border-[#DCDDD3]">
        <Breadcrumbs items={breadcrumbs} className="text-xs" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                Results & Official Standings
              </h1>
              <span className="text-xs font-mono font-bold bg-[#E2EBDD] text-[#274535] px-2.5 py-0.5 rounded-[6px] border border-[#B8CEB0]">
                {allRankings.length} Submissions Ranked
              </span>
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              Finalize calibrated judging outcomes, allocate award prizes, and publish the verified leaderboard.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}/judging`)}
              leftIcon={<Sliders className="w-3.5 h-3.5 text-[#6D7068]" />}
              className="text-xs font-mono h-8"
            >
              Judging Workspace
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}`)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8"
            >
              Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Results Status Header */}
      <ResultsStatusHeader
        status={lifecycleStatus}
        readiness={readiness}
        totalSubmissions={allRankings.length}
        onOpenCalculate={() => setIsCalculateOpen(true)}
        onOpenApprove={() => setIsApproveOpen(true)}
        onOpenPublish={() => setIsPublishOpen(true)}
        onExportCsv={exportCsv}
        isCalculating={isCalculating}
        isApproving={isApproving}
        isPublishing={isPublishing}
      />

      {/* Winners Podium Hero */}
      <WinnersPodiumHero
        topWinners={topWinners}
        hackathonId={hackathonId}
      />

      {/* Toolbar & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD3] pb-2">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateFilters({ tab: 'LEADERBOARD', page: 1 })}
              className={`px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                filters.tab === 'LEADERBOARD'
                  ? 'bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]'
                  : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard ({allRankings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => updateFilters({ tab: 'AWARDS', page: 1 })}
              className={`px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                filters.tab === 'AWARDS'
                  ? 'bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]'
                  : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Configured Awards ({awards.length})</span>
            </button>
          </div>

          {/* Search and Track Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#6D7068] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search rankings, teams..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-8 pr-7 py-1.5 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#9A9C94] focus:outline-none focus:border-[#028051]"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => updateFilters({ search: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6D7068] hover:text-[#171914]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={filters.trackId}
              onChange={(e) => updateFilters({ trackId: e.target.value })}
              className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2.5 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
            >
              <option value="ALL">All Tracks</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Leaderboard Table */}
        {filters.tab === 'LEADERBOARD' && (
          <OfficialLeaderboardTable
            rankings={rankings}
            hackathonId={hackathonId}
          />
        )}

        {/* Tab 2: Awards Grid */}
        {filters.tab === 'AWARDS' && (
          <AwardsGrid
            awards={awards}
            onAssignAward={(award) => setSelectedAwardForAssignment(award)}
            isLocked={lifecycleStatus === 'PUBLISHED'}
          />
        )}
      </div>

      {/* Modals */}
      <CalculateResultsDialog
        isOpen={isCalculateOpen}
        onClose={() => setIsCalculateOpen(false)}
        onConfirm={calculateResults}
        isCalculating={isCalculating}
      />

      <ApproveResultsDialog
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={approveResults}
        isApproving={isApproving}
      />

      <PublishResultsDialog
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onConfirm={publishResults}
        isPublishing={isPublishing}
      />

      <AssignAwardDialog
        award={selectedAwardForAssignment}
        isOpen={Boolean(selectedAwardForAssignment)}
        onClose={() => setSelectedAwardForAssignment(null)}
        rankings={allRankings}
        onAssign={assignAwardWinner}
      />
    </div>
  );
};

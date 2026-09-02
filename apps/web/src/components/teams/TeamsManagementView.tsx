'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Button, Breadcrumbs } from '@almosthack/ui';
import {
  Users2,
  ArrowLeft,
  RotateCw,
  Sliders,
  UserX,
  Plus,
} from 'lucide-react';
import { useTeams } from './use-teams';
import { TeamSummaryMetrics } from './TeamSummaryMetrics';
import { TeamToolbar } from './TeamToolbar';
import { TeamTable } from './TeamTable';
import { UnassignedParticipantsView } from './UnassignedParticipantsView';
import { TeamDetailDrawer } from './TeamDetailDrawer';
import { CreateTeamDialog } from './CreateTeamDialog';
import { AddMemberDialog } from './AddMemberDialog';
import { RemoveMemberDialog } from './RemoveMemberDialog';
import { DisbandTeamDialog } from './DisbandTeamDialog';
import { AssignToTeamDialog } from './AssignToTeamDialog';

export interface TeamsManagementViewProps {
  hackathonId: string;
}

export const TeamsManagementView: React.FC<TeamsManagementViewProps> = ({
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
    teams,
    allFilteredCount,
    unassignedParticipants,
    unassignedCount,
    metrics,
    tracks,
    filters,
    updateFilters,
    resetFilters,
    selectedTeam,
    selectedTeamId,
    setSelectedTeamId,
    minTeamSize,
    maxTeamSize,
    // Modals
    isCreateTeamOpen,
    setIsCreateTeamOpen,
    addingMemberTeam,
    setAddingMemberTeam,
    removingMemberData,
    setRemovingMemberData,
    disbandingTeam,
    setDisbandingTeam,
    assigningParticipant,
    setAssigningParticipant,
    // Mutations
    createTeam,
    isCreatingTeam,
    addMemberToTeam,
    isAddingMember,
    removeMemberFromTeam,
    isRemovingMember,
    toggleTeamLock,
    dissolveTeam,
    isDissolvingTeam,
    // Query
    isLoading,
    refetch,
    totalPages,
  } = useTeams({ hackathonId });

  const breadcrumbs = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathon?.name || 'Workspace', href: `/hackathons/${hackathonId}` },
    { label: 'Teams', active: true },
  ];

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Teams Workspace"
    >
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 pb-3 border-b border-[#DCDDD3]">
        <Breadcrumbs items={breadcrumbs} className="text-xs" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                Team Squads & Rosters
              </h1>
              <span className="text-xs font-mono font-bold bg-[#E2EBDD] text-[#274535] px-2.5 py-0.5 rounded-[6px] border border-[#B8CEB0]">
                {metrics.totalTeams} Teams
              </span>
              <span className="text-xs font-mono text-[#6D7068]">
                (Sizing: {minTeamSize}–{maxTeamSize} members)
              </span>
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              Manage participant squads, balance team sizing, and assign unallocated builders.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<RotateCw className="w-3.5 h-3.5 text-[#6D7068]" />}
              className="text-xs font-mono h-8"
            >
              Refresh
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}/configuration`)}
              leftIcon={<Sliders className="w-3.5 h-3.5 text-[#6D7068]" />}
              className="text-xs font-mono h-8"
            >
              Config
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

      {/* Summary Metrics & Attention Alerts */}
      <TeamSummaryMetrics
        metrics={metrics}
        activeTab={filters.tab}
        activeSizeFilter={filters.sizeFilter}
        onSelectSizeFilter={(sf) => updateFilters({ sizeFilter: sf, tab: 'TEAMS' })}
        onSelectTab={(tb) => updateFilters({ tab: tb })}
      />

      {/* Search & Filter Toolbar */}
      <TeamToolbar
        filters={filters}
        onFilterChange={updateFilters}
        onResetFilters={resetFilters}
        tracks={tracks}
        teamsCount={metrics.totalTeams}
        unassignedCount={unassignedCount}
        onCreateTeam={() => setIsCreateTeamOpen(true)}
        totalFilteredCount={
          filters.tab === 'TEAMS' ? allFilteredCount : unassignedParticipants.length
        }
      />

      {/* View Switcher: Teams Table vs Unassigned Builders */}
      {filters.tab === 'TEAMS' ? (
        <TeamTable
          teams={teams}
          isLoading={isLoading}
          onViewDetails={(team) => setSelectedTeamId(team.id)}
          onAddMember={(team) => setAddingMemberTeam(team)}
          onToggleLock={(team) => toggleTeamLock(team.id)}
          onDisbandTeam={(team) => setDisbandingTeam(team)}
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={(pg) => updateFilters({ page: pg })}
          totalCount={allFilteredCount}
          onResetFilters={resetFilters}
        />
      ) : (
        <UnassignedParticipantsView
          participants={unassignedParticipants}
          onAssignToTeam={(p) => setAssigningParticipant(p)}
        />
      )}

      {/* Slide-over Team Details Drawer */}
      <TeamDetailDrawer
        team={selectedTeam}
        isOpen={Boolean(selectedTeam)}
        onClose={() => setSelectedTeamId(null)}
        onAddMember={(t) => setAddingMemberTeam(t)}
        onRemoveMember={(t, m) => setRemovingMemberData({ team: t, member: m })}
        onToggleLock={(t) => toggleTeamLock(t.id)}
        onDisbandTeam={(t) => setDisbandingTeam(t)}
      />

      {/* Create Team Dialog */}
      <CreateTeamDialog
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onCreate={(name, trk, cap) => createTeam(name, trk, cap)}
        isCreating={isCreatingTeam}
        tracks={tracks}
      />

      {/* Add Member Dialog */}
      <AddMemberDialog
        isOpen={Boolean(addingMemberTeam)}
        onClose={() => setAddingMemberTeam(null)}
        team={addingMemberTeam}
        unassignedParticipants={unassignedParticipants}
        onAddMember={(tId, uId) => addMemberToTeam(tId, uId)}
        isAdding={isAddingMember}
      />

      {/* Remove Member Dialog */}
      <RemoveMemberDialog
        isOpen={Boolean(removingMemberData)}
        onClose={() => setRemovingMemberData(null)}
        team={removingMemberData?.team || null}
        member={removingMemberData?.member || null}
        onConfirm={() => {
          if (removingMemberData) {
            removeMemberFromTeam(
              removingMemberData.team.id,
              removingMemberData.member.id
            );
          }
        }}
        isRemoving={isRemovingMember}
      />

      {/* Disband Team Dialog */}
      <DisbandTeamDialog
        isOpen={Boolean(disbandingTeam)}
        onClose={() => setDisbandingTeam(null)}
        team={disbandingTeam}
        onConfirm={() => {
          if (disbandingTeam) {
            dissolveTeam(disbandingTeam.id);
          }
        }}
        isDisbanding={isDissolvingTeam}
      />

      {/* Assign Unassigned Participant to Team Dialog */}
      <AssignToTeamDialog
        isOpen={Boolean(assigningParticipant)}
        onClose={() => setAssigningParticipant(null)}
        participant={assigningParticipant}
        teams={teams}
        onAssign={(tId, uId) => addMemberToTeam(tId, uId)}
        isAssigning={isAddingMember}
      />
    </div>
  );
};

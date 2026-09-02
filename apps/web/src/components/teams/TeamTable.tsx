'use client';

import React from 'react';
import { Button, Skeleton } from '@almosthack/ui';
import {
  Users2,
  Layers,
  Lock,
  Unlock,
  Plus,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileCode2,
} from 'lucide-react';
import { TeamItem, TeamStatus } from './teams-types';
import { TeamMobileCard } from './TeamMobileCard';

export interface TeamTableProps {
  teams: TeamItem[];
  isLoading: boolean;
  onViewDetails: (team: TeamItem) => void;
  onAddMember: (team: TeamItem) => void;
  onToggleLock: (team: TeamItem) => void;
  onDisbandTeam: (team: TeamItem) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  onResetFilters: () => void;
}

export const TeamTable: React.FC<TeamTableProps> = ({
  teams,
  isLoading,
  onViewDetails,
  onAddMember,
  onToggleLock,
  onDisbandTeam,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  onResetFilters,
}) => {
  const getStatusBadge = (status: TeamStatus) => {
    switch (status) {
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <Lock className="w-2.5 h-2.5" />
            LOCKED
          </span>
        );
      case 'DISSOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            DISSOLVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            ACTIVE
          </span>
        );
    }
  };

  const getSizeBadge = (team: TeamItem) => {
    if (team.memberCount >= team.maxTeamSize) {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
          {team.memberCount}/{team.maxTeamSize} Full
        </span>
      );
    }
    if (team.memberCount < team.minTeamSize) {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {team.memberCount}/{team.maxTeamSize} Below Min
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
        {team.memberCount}/{team.maxTeamSize} ({team.maxTeamSize - team.memberCount} open)
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="p-12 text-center bg-[#FFFDF8] rounded-[12px] border border-dashed border-[#DCDDD3] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAE7DC] text-[#6D7068] flex items-center justify-center mx-auto">
          <Users2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-heading font-extrabold text-[#171914]">
            No Teams Found
          </h3>
          <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
            No teams match your active query and filter combination.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetFilters}
          className="text-xs font-mono h-8"
        >
          Reset Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile Cards (< md) */}
      <div className="md:hidden space-y-2.5">
        {teams.map((t) => (
          <TeamMobileCard
            key={t.id}
            team={t}
            onViewDetails={() => onViewDetails(t)}
            onAddMember={() => onAddMember(t)}
          />
        ))}
      </div>

      {/* Desktop & Tablet Table (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-[#171914]">
            <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-bold text-[#6D7068] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Team Name</th>
                <th className="px-4 py-3">Members & Roster</th>
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Squad Sizing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submission</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD3]/70">
              {teams.map((team) => (
                <tr
                  key={team.id}
                  className="hover:bg-[#F7F4EA]/70 transition-colors duration-100"
                >
                  {/* Team Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[6px] bg-[#E2EBDD] text-[#028051] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#B8CEB0]">
                        {team.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onViewDetails(team)}
                          className="font-heading font-bold text-[#171914] hover:text-[#028051] text-left truncate block cursor-pointer"
                        >
                          {team.name}
                        </button>
                        <span className="text-[11px] font-body text-[#6D7068] truncate block">
                          Lead: {team.captain.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Members Roster */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {team.members.map((m) => (
                          <div
                            key={m.id}
                            className={`w-6 h-6 rounded-full font-mono text-[10px] font-bold border-2 border-[#FFFDF8] flex items-center justify-center shrink-0 ${
                              m.role === 'CAPTAIN'
                                ? 'bg-[#028051] text-white'
                                : 'bg-[#EAE7DC] text-[#171914]'
                            }`}
                            title={`${m.name} (${m.role}) - ${m.college || ''}`}
                          >
                            {m.name.slice(0, 1)}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-[#6D7068] truncate max-w-[160px]">
                        {team.members.map((m) => m.name.split(' ')[0]).join(', ')}
                      </span>
                    </div>
                  </td>

                  {/* Track */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {team.trackName ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#171914]">
                        <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span className="max-w-[140px] truncate" title={team.trackName}>
                          {team.trackName}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#9A9C94]">Unassigned</span>
                    )}
                  </td>

                  {/* Squad Sizing */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getSizeBadge(team)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getStatusBadge(team.status)}
                  </td>

                  {/* Submission */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {team.submissionStatus === 'SUBMITTED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#274535] bg-[#E2EBDD] px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-[#028051]" /> Submitted
                      </span>
                    ) : team.submissionStatus === 'DRAFT' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#785A12] bg-[#FFF4DC] px-2 py-0.5 rounded">
                        <FileCode2 className="w-3 h-3 text-[#D97706]" /> In Progress
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#9A9C94]">None</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {team.status === 'ACTIVE' && team.memberCount < team.maxTeamSize && (
                        <button
                          type="button"
                          onClick={() => onAddMember(team)}
                          title="Add Member to Team"
                          className="p-1.5 rounded-[5px] bg-[#E2EBDD] text-[#028051] hover:bg-[#B8CEB0] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onToggleLock(team)}
                        title={team.status === 'LOCKED' ? 'Unlock Team' : 'Lock Team'}
                        className="p-1.5 rounded-[5px] hover:bg-[#EAE7DC] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
                      >
                        {team.status === 'LOCKED' ? (
                          <Unlock className="w-3.5 h-3.5 text-[#028051]" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewDetails(team)}
                        title="View Team Details"
                        className="p-1.5 rounded-[5px] hover:bg-[#EAE7DC] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDisbandTeam(team)}
                        title="Disband Team"
                        className="p-1.5 rounded-[5px] hover:bg-[#FBE6E3] text-[#8B2C24] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="p-3 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] flex items-center justify-between gap-3 text-xs font-mono">
        <span className="text-[#6D7068]">
          Page <strong className="text-[#171914]">{currentPage}</strong> of{' '}
          <strong className="text-[#171914]">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-7 px-2.5"
          >
            Prev
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-7 px-2.5"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

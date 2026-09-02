'use client';

import React from 'react';
import { Users2, Layers, Lock, ChevronRight, Eye, UserPlus } from 'lucide-react';
import { TeamItem } from './teams-types';

export interface TeamMobileCardProps {
  team: TeamItem;
  onViewDetails: () => void;
  onAddMember: () => void;
}

export const TeamMobileCard: React.FC<TeamMobileCardProps> = ({
  team,
  onViewDetails,
  onAddMember,
}) => {
  const getStatusBadge = () => {
    if (team.status === 'LOCKED') {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597] flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" /> LOCKED
        </span>
      );
    }
    if (team.status === 'DISSOLVED') {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
          DISSOLVED
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
        ACTIVE
      </span>
    );
  };

  const getSizeBadge = () => {
    if (team.memberCount >= team.maxTeamSize) {
      return (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E2EBDD] text-[#274535]">
          Full ({team.memberCount}/{team.maxTeamSize})
        </span>
      );
    }
    if (team.memberCount < team.minTeamSize) {
      return (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FBE6E3] text-[#8B2C24]">
          Below Min ({team.memberCount}/{team.maxTeamSize})
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FFF4DC] text-[#785A12]">
        {team.memberCount}/{team.maxTeamSize} Members
      </span>
    );
  };

  return (
    <div className="p-4 rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] hover:border-[#B8CEB0] transition-all text-left space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs font-heading font-bold text-[#171914] hover:text-[#028051] text-left truncate block cursor-pointer"
          >
            {team.name}
          </button>
          <span className="text-[11px] font-body text-[#6D7068] truncate block">
            Lead: {team.captain.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {getSizeBadge()}
          {getStatusBadge()}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 p-2.5 bg-[#F7F4EA] rounded-[6px] border border-[#DCDDD3] text-[11px] font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <Layers className="w-3 h-3 text-[#2563EB] shrink-0" />
          <span className="text-[#171914] truncate">{team.trackName || 'Unassigned Track'}</span>
        </div>

        {/* Member initials preview */}
        <div className="flex -space-x-1.5 shrink-0">
          {team.members.map((m) => (
            <div
              key={m.id}
              className="w-5 h-5 rounded-full bg-[#EAE7DC] text-[#171914] text-[9px] font-mono font-bold border border-[#FFFDF8] flex items-center justify-center"
              title={m.name}
            >
              {m.name.slice(0, 1)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#DCDDD3]/60">
        <button
          type="button"
          onClick={onViewDetails}
          className="text-xs font-mono text-[#6D7068] hover:text-[#171914] flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Team Details</span>
        </button>

        <div className="flex items-center gap-2">
          {team.status === 'ACTIVE' && team.memberCount < team.maxTeamSize && (
            <button
              type="button"
              onClick={onAddMember}
              className="px-2.5 py-1 rounded-[4px] bg-[#E2EBDD] text-[#028051] hover:bg-[#B8CEB0] text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3 h-3" />
              <span>Add Member</span>
            </button>
          )}

          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs font-mono text-[#028051] flex items-center gap-0.5 cursor-pointer"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import {
  X,
  Users2,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Layers,
  GraduationCap,
  Calendar,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  UserX,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { TeamItem, TeamMemberItem } from './teams-types';

export interface TeamDetailDrawerProps {
  team: TeamItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (team: TeamItem) => void;
  onRemoveMember: (team: TeamItem, member: TeamMemberItem) => void;
  onToggleLock: (team: TeamItem) => void;
  onDisbandTeam: (team: TeamItem) => void;
}

export const TeamDetailDrawer: React.FC<TeamDetailDrawerProps> = ({
  team,
  isOpen,
  onClose,
  onAddMember,
  onRemoveMember,
  onToggleLock,
  onDisbandTeam,
}) => {
  if (!isOpen || !team) return null;

  const formatDateDisplay = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const isFull = team.memberCount >= team.maxTeamSize;
  const isBelowMin = team.memberCount < team.minTeamSize;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#131413]/50 backdrop-blur-xs animate-in fade-in duration-150 text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-drawer-title"
    >
      <div className="w-full max-w-xl h-full bg-[#FFFDF8] border-l border-[#DCDDD3] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#DCDDD3] bg-[#F7F4EA] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-[8px] bg-[#E2EBDD] text-[#028051] font-mono font-bold text-base flex items-center justify-center shrink-0 border border-[#B8CEB0]">
              {team.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="team-drawer-title" className="text-base font-heading font-extrabold text-[#171914] truncate">
                  {team.name}
                </h3>
                {team.status === 'LOCKED' && (
                  <span className="text-[10px] font-mono font-bold bg-[#FFF4DC] text-[#785A12] px-1.5 py-0.2 rounded border border-[#F0D597] flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> LOCKED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6D7068] font-body truncate">
                Captain: {team.captain.name} · Created {formatDateDisplay(team.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[6px] hover:bg-[#EAE7DC] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 font-body text-xs text-[#171914]">
          {/* Section 1: Sizing & Track Banner */}
          <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-2.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#6D7068] uppercase text-[10px] font-bold">
                Squad Sizing: {team.memberCount} / {team.maxTeamSize} Max
              </span>
              <span
                className={`font-bold ${
                  isFull ? 'text-[#028051]' : isBelowMin ? 'text-[#8B2C24]' : 'text-[#785A12]'
                }`}
              >
                {isFull ? 'Full Squad' : isBelowMin ? 'Below Min Requirement' : 'Open Slots Available'}
              </span>
            </div>

            {/* Sizing bar */}
            <div className="h-2.5 w-full bg-[#EAE7DC] rounded-full overflow-hidden">
              <div
                style={{ width: `${(team.memberCount / team.maxTeamSize) * 100}%` }}
                className={`h-full transition-all ${
                  isFull ? 'bg-[#028051]' : isBelowMin ? 'bg-[#DC2626]' : 'bg-[#D97706]'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#6D7068] pt-1">
              <span>Min required: {team.minTeamSize} members</span>
              <span>Track: {team.trackName || 'Unassigned'}</span>
            </div>
          </div>

          {/* Description */}
          {team.description && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#6D7068]">
                Team Mission / Project Idea
              </span>
              <p className="p-3 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] text-xs leading-relaxed">
                {team.description}
              </p>
            </div>
          )}

          {/* Section 2: Active Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase text-[#6D7068] flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-[#028051]" />
                Roster Members ({team.members.length})
              </h4>

              {team.status === 'ACTIVE' && !isFull && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAddMember(team)}
                  leftIcon={<Plus className="w-3 h-3 text-[#028051]" />}
                  className="text-xs font-mono h-7 px-2 border-[#B8CEB0] text-[#028051] hover:bg-[#E2EBDD]"
                >
                  Add Member
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-[8px] bg-[#FFFDF8] border border-[#DCDDD3] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                        member.role === 'CAPTAIN'
                          ? 'bg-[#028051] text-white'
                          : 'bg-[#EAE7DC] text-[#171914]'
                      }`}
                    >
                      {member.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-[#171914] truncate">
                          {member.name}
                        </span>
                        {member.role === 'CAPTAIN' && (
                          <span className="text-[9px] font-mono font-bold bg-[#E2EBDD] text-[#274535] px-1.5 py-0.2 rounded">
                            CAPTAIN
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#6D7068] font-body block truncate">
                        {member.email} · {member.college || 'Builder'}
                      </span>
                    </div>
                  </div>

                  {team.status === 'ACTIVE' && team.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveMember(team, member)}
                      title="Remove Member from Team"
                      className="p-1.5 rounded-[5px] hover:bg-[#FBE6E3] text-[#8B2C24] transition-colors cursor-pointer shrink-0"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Pending Invitations */}
          {team.invitations && team.invitations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[#6D7068]">
                Pending Member Invitations ({team.invitations.length})
              </h4>
              <div className="space-y-1.5">
                {team.invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-2.5 rounded-[6px] bg-[#FFF4DC]/40 border border-[#F0D597] flex items-center justify-between text-xs font-mono"
                  >
                    <span>{inv.inviteeName} ({inv.inviteeEmail})</span>
                    <span className="text-[10px] font-bold text-[#785A12] uppercase">
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Submission State */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-[#6D7068] flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-[#028051]" />
              Submission Pipeline Context
            </h4>
            <div className="p-3 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] flex items-center justify-between">
              <div>
                <span className="text-xs font-heading font-bold text-[#171914] block">
                  {team.submissionTitle || 'No project submitted yet'}
                </span>
                <span className="text-[11px] font-mono text-[#6D7068]">
                  Status: {team.submissionStatus || 'NONE'}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  team.submissionStatus === 'SUBMITTED'
                    ? 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]'
                    : 'bg-[#EAE7DC] text-[#6D7068] border-[#DCDDD3]'
                }`}
              >
                {team.submissionStatus || 'NOT STARTED'}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-[#DCDDD3] bg-[#F7F4EA] flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDisbandTeam(team)}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#8B2C24]" />}
            className="text-xs font-mono h-8 border-[#F3C9B2] text-[#8B2C24] hover:bg-[#FBE6E3]"
          >
            Disband Team
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onToggleLock(team)}
            leftIcon={
              team.status === 'LOCKED' ? (
                <Unlock className="w-3.5 h-3.5 text-[#028051]" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-[#6D7068]" />
              )
            }
            className="text-xs font-mono h-8"
          >
            {team.status === 'LOCKED' ? 'Unlock Team' : 'Lock Formation'}
          </Button>
        </div>
      </div>
    </div>
  );
};

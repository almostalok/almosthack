'use client';

import React, { useState } from 'react';
import { Button } from '@almosthack/ui';
import { UserPlus, X, Users2, CheckCircle2 } from 'lucide-react';
import { TeamItem, UnassignedParticipantItem } from './teams-types';

export interface AssignToTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  participant: UnassignedParticipantItem | null;
  teams: TeamItem[];
  onAssign: (teamId: string, unassignedId: string) => void;
  isAssigning: boolean;
}

export const AssignToTeamDialog: React.FC<AssignToTeamDialogProps> = ({
  isOpen,
  onClose,
  participant,
  teams,
  onAssign,
  isAssigning,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  if (!isOpen || !participant) return null;

  // Filter teams that have open slots
  const availableTeams = teams.filter(
    (t) => t.status === 'ACTIVE' && t.memberCount < t.maxTeamSize
  );

  const handleConfirm = () => {
    if (selectedTeamId) {
      onAssign(selectedTeamId, participant.id);
      setSelectedTeamId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-team-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 id="assign-team-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Assign {participant.name} to Team
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Select an open team with available membership slots.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6D7068] hover:text-[#171914] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Available Teams List */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 p-1">
          {availableTeams.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#6D7068] font-mono">
              No active teams currently have open membership slots.
            </div>
          ) : (
            availableTeams.map((team) => {
              const isSelected = selectedTeamId === team.id;
              const slotsLeft = team.maxTeamSize - team.memberCount;

              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`w-full p-3 rounded-[8px] border text-left transition-colors flex items-center justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#E2EBDD] border-[#028051]'
                      : 'bg-[#FFFDF8] border-[#DCDDD3] hover:bg-[#F7F4EA]'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-heading font-bold text-[#171914] block truncate">
                      {team.name}
                    </span>
                    <span className="text-[11px] text-[#6D7068] font-mono block truncate">
                      Lead: {team.captain.name} · {team.trackName || 'General Track'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
                      {slotsLeft} {slotsLeft === 1 ? 'slot' : 'slots'} open
                    </span>

                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#028051]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isAssigning}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedTeamId || isAssigning}
            isLoading={isAssigning}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Assign Builder
          </Button>
        </div>
      </div>
    </div>
  );
};

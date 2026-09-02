'use client';

import React, { useState, useMemo } from 'react';
import { Button, Input } from '@almosthack/ui';
import { UserPlus, X, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { TeamItem, UnassignedParticipantItem } from './teams-types';

export interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamItem | null;
  unassignedParticipants: UnassignedParticipantItem[];
  onAddMember: (teamId: string, unassignedId: string) => void;
  isAdding: boolean;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  isOpen,
  onClose,
  team,
  unassignedParticipants,
  onAddMember,
  isAdding,
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen || !team) return null;

  const filteredCandidates = unassignedParticipants.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.college.toLowerCase().includes(q)
    );
  });

  const handleConfirm = () => {
    if (selectedId) {
      onAddMember(team.id, selectedId);
      setSelectedId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-lg w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 id="add-member-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Add Builder to {team.name}
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Select an unassigned participant to place on this squad.
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

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6D7068] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by name, email, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] focus:outline-none focus:border-[#028051]"
          />
        </div>

        {/* Candidate List */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 p-1">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#6D7068] font-mono">
              No unassigned participants match your search.
            </div>
          ) : (
            filteredCandidates.map((candidate) => {
              const isSelected = selectedId === candidate.id;

              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setSelectedId(candidate.id)}
                  className={`w-full p-2.5 rounded-[8px] border text-left transition-colors flex items-center justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#E2EBDD] border-[#028051]'
                      : 'bg-[#FFFDF8] border-[#DCDDD3] hover:bg-[#F7F4EA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#EAE7DC] text-[#171914] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {candidate.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-heading font-bold text-[#171914] block truncate">
                        {candidate.name}
                      </span>
                      <span className="text-[10px] text-[#6D7068] font-body block truncate">
                        {candidate.college} · {candidate.branch}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#028051] shrink-0" />
                  ) : (
                    <span className="text-[10px] font-mono text-[#6D7068] shrink-0">
                      Select
                    </span>
                  )}
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
            disabled={isAdding}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedId || isAdding}
            isLoading={isAdding}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Add to Team
          </Button>
        </div>
      </div>
    </div>
  );
};

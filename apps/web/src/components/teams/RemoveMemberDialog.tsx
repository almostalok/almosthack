'use client';

import React from 'react';
import { Button } from '@almosthack/ui';
import { UserX, X, AlertTriangle } from 'lucide-react';
import { TeamItem, TeamMemberItem } from './teams-types';

export interface RemoveMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamItem | null;
  member: TeamMemberItem | null;
  onConfirm: () => void;
  isRemoving: boolean;
}

export const RemoveMemberDialog: React.FC<RemoveMemberDialogProps> = ({
  isOpen,
  onClose,
  team,
  member,
  onConfirm,
  isRemoving,
}) => {
  if (!isOpen || !team || !member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-member-title"
    >
      <div className="bg-[#FFFDF8] border border-[#F3C9B2] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#F3C9B2] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FBE6E3] text-[#8B2C24] flex items-center justify-center shrink-0">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <h3 id="remove-member-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Remove {member.name}?
              </h3>
              <p className="text-xs text-[#8B2C24] font-body">
                From squad <strong>{team.name}</strong>
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

        <div className="p-3 bg-[#FBE6E3]/40 rounded-[8px] border border-[#F3C9B2] text-xs font-body text-[#171914] space-y-1.5">
          <p>
            You are about to remove <strong>{member.name}</strong> from <strong>{team.name}</strong>.
          </p>
          <ul className="list-disc list-inside text-[11px] font-mono text-[#6D7068] space-y-0.5">
            <li>The participant will return to the unassigned builders pool.</li>
            <li>They can join or create another team squad.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isRemoving}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onConfirm}
            isLoading={isRemoving}
            leftIcon={<UserX className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#FBE6E3] border-[#F3C9B2] text-[#8B2C24] hover:bg-[#F3C9B2]"
          >
            Confirm Removal
          </Button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Button } from '@almosthack/ui';
import { CheckCircle2, X } from 'lucide-react';
import { ParticipantItem } from './registrations-types';

export interface ApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isApproving: boolean;
  participant?: ParticipantItem | null;
  bulkCount?: number;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isApproving,
  participant,
  bulkCount,
}) => {
  if (!isOpen) return null;

  const isBulk = Boolean(bulkCount && bulkCount > 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-dialog-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="approval-dialog-title" className="text-sm font-heading font-extrabold text-[#171914]">
                {isBulk ? `Approve ${bulkCount} Participants?` : `Approve ${participant?.name}?`}
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Admit to the hackathon workspace.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-[#F7F4EA] text-[#6D7068] hover:text-[#171914] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] text-xs font-body text-[#171914] space-y-1.5">
          <p>
            {isBulk
              ? `You are about to admit ${bulkCount} selected participants to this hackathon.`
              : `You are about to admit ${participant?.name} (${participant?.email}) to this hackathon.`}
          </p>
          <ul className="list-disc list-inside text-[11px] font-mono text-[#6D7068] space-y-0.5">
            <li>Status transitions to APPROVED.</li>
            <li>Participant can form or join teams and submit projects.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isApproving}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            isLoading={isApproving}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Confirm Approval
          </Button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Button, Textarea } from '@almosthack/ui';
import { Lock, X, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface ApproveResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  isApproving: boolean;
}

export const ApproveResultsDialog: React.FC<ApproveResultsDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isApproving,
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-dialog-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#DBEAFE] text-[#1E40AF] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="approve-dialog-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Approve & Lock Results
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Certify outcomes and lock scoring records against further edits.
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

        <div className="p-3 bg-[#E2EBDD]/40 rounded-[8px] border border-[#B8CEB0] text-xs font-mono text-[#274535] space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#028051]" />
            <span>Pre-Lock Verification Passed</span>
          </div>
          <p>
            All submitted projects have met evaluation thresholds. Locking will preserve this official consensus snapshot.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-mono font-bold uppercase text-[#171914]">
            Approval Audit Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Reviewed by organizing committee with zero tie disputes..."
            className="w-full bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] p-2 text-xs font-body text-[#171914] focus:outline-none focus:border-[#028051] h-18 resize-none"
          />
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
            onClick={() => onConfirm(notes)}
            isLoading={isApproving}
            leftIcon={<Lock className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Confirm Approval
          </Button>
        </div>
      </div>
    </div>
  );
};

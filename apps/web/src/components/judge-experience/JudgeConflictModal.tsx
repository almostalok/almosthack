'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { JudgeAssignmentEntity } from '@almosthack/types';

export interface JudgeConflictModalProps {
  isOpen: boolean;
  assignment: JudgeAssignmentEntity | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export const JudgeConflictModal: React.FC<JudgeConflictModalProps> = ({
  isOpen,
  assignment,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !assignment) return null;

  const handleConfirm = async () => {
    if (reason.trim().length < 5) {
      setError('Please provide a specific conflict reason (minimum 5 characters).');
      return;
    }
    setError('');
    await onConfirm(reason);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-dialog-title"
    >
      <div className="w-full max-w-md bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-2xl p-6 text-left space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
          <div className="flex items-center gap-2 text-[#991B1B]">
            <AlertTriangle className="w-5 h-5" />
            <h3
              id="conflict-dialog-title"
              className="font-heading font-extrabold text-base text-[#171914]"
            >
              Declare Conflict of Interest
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6D7068] hover:text-[#171914] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="p-3 rounded-[6px] bg-[#FEE2E2]/60 border border-[#FECACA] text-xs font-mono text-[#991B1B] space-y-1">
          <p className="font-bold">Recusal & Integrity Safeguard</p>
          <p className="text-[11px] text-[#7F1D1D] leading-relaxed">
            By declaring a conflict of interest, you will be excused from evaluating{' '}
            <strong className="text-[#171914]">{assignment.submission?.title}</strong>. An alternate judge will be automatically assigned.
          </p>
        </div>

        {/* Reason Input */}
        <div className="space-y-1 text-xs font-mono">
          <label className="font-bold text-[#171914] block">
            Reason for Recusal:
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Prior collaboration with team members, direct financial interest, or institutional affiliation..."
            className="w-full p-2.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#991B1B]"
          />
        </div>

        {error && (
          <p className="text-xs font-mono text-[#991B1B]">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            className="text-xs font-mono font-bold"
          >
            Confirm Recusal
          </Button>
        </div>
      </div>
    </div>
  );
};

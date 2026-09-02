'use client';

import React, { useState } from 'react';
import { Button, Input } from '@almosthack/ui';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { SubmissionItem } from './submissions-types';

export interface WithdrawSubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submission: SubmissionItem | null;
  onConfirm: () => void;
  isWithdrawing: boolean;
}

export const WithdrawSubmissionDialog: React.FC<WithdrawSubmissionDialogProps> = ({
  isOpen,
  onClose,
  submission,
  onConfirm,
  isWithdrawing,
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen || !submission) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-sub-title"
    >
      <div className="bg-[#FFFDF8] border border-[#F3C9B2] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#F3C9B2] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FBE6E3] text-[#8B2C24] flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="withdraw-sub-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Withdraw Submission?
              </h3>
              <p className="text-xs text-[#8B2C24] font-body">
                {submission.title}
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

        <div className="p-3 bg-[#FBE6E3]/40 rounded-[8px] border border-[#F3C9B2] text-xs font-body text-[#171914] space-y-2">
          <p>
            You are about to mark this project submission as <strong>WITHDRAWN</strong>.
          </p>
          <ul className="list-disc list-inside text-[11px] font-mono text-[#8B2C24] space-y-0.5">
            <li>The project will be excluded from the judging pool.</li>
            <li>The team can still review their submission history.</li>
          </ul>

          <div className="pt-2">
            <label className="block text-[10px] font-mono text-[#171914] mb-1">
              Type <strong className="text-[#8B2C24]">WITHDRAW</strong> to confirm:
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="WITHDRAW"
              className="w-full text-xs font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isWithdrawing}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onConfirm}
            disabled={confirmText.trim().toUpperCase() !== 'WITHDRAW' || isWithdrawing}
            isLoading={isWithdrawing}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#FBE6E3] border-[#F3C9B2] text-[#8B2C24] hover:bg-[#F3C9B2]"
          >
            Withdraw Submission
          </Button>
        </div>
      </div>
    </div>
  );
};

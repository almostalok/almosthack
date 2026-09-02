'use client';

import React, { useState } from 'react';
import { Button } from '@almosthack/ui';
import { XCircle, X, AlertTriangle } from 'lucide-react';
import { ParticipantItem } from './registrations-types';

export interface RejectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isRejecting: boolean;
  participant?: ParticipantItem | null;
  bulkCount?: number;
}

export const RejectionDialog: React.FC<RejectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isRejecting,
  participant,
  bulkCount,
}) => {
  const [reason, setReason] = useState('');
  if (!isOpen) return null;

  const isBulk = Boolean(bulkCount && bulkCount > 1);

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rejection-dialog-title"
    >
      <div className="bg-[#FFFDF8] border border-[#F3C9B2] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FBE6E3] text-[#8B2C24] flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 id="rejection-dialog-title" className="text-sm font-heading font-extrabold text-[#171914]">
                {isBulk ? `Reject ${bulkCount} Participants?` : `Reject ${participant?.name}?`}
              </h3>
              <p className="text-xs text-[#8B2C24] font-body">
                Decline registration application.
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

        <div className="p-3 bg-[#FBE6E3]/40 rounded-[8px] border border-[#F3C9B2] text-xs font-body text-[#171914] space-y-2">
          <p>
            {isBulk
              ? `You are rejecting ${bulkCount} selected participants. They will be marked as REJECTED and cannot submit projects.`
              : `You are rejecting ${participant?.name} (${participant?.email}).`}
          </p>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
              Rejection Reason <span className="text-[#6D7068] font-normal">(Optional internal / notice note)</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Ineligible graduation year, outside participant scope..."
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] p-2 text-xs font-body focus:outline-none focus:border-[#8B2C24]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isRejecting}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleConfirm}
            isLoading={isRejecting}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#FBE6E3] border-[#F3C9B2] text-[#8B2C24] hover:bg-[#F3C9B2]"
          >
            Confirm Rejection
          </Button>
        </div>
      </div>
    </div>
  );
};

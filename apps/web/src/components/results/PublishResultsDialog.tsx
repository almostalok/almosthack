'use client';

import React from 'react';
import { Button } from '@almosthack/ui';
import { Send, X, Trophy, AlertTriangle } from 'lucide-react';

export interface PublishResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
}

export const PublishResultsDialog: React.FC<PublishResultsDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPublishing,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 id="publish-dialog-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Publish Official Results?
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Make leaderboard standings, awards, and ledgers public.
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

        <p className="text-xs text-[#171914] leading-relaxed">
          Publishing results will unveil the official leaderboard to all participants, unlock transparent evaluation ledgers for project teams, and notify winners.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isPublishing}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            isLoading={isPublishing}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Confirm & Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

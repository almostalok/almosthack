'use client';

import React from 'react';
import {
  Megaphone,
  AlertTriangle,
  Send,
  X,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { AnnouncementEntity, AnnouncementRecipientScope } from './announcements-types';

export interface PublishAnnouncementDialogProps {
  isOpen: boolean;
  announcement: AnnouncementEntity | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting?: boolean;
}

export const PublishAnnouncementDialog: React.FC<PublishAnnouncementDialogProps> = ({
  isOpen,
  announcement,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen || !announcement) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <div className="w-full max-w-md bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-2xl p-6 text-left space-y-5">
        <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center text-[#028051]">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="publish-dialog-title"
                className="text-sm font-heading font-extrabold text-[#171914]"
              >
                Confirm Immediate Broadcast
              </h2>
              <p className="text-[11px] text-[#6D7068] font-body">
                Broadcast notification will be generated instantly.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Details Card */}
        <div className="p-3.5 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[8px] space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-[#6D7068]">
            <span>Target Audience:</span>
            <span className="font-bold text-[#171914]">{announcement.recipientScope}</span>
          </div>

          <div className="pt-2 border-t border-[#DCDDD3]/70">
            <span className="text-[10px] text-[#6D7068] block uppercase">Title:</span>
            <span className="font-heading font-bold text-xs text-[#171914] block mt-0.5">
              {announcement.title}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#FFF4DC] border border-[#F0D597] rounded-[6px] text-xs font-mono text-[#785A12] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <span>
            This action will immediately deliver in-app notifications and email dispatch to all verified recipients in this scope.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-mono"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            onClick={onConfirm}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="text-xs font-mono bg-[#028051] hover:bg-[#026b44] text-[#FFFDF8] font-bold"
          >
            {isSubmitting ? 'Broadcasting...' : 'Confirm & Broadcast'}
          </Button>
        </div>
      </div>
    </div>
  );
};

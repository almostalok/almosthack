'use client';

import React, { useState } from 'react';
import { Clock, X, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { AnnouncementEntity } from './announcements-types';

export interface ScheduleAnnouncementDialogProps {
  isOpen: boolean;
  announcement: AnnouncementEntity | null;
  onClose: () => void;
  onConfirm: (scheduledAt: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const ScheduleAnnouncementDialog: React.FC<ScheduleAnnouncementDialogProps> = ({
  isOpen,
  announcement,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const [scheduleDate, setScheduleDate] = useState('');

  if (!isOpen || !announcement) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate) return;
    await onConfirm(new Date(scheduleDate).toISOString());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-dialog-title"
    >
      <div className="w-full max-w-md bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-2xl p-6 text-left space-y-5">
        <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#DBEAFE] border border-[#BFDBFE] flex items-center justify-center text-[#1E40AF]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="schedule-dialog-title"
                className="text-sm font-heading font-extrabold text-[#171914]"
              >
                Schedule Publication Time
              </h2>
              <p className="text-[11px] text-[#6D7068] font-body">
                The announcement will automatically broadcast at this timestamp.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-[#171914] block">
              Publication Datetime (Local / UTC) *
            </label>
            <input
              type="datetime-local"
              required
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-[#171914] focus:outline-none focus:border-[#028051]"
            />
            <span className="text-[10px] font-mono text-[#6D7068] block">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCDDD3]">
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
              disabled={isSubmitting || !scheduleDate}
              type="submit"
              className="text-xs font-mono bg-[#1E40AF] hover:bg-[#1E3A8A] text-[#FFFDF8] font-bold"
            >
              {isSubmitting ? 'Setting Schedule...' : 'Confirm Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

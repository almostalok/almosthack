'use client';

import React from 'react';
import {
  Megaphone,
  X,
  Clock,
  CheckCircle2,
  FileEdit,
  XCircle,
  Users,
  Send,
  Calendar,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import {
  AnnouncementEntity,
  AnnouncementStatus,
  AnnouncementRecipientScope,
} from './announcements-types';

export interface AnnouncementDetailModalProps {
  isOpen: boolean;
  announcement: AnnouncementEntity | null;
  onClose: () => void;
  onPublishClick: (announcement: AnnouncementEntity) => void;
  onScheduleClick: (announcement: AnnouncementEntity) => void;
  onCancelClick: (announcement: AnnouncementEntity) => void;
  isOrganizer?: boolean;
}

export const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  isOpen,
  announcement,
  onClose,
  onPublishClick,
  onScheduleClick,
  onCancelClick,
  isOrganizer = true,
}) => {
  if (!isOpen || !announcement) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-detail-title"
    >
      <div className="w-full max-w-xl bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-2xl p-6 text-left space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-center text-[#171914]">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#6D7068] uppercase block">
                Announcement Details
              </span>
              <h2
                id="announcement-detail-title"
                className="text-base font-heading font-extrabold text-[#171914] truncate max-w-sm"
              >
                {announcement.title}
              </h2>
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

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono p-3 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[8px]">
          <div>
            <span className="text-[10px] text-[#6D7068] block">Status:</span>
            <span className="font-bold text-[#171914]">{announcement.status}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6D7068] block">Audience:</span>
            <span className="font-bold text-[#171914]">{announcement.recipientScope}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6D7068] block">Author:</span>
            <span className="font-bold text-[#171914] truncate block">
              {announcement.author?.name || 'Organizer'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#6D7068] block">Version:</span>
            <span className="font-bold text-[#171914]">v{announcement.version}</span>
          </div>
        </div>

        {/* Message Body Content */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold text-[#171914] uppercase">
            Broadcast Content
          </span>
          <div className="p-4 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[8px] text-xs font-body text-[#171914] whitespace-pre-line leading-relaxed shadow-2xs">
            {announcement.body}
          </div>
        </div>

        {/* Timeline Metadata */}
        <div className="p-3 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[8px] text-xs font-mono text-[#6D7068] space-y-1">
          <div className="flex items-center justify-between">
            <span>Created At:</span>
            <span className="font-bold text-[#171914]">
              {new Date(announcement.createdAt).toLocaleString()}
            </span>
          </div>
          {announcement.scheduledAt && (
            <div className="flex items-center justify-between text-[#1E40AF]">
              <span>Scheduled For:</span>
              <span className="font-bold">
                {new Date(announcement.scheduledAt).toLocaleString()}
              </span>
            </div>
          )}
          {announcement.publishedAt && (
            <div className="flex items-center justify-between text-[#028051]">
              <span>Published At:</span>
              <span className="font-bold">
                {new Date(announcement.publishedAt).toLocaleString()}
              </span>
            </div>
          )}
          {announcement.cancelledAt && (
            <div className="flex items-center justify-between text-[#991B1B]">
              <span>Cancelled At:</span>
              <span className="font-bold">
                {new Date(announcement.cancelledAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono"
          >
            Close
          </Button>

          {isOrganizer && (
            <div className="flex items-center gap-2">
              {announcement.status === AnnouncementStatus.DRAFT && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onScheduleClick(announcement);
                    }}
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                    className="text-xs font-mono"
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onPublishClick(announcement);
                    }}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className="text-xs font-mono bg-[#028051] hover:bg-[#026b44] text-[#FFFDF8] font-bold"
                  >
                    Publish Now
                  </Button>
                </>
              )}

              {announcement.status === AnnouncementStatus.SCHEDULED && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onCancelClick(announcement);
                    }}
                    className="text-xs font-mono text-[#991B1B] border-[#FECACA] hover:bg-[#FEE2E2]"
                  >
                    Cancel Schedule
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onPublishClick(announcement);
                    }}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className="text-xs font-mono bg-[#028051] hover:bg-[#026b44] text-[#FFFDF8] font-bold"
                  >
                    Publish Immediately
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

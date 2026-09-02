'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
  Users,
  Users2,
  Scale,
  ShieldCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  AnnouncementEntity,
  AnnouncementStatus,
  AnnouncementRecipientScope,
} from './announcements-types';

export interface AnnouncementMobileCardProps {
  announcement: AnnouncementEntity;
  onSelect: (announcement: AnnouncementEntity) => void;
  onPublishClick: (announcement: AnnouncementEntity) => void;
  onScheduleClick: (announcement: AnnouncementEntity) => void;
  onCancelClick: (announcement: AnnouncementEntity) => void;
  isOrganizer?: boolean;
}

export const AnnouncementMobileCard: React.FC<AnnouncementMobileCardProps> = ({
  announcement,
  onSelect,
  onPublishClick,
  onScheduleClick,
  onCancelClick,
  isOrganizer = true,
}) => {
  const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case AnnouncementStatus.PUBLISHED:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]">
            PUBLISHED
          </span>
        );
      case AnnouncementStatus.SCHEDULED:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]">
            SCHEDULED
          </span>
        );
      case AnnouncementStatus.DRAFT:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            DRAFT
          </span>
        );
      case AnnouncementStatus.CANCELLED:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
            CANCELLED
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(announcement)}
      className="p-4 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-3 cursor-pointer hover:border-[#028051] transition-colors"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#DCDDD3]/70 pb-2">
        <span className="text-[10px] font-mono text-[#6D7068]">
          Audience: {announcement.recipientScope}
        </span>
        {getStatusBadge(announcement.status)}
      </div>

      <div className="space-y-1">
        <h4 className="font-heading font-bold text-xs text-[#171914]">
          {announcement.title}
        </h4>
        <p className="text-[11px] text-[#6D7068] font-body line-clamp-2">
          {announcement.body}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#DCDDD3]/60 font-mono text-[10px] text-[#6D7068]">
        <span>
          {announcement.publishedAt
            ? `Pub: ${new Date(announcement.publishedAt).toLocaleDateString()}`
            : announcement.scheduledAt
            ? `Sched: ${new Date(announcement.scheduledAt).toLocaleDateString()}`
            : `Created: ${new Date(announcement.createdAt).toLocaleDateString()}`}
        </span>

        <span className="text-[#028051] font-bold flex items-center gap-1">
          View Details <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

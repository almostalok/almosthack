'use client';

import React from 'react';
import {
  Megaphone,
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
  Users,
  Users2,
  Scale,
  ShieldCheck,
  Layers,
  MoreHorizontal,
  Send,
  Calendar,
  Eye,
} from 'lucide-react';
import {
  AnnouncementEntity,
  AnnouncementStatus,
  AnnouncementRecipientScope,
} from './announcements-types';
import { Button } from '@almosthack/ui';

export interface AnnouncementTableProps {
  announcements: AnnouncementEntity[];
  onSelect: (announcement: AnnouncementEntity) => void;
  onPublishClick: (announcement: AnnouncementEntity) => void;
  onScheduleClick: (announcement: AnnouncementEntity) => void;
  onCancelClick: (announcement: AnnouncementEntity) => void;
  isOrganizer?: boolean;
}

export const AnnouncementTable: React.FC<AnnouncementTableProps> = ({
  announcements,
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
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]">
            <CheckCircle2 className="w-3 h-3" />
            PUBLISHED
          </span>
        );
      case AnnouncementStatus.SCHEDULED:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]">
            <Clock className="w-3 h-3" />
            SCHEDULED
          </span>
        );
      case AnnouncementStatus.DRAFT:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <FileEdit className="w-3 h-3" />
            DRAFT
          </span>
        );
      case AnnouncementStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
            <XCircle className="w-3 h-3" />
            CANCELLED
          </span>
        );
    }
  };

  const getScopeBadge = (
    scope: AnnouncementRecipientScope,
    trackId?: string | null
  ) => {
    switch (scope) {
      case AnnouncementRecipientScope.ALL_PARTICIPANTS:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F7F4EA] text-[#171914] border border-[#DCDDD3]">
            <Users className="w-3 h-3 text-[#6D7068]" />
            All Participants
          </span>
        );
      case AnnouncementRecipientScope.ALL_TEAMS:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F7F4EA] text-[#171914] border border-[#DCDDD3]">
            <Users2 className="w-3 h-3 text-[#6D7068]" />
            All Teams
          </span>
        );
      case AnnouncementRecipientScope.ALL_JUDGES:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F7F4EA] text-[#171914] border border-[#DCDDD3]">
            <Scale className="w-3 h-3 text-[#6D7068]" />
            All Judges
          </span>
        );
      case AnnouncementRecipientScope.ALL_ORGANIZERS:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F7F4EA] text-[#171914] border border-[#DCDDD3]">
            <ShieldCheck className="w-3 h-3 text-[#6D7068]" />
            All Organizers
          </span>
        );
      case AnnouncementRecipientScope.TRACK:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F7F4EA] text-[#171914] border border-[#DCDDD3]">
            <Layers className="w-3 h-3 text-[#6D7068]" />
            Track: {trackId === 'trk_ai' ? 'AI Safety' : 'Systems'}
          </span>
        );
    }
  };

  if (announcements.length === 0) {
    return (
      <div className="p-12 text-center rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-center mx-auto text-[#6D7068]">
          <Megaphone className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-heading font-bold text-[#171914]">
          No announcements match your filter
        </h3>
        <p className="text-xs text-[#6D7068] max-w-sm mx-auto font-body">
          Adjust the status tabs or audience filters above, or draft a new broadcast message for your event.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs overflow-hidden text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-body text-[#171914]">
          <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[10px] font-bold text-[#6D7068] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Announcement</th>
              <th className="px-4 py-3">Audience</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Timeline</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCDDD3]/70">
            {announcements.map((a) => {
              return (
                <tr
                  key={a.id}
                  className="hover:bg-[#F7F4EA]/50 transition-colors cursor-pointer"
                  onClick={() => onSelect(a)}
                >
                  {/* Announcement Title & Snippet */}
                  <td className="px-4 py-3.5 max-w-xs sm:max-w-sm">
                    <div className="space-y-0.5">
                      <span className="font-heading font-bold text-xs text-[#171914] hover:text-[#028051] transition-colors block truncate">
                        {a.title}
                      </span>
                      <p className="text-[11px] text-[#6D7068] line-clamp-1 font-body">
                        {a.body}
                      </p>
                    </div>
                  </td>

                  {/* Audience */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getScopeBadge(a.recipientScope, a.targetTrackId)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getStatusBadge(a.status)}
                  </td>

                  {/* Timeline */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#6D7068]">
                    {a.publishedAt ? (
                      <div>
                        <span className="text-[#028051] font-bold block">
                          Published
                        </span>
                        <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                      </div>
                    ) : a.scheduledAt ? (
                      <div>
                        <span className="text-[#1E40AF] font-bold block">
                          Scheduled
                        </span>
                        <span>{new Date(a.scheduledAt).toLocaleString()}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[#785A12] block">Draft</span>
                        <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </td>

                  {/* Author */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#6D7068]">
                    <span className="font-bold text-[#171914] block">
                      {a.author?.name || 'Organizer'}
                    </span>
                    <span className="text-[10px]">v{a.version}</span>
                  </td>

                  {/* Actions */}
                  <td
                    className="px-4 py-3.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5 font-mono text-xs">
                      {a.status === AnnouncementStatus.DRAFT && isOrganizer && (
                        <>
                          <button
                            type="button"
                            onClick={() => onScheduleClick(a)}
                            className="p-1 px-2 text-[11px] border border-[#DCDDD3] bg-[#FFFDF8] hover:bg-[#F7F4EA] rounded text-[#171914] font-bold cursor-pointer"
                          >
                            Schedule
                          </button>
                          <button
                            type="button"
                            onClick={() => onPublishClick(a)}
                            className="p-1 px-2 text-[11px] bg-[#028051] hover:bg-[#026b44] text-[#FFFDF8] rounded font-bold cursor-pointer"
                          >
                            Publish Now
                          </button>
                        </>
                      )}

                      {a.status === AnnouncementStatus.SCHEDULED && isOrganizer && (
                        <>
                          <button
                            type="button"
                            onClick={() => onCancelClick(a)}
                            className="p-1 px-2 text-[11px] border border-[#FECACA] bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#991B1B] rounded font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => onPublishClick(a)}
                            className="p-1 px-2 text-[11px] bg-[#028051] hover:bg-[#026b44] text-[#FFFDF8] rounded font-bold cursor-pointer"
                          >
                            Publish
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelect(a)}
                        className="p-1.5 text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] rounded cursor-pointer"
                        title="View Full Announcement"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

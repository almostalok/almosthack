'use client';

import React from 'react';
import {
  Search,
  Plus,
  Filter,
  Users,
  Layers,
  Megaphone,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import {
  AnnouncementFilterState,
  AnnouncementStatus,
  AnnouncementRecipientScope,
} from './announcements-types';
import { HackathonTrackEntity } from '@almosthack/types';

export interface AnnouncementToolbarProps {
  filters: AnnouncementFilterState;
  onUpdateFilters: (updates: Partial<AnnouncementFilterState>) => void;
  tracks: HackathonTrackEntity[];
  onCreateClick: () => void;
  isOrganizer?: boolean;
}

export const AnnouncementToolbar: React.FC<AnnouncementToolbarProps> = ({
  filters,
  onUpdateFilters,
  tracks,
  onCreateClick,
  isOrganizer = true,
}) => {
  return (
    <div className="space-y-3 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D7068]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            placeholder="Search announcement titles, message content, authors..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051]"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audience Filter */}
          <div className="relative">
            <select
              value={filters.scope}
              onChange={(e) =>
                onUpdateFilters({
                  scope: e.target.value as 'ALL' | AnnouncementRecipientScope,
                })
              }
              aria-label="Filter by recipient audience"
              className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] py-1.5 px-3 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
            >
              <option value="ALL">All Audiences</option>
              <option value={AnnouncementRecipientScope.ALL_PARTICIPANTS}>
                All Participants
              </option>
              <option value={AnnouncementRecipientScope.ALL_TEAMS}>
                All Active Teams
              </option>
              <option value={AnnouncementRecipientScope.ALL_JUDGES}>
                All Reviewers / Judges
              </option>
              <option value={AnnouncementRecipientScope.ALL_ORGANIZERS}>
                All Organizers
              </option>
              <option value={AnnouncementRecipientScope.TRACK}>
                Specific Track
              </option>
            </select>
          </div>

          {/* Track Filter if Track selected */}
          {filters.scope === AnnouncementRecipientScope.TRACK && (
            <div className="relative">
              <select
                value={filters.trackId}
                onChange={(e) => onUpdateFilters({ trackId: e.target.value })}
                aria-label="Filter specific track"
                className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] py-1.5 px-3 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
              >
                <option value="ALL">All Tracks</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Create Button */}
          {isOrganizer && (
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateClick}
              leftIcon={<Plus className="w-4 h-4" />}
              className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#026b44] text-[#FFFDF8] font-bold"
            >
              New Announcement
            </Button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#DCDDD3] select-none text-xs font-mono font-bold">
        {[
          { id: 'ALL', label: 'All Statuses' },
          { id: AnnouncementStatus.PUBLISHED, label: 'Published' },
          { id: AnnouncementStatus.SCHEDULED, label: 'Scheduled' },
          { id: AnnouncementStatus.DRAFT, label: 'Drafts' },
          { id: AnnouncementStatus.CANCELLED, label: 'Cancelled' },
        ].map((tab) => {
          const isActive = filters.status === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                onUpdateFilters({ status: tab.id as 'ALL' | AnnouncementStatus })
              }
              className={`px-3 py-1.5 rounded-[6px] transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]'
                  : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

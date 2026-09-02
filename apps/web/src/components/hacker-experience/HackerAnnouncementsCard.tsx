'use client';

import React from 'react';
import {
  Megaphone,
  Pin,
  Clock,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AnnouncementEntity } from '@almosthack/types';

export interface HackerAnnouncementsCardProps {
  announcements: AnnouncementEntity[];
}

export const HackerAnnouncementsCard: React.FC<HackerAnnouncementsCardProps> = ({
  announcements,
}) => {
  if (!announcements.length) {
    return (
      <div className="p-6 text-center rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] space-y-2 text-left">
        <Megaphone className="w-5 h-5 text-[#6D7068] mx-auto opacity-50" />
        <p className="text-xs font-mono text-[#6D7068] text-center">
          No announcements published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2 text-[#028051]">
          <Megaphone className="w-4 h-4" />
          <h3 className="font-heading font-extrabold text-sm text-[#171914] uppercase tracking-wide">
            Organizer Broadcasts & Updates
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {announcements.map((ann) => {
          return (
            <div
              key={ann.id}
              className="p-4 rounded-[8px] border space-y-2 transition-all bg-[#F7F4EA] border-[#DCDDD3]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-heading font-extrabold text-xs text-[#171914]">
                    {ann.title}
                  </h4>
                </div>

                <span className="text-[10px] font-mono text-[#6D7068] shrink-0">
                  {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric' }
                  )}
                </span>
              </div>

              <p className="text-xs font-body text-[#43463E] leading-relaxed">
                {ann.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

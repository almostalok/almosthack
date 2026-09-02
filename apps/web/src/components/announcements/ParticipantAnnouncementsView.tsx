'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  Megaphone,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import { AnnouncementEntity, AnnouncementStatus } from './announcements-types';
import { MOCK_ANNOUNCEMENTS } from './announcements-mock-data';

export const ParticipantAnnouncementsView: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: announcements = [] } = useQuery<AnnouncementEntity[]>({
    queryKey: ['participant-announcements'],
    queryFn: async () => {
      try {
        const res = await apiClient.getAnnouncements('htf-2026');
        if (Array.isArray(res) && res.length > 0) {
          return res.filter((a) => a.status === AnnouncementStatus.PUBLISHED);
        }
        return MOCK_ANNOUNCEMENTS.filter((a) => a.status === AnnouncementStatus.PUBLISHED);
      } catch {
        return MOCK_ANNOUNCEMENTS.filter((a) => a.status === AnnouncementStatus.PUBLISHED);
      }
    },
  });

  const filtered = announcements.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <div className="space-y-1 pb-4 border-b border-[#DCDDD3]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center text-[#028051]">
            <Megaphone className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight">
            Hackathon Announcements
          </h1>
        </div>
        <p className="text-xs text-[#6D7068] font-body">
          Official broadcasts, operational alerts, and schedule milestones for Hack The Future 2026.
        </p>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D7068]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search announcements..."
          className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] focus:outline-none focus:border-[#028051]"
        />
      </div>

      {/* Announcements Stream */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] space-y-2">
          <Megaphone className="w-8 h-8 text-[#6D7068] mx-auto" />
          <h3 className="text-sm font-heading font-bold text-[#171914]">
            No announcements yet
          </h3>
          <p className="text-xs text-[#6D7068] font-body">
            Stay tuned for event announcements and milestone updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCDDD3]/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]">
                    OFFICIAL
                  </span>
                  <h3 className="text-sm font-heading font-bold text-[#171914]">
                    {a.title}
                  </h3>
                </div>

                <span className="text-[11px] font-mono text-[#6D7068]">
                  {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : 'Recent'}
                </span>
              </div>

              <div className="text-xs font-body text-[#171914] whitespace-pre-line leading-relaxed">
                {a.body}
              </div>

              <div className="pt-2 border-t border-[#DCDDD3]/60 flex items-center justify-between text-[10px] font-mono text-[#6D7068]">
                <span>Author: {a.author?.name || 'Hackathon Operations'}</span>
                <span>Audience: {a.recipientScope}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

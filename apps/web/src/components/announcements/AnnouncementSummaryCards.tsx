'use client';

import React from 'react';
import {
  Megaphone,
  CheckCircle2,
  Clock,
  FileEdit,
  Users,
} from 'lucide-react';
import { AnnouncementMetrics } from './announcements-types';

export interface AnnouncementSummaryCardsProps {
  metrics: AnnouncementMetrics;
}

export const AnnouncementSummaryCards: React.FC<AnnouncementSummaryCardsProps> = ({
  metrics,
}) => {
  const cards = [
    {
      label: 'Total Announcements',
      value: metrics.total,
      icon: Megaphone,
      color: 'text-[#171914]',
      bg: 'bg-[#F7F4EA]',
      border: 'border-[#DCDDD3]',
    },
    {
      label: 'Published Broadcasts',
      value: metrics.published,
      icon: CheckCircle2,
      color: 'text-[#028051]',
      bg: 'bg-[#E2EBDD]',
      border: 'border-[#B8CEB0]',
    },
    {
      label: 'Scheduled in Queue',
      value: metrics.scheduled,
      icon: Clock,
      color: 'text-[#1E40AF]',
      bg: 'bg-[#DBEAFE]',
      border: 'border-[#BFDBFE]',
    },
    {
      label: 'Draft Messages',
      value: metrics.drafts,
      icon: FileEdit,
      color: 'text-[#785A12]',
      bg: 'bg-[#FFF4DC]',
      border: 'border-[#F0D597]',
    },
    {
      label: 'Est. Total Reach',
      value: `${metrics.recipientsReached.toLocaleString()}+`,
      icon: Users,
      color: 'text-[#028051]',
      bg: 'bg-[#F7F4EA]',
      border: 'border-[#DCDDD3]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-left">
      {cards.map((c, idx) => {
        const Icon = c.icon;

        return (
          <div
            key={idx}
            className="p-3.5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs flex items-center justify-between gap-2"
          >
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-[#6D7068] block">
                {c.label}
              </span>
              <span className={`text-lg font-heading font-extrabold ${c.color}`}>
                {c.value}
              </span>
            </div>

            <div
              className={`w-8 h-8 rounded-full ${c.bg} border ${c.border} flex items-center justify-center shrink-0 ${c.color}`}
            >
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

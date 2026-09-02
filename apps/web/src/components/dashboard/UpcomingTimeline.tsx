'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@almosthack/ui';
import { UpcomingMilestone } from './dashboard-mock-data';

export interface UpcomingTimelineProps {
  milestones: UpcomingMilestone[];
}

export const UpcomingTimeline: React.FC<UpcomingTimelineProps> = ({ milestones }) => {
  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left">
      <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD3]/70 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#028051]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
            Upcoming Milestones
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#6D7068]">Official Schedule</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {milestones.map((m, idx) => {
          const isCurrent = m.status === 'current';
          const isCompleted = m.status === 'completed';

          return (
            <div
              key={m.id}
              className={`p-3 rounded-[8px] border transition-all ${
                isCurrent
                  ? 'bg-[#E2EBDD]/60 border-[#B8CEB0] ring-1 ring-[#028051]/30'
                  : isCompleted
                  ? 'bg-[#F7F4EA]/50 border-[#DCDDD3] opacity-75'
                  : 'bg-[#FFFDF8] border-[#DCDDD3]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#6D7068]">
                  {m.label}
                </span>
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-[#028051] animate-pulse" />
                )}
                {isCompleted && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#028051]" />
                )}
              </div>

              <span className="text-xs font-heading font-bold text-[#171914] block leading-snug">
                {m.title}
              </span>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#6D7068] mt-2 pt-1.5 border-t border-[#DCDDD3]/50">
                <span className="font-semibold text-[#171914]">{m.date}</span>
                {m.timeRemaining && (
                  <span className="text-[#028051] text-[10px] font-semibold">
                    {m.timeRemaining}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

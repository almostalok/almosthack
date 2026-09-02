'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@almosthack/ui';
import { WorkspaceTimelinePhase } from './workspace-mock-data';

export interface EventTimelineProps {
  timeline: WorkspaceTimelinePhase[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ timeline }) => {
  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left">
      <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD3]/70 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#028051]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
            Event Lifecycle Timeline
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#6D7068]">Phase Schedule</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {timeline.map((phase) => {
          const isCompleted = phase.status === 'completed';
          const isActive = phase.status === 'active';

          return (
            <div
              key={phase.id}
              className={`p-3.5 rounded-[8px] border transition-all ${
                isActive
                  ? 'bg-[#E2EBDD]/60 border-[#B8CEB0] ring-1 ring-[#028051]/30'
                  : isCompleted
                  ? 'bg-[#F7F4EA]/60 border-[#DCDDD3]'
                  : 'bg-[#FFFDF8] border-[#DCDDD3]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6D7068]">
                  {phase.dateLabel}
                </span>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-[#028051]" />}
                {isActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#028051] bg-[#FFFDF8] px-1.5 py-0.5 rounded border border-[#B8CEB0]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#028051] animate-pulse" />
                    Active
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-heading font-bold text-[#171914] mb-1">
                {phase.title}
              </h4>

              <p className="text-[11px] font-body text-[#6D7068] leading-relaxed">
                {phase.detail}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

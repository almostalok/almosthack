import React from 'react';
import { cn } from '@almosthack/utils';
import { Check } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description?: string;
  status?: 'completed' | 'current' | 'upcoming';
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  return (
    <div className={cn('relative flex flex-col gap-6 pl-4 border-l border-[#DCDDD3] ml-2 text-left font-body', className)}>
      {events.map((event) => {
        const isCompleted = event.status === 'completed';
        const isCurrent = event.status === 'current';

        return (
          <div key={event.id} className="relative flex flex-col gap-1 group">
            {/* Dot marker */}
            <div
              className={cn(
                'absolute -left-[23px] top-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-colors',
                isCompleted
                  ? 'bg-[#355C45] border-[#274535] text-[#FFFDF8]'
                  : isCurrent
                  ? 'bg-[#FFFDF8] border-[#355C45] ring-2 ring-[#355C45]/20'
                  : 'bg-[#FFFDF8] border-[#DCDDD3]'
              )}
            >
              {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              {isCurrent && <span className="w-2 h-2 rounded-full bg-[#355C45]" />}
            </div>

            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-bold text-[#171914] font-mono">{event.title}</h4>
              <span className="text-[11px] font-mono text-[#6D7068]">{event.timestamp}</span>
            </div>
            {event.description && (
              <p className="text-xs text-[#6D7068] font-body leading-relaxed">{event.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

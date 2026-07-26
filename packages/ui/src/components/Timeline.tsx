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
    <div className={cn('relative flex flex-col gap-6 pl-4 border-l border-zinc-800 ml-2', className)}>
      {events.map((event) => {
        const isCompleted = event.status === 'completed';
        const isCurrent = event.status === 'current';

        return (
          <div key={event.id} className="relative flex flex-col gap-1 group">
            {/* Dot marker */}
            <div
              className={cn(
                'absolute -left-[21px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
                isCompleted
                  ? 'bg-emerald-500 border-emerald-400 text-black'
                  : isCurrent
                  ? 'bg-zinc-900 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-zinc-950 border-zinc-700'
              )}
            >
              {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </div>

            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-semibold text-zinc-200 font-mono">{event.title}</h4>
              <span className="text-[11px] font-mono text-zinc-500">{event.timestamp}</span>
            </div>
            {event.description && (
              <p className="text-xs text-zinc-400 font-sans">{event.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

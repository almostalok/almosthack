import React from 'react';
import { cn } from '@almosthack/utils';
import { ShieldCheck, GitCommit, UserCheck, Trophy } from 'lucide-react';

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timeAgo: string;
  type?: 'audit' | 'commit' | 'user' | 'judge';
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, className }) => {
  const getIcon = (type?: ActivityItem['type']) => {
    switch (type) {
      case 'audit':
        return <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />;
      case 'commit':
        return <GitCommit className="w-3.5 h-3.5 text-emerald-400" />;
      case 'judge':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className={cn('flex flex-col divide-y divide-zinc-800/60 font-mono text-xs', className)}>
      {activities.map((item) => (
        <div key={item.id} className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-900/40 px-2 rounded-sm transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="p-1 rounded bg-zinc-900 border border-zinc-800 shrink-0">
              {getIcon(item.type)}
            </span>
            <div className="truncate">
              <span className="font-semibold text-zinc-200">{item.actor}</span>{' '}
              <span className="text-zinc-400">{item.action}</span>{' '}
              <span className="text-zinc-200 underline underline-offset-2 decoration-zinc-700">{item.target}</span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 shrink-0">{item.timeAgo}</span>
        </div>
      ))}
    </div>
  );
};

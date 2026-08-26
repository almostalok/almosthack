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
        return <ShieldCheck className="w-3.5 h-3.5 text-[#355C45]" />;
      case 'commit':
        return <GitCommit className="w-3.5 h-3.5 text-[#355C45]" />;
      case 'judge':
        return <Trophy className="w-3.5 h-3.5 text-[#785A12]" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-[#6D7068]" />;
    }
  };

  return (
    <div className={cn('flex flex-col divide-y divide-[#DCDDD3]/70 font-mono text-xs text-left', className)}>
      {activities.map((item) => (
        <div
          key={item.id}
          className="py-3 flex items-center justify-between gap-3 hover:bg-[#F7F4EA]/60 px-2 rounded-[6px] transition-colors"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="p-1.5 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] shrink-0">
              {getIcon(item.type)}
            </span>
            <div className="truncate text-xs">
              <span className="font-bold text-[#171914]">{item.actor}</span>{' '}
              <span className="text-[#6D7068]">{item.action}</span>{' '}
              <span className="text-[#171914] font-medium underline underline-offset-2 decoration-[#DCDDD3]">
                {item.target}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-[#9A9C94] shrink-0">{item.timeAgo}</span>
        </div>
      ))}
    </div>
  );
};

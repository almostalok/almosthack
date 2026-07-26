import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn, formatCurrency } from '@almosthack/utils';
import { Calendar, Users, Trophy, ChevronRight } from 'lucide-react';

export interface HackathonCardProps {
  id: string;
  title: string;
  organization: string;
  prizePool: number;
  participantsCount: number;
  status: 'upcoming' | 'live' | 'judging' | 'ended';
  startDate: string;
  endDate: string;
  className?: string;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  title,
  organization,
  prizePool,
  participantsCount,
  status,
  startDate,
  endDate,
  className,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'live':
        return <Badge variant="accent">● Live Now</Badge>;
      case 'judging':
        return <Badge variant="warning">Judging Phase</Badge>;
      case 'ended':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  return (
    <Card hoverable className={cn('flex flex-col justify-between gap-4 group', className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{organization}</span>
          {getStatusBadge()}
        </div>
        <h3 className="text-lg font-bold font-heading text-zinc-100 group-hover:text-emerald-400 transition-colors">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-800/80 font-mono text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-400" /> Prize Pool</span>
          <span className="font-bold text-zinc-100">{formatCurrency(prizePool)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1"><Users className="w-3 h-3 text-cyan-400" /> Builders</span>
          <span className="font-bold text-zinc-100">{participantsCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-400" /> Dates</span>
          <span className="font-semibold text-zinc-300 text-[11px] truncate">{startDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
        <span>Verifiable Ledger Enabled</span>
        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
      </div>
    </Card>
  );
};

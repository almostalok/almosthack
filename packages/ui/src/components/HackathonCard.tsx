import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Scribble } from './Scribble';
import { cn, formatCurrency } from '@almosthack/utils';
import { Calendar, Users, Trophy, ChevronRight, Globe } from 'lucide-react';

export interface HackathonCardProps {
  id: string;
  title: string;
  organization: string;
  prizePool: number;
  participantsCount: number;
  status: 'upcoming' | 'live' | 'judging' | 'ended' | 'open' | string;
  startDate: string;
  endDate: string;
  mode?: 'online' | 'in-person' | 'hybrid' | string;
  onClick?: () => void;
  ctaText?: string;
  showScribble?: boolean;
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
  mode = 'online',
  onClick,
  ctaText,
  showScribble = false,
  className,
}) => {
  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case 'live':
      case 'running':
        return <Badge variant="LIVE" dot>● Live Now</Badge>;
      case 'judging':
        return <Badge variant="JUDGING">Judging Phase</Badge>;
      case 'ended':
      case 'completed':
        return <Badge variant="COMPLETED">Completed</Badge>;
      default:
        return <Badge variant="OPEN">Upcoming</Badge>;
    }
  };

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      variant="default"
      className={cn('relative flex flex-col justify-between gap-4 group overflow-hidden text-left', className)}
    >
      {showScribble && (
        <div className="absolute -top-1 -right-1 opacity-20 pointer-events-none">
          <Scribble variant="sparkle" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-[#6D7068] uppercase tracking-wider">
            {organization}
          </span>
          {getStatusBadge()}
        </div>
        <h3 className="text-lg font-bold font-heading text-[#171914] group-hover:text-[#355C45] transition-colors leading-tight">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#DCDDD3] font-mono text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#6D7068] uppercase flex items-center gap-1">
            <Trophy className="w-3 h-3 text-[#785A12]" /> Prize
          </span>
          <span className="font-bold text-[#171914] mt-0.5">{formatCurrency(prizePool)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#6D7068] uppercase flex items-center gap-1">
            <Users className="w-3 h-3 text-[#355C45]" /> Builders
          </span>
          <span className="font-bold text-[#171914] mt-0.5">{participantsCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#6D7068] uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#6D7068]" /> Dates
          </span>
          <span className="font-semibold text-[#6D7068] text-[11px] truncate mt-0.5">
            {startDate} – {endDate}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-[#6D7068] pt-1">
        <span className="flex items-center gap-1 text-[11px]">
          <Globe className="w-3 h-3 text-[#9A9C94]" /> {mode}
        </span>
        {ctaText ? (
          <Button variant="secondary" size="sm">
            {ctaText}
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1 text-[#355C45] font-semibold group-hover:translate-x-0.5 transition-transform">
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </Card>
  );
};

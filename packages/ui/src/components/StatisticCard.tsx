import React from 'react';
import { Card } from './Card';
import { cn } from '@almosthack/utils';

export interface StatisticCardProps {
  label: string;
  stat: string | number;
  badgeText?: string;
  description?: string;
  className?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  label,
  stat,
  badgeText,
  description,
  className,
}) => {
  return (
    <Card className={cn('flex flex-col gap-1 border-l-2 border-l-emerald-500', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase text-zinc-400">{label}</span>
        {badgeText && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            {badgeText}
          </span>
        )}
      </div>
      <div className="text-3xl font-extrabold font-heading text-zinc-50">{stat}</div>
      {description && <p className="text-xs text-zinc-400 mt-1 font-sans">{description}</p>}
    </Card>
  );
};

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
    <Card variant="editorial" className={cn('flex flex-col gap-2 text-left', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold uppercase text-[#6D7068] tracking-wider">
          {label}
        </span>
        {badgeText && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[5px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            {badgeText}
          </span>
        )}
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#171914] tracking-tight">
        {stat}
      </div>
      {description && <p className="text-xs text-[#6D7068] font-body">{description}</p>}
    </Card>
  );
};

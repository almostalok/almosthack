import React from 'react';
import { Card } from './Card';
import { cn } from '@almosthack/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtext?: string;
  className?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtext,
  className,
}) => {
  return (
    <Card variant="editorial" className={cn('flex flex-col gap-2 relative overflow-hidden text-left', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-[#6D7068] font-semibold">
          {title}
        </span>
        {icon && (
          <div className="text-[#355C45] p-1.5 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[8px]">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-3xl font-extrabold font-heading text-[#171914] tracking-tight">{value}</span>
        {change && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-mono font-bold px-2 py-0.5 rounded-[5px] border',
              isPositive
                ? 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]'
                : 'bg-[#FBE6E3] text-[#8B2C24] border-[#F3C9B2]'
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] font-mono text-[#6D7068] mt-1">{subtext}</p>}
    </Card>
  );
};

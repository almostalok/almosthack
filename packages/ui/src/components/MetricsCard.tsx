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
    <Card className={cn('flex flex-col gap-2 relative overflow-hidden', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
          {title}
        </span>
        {icon && <div className="text-zinc-400 p-1 bg-zinc-900 border border-zinc-800 rounded">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">{value}</span>
        {change && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-mono font-medium px-1.5 py-0.5 rounded border',
              isPositive
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                : 'bg-red-950/60 text-red-400 border-red-800/40'
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] font-mono text-zinc-500 mt-1">{subtext}</p>}
    </Card>
  );
};

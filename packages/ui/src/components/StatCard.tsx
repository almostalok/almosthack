import React from 'react';
import { Card } from './Card';
import { cn } from '@almosthack/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  context?: string;
  badgeText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'editorial' | 'accent';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendDirection = 'up',
  context,
  badgeText,
  icon,
  variant = 'editorial',
  className,
}) => {
  return (
    <Card variant={variant} className={cn('flex flex-col justify-between gap-3 text-left', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase font-semibold text-[#6D7068] tracking-wider">
          {label}
        </span>
        {icon && <div className="text-[#355C45]">{icon}</div>}
        {badgeText && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[5px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            {badgeText}
          </span>
        )}
      </div>

      <div className="text-4xl font-extrabold font-heading text-[#171914] tracking-tight">
        {value}
      </div>

      {(trend || context) && (
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {trend && (
            <span
              className={cn(
                'font-bold',
                trendDirection === 'up' && 'text-[#274535]',
                trendDirection === 'down' && 'text-[#8B2C24]',
                trendDirection === 'neutral' && 'text-[#6D7068]'
              )}
            >
              {trendDirection === 'up' && '↑ '}
              {trendDirection === 'down' && '↓ '}
              {trend}
            </span>
          )}
          {context && <span className="text-[#6D7068] font-body">{context}</span>}
        </div>
      )}
    </Card>
  );
};

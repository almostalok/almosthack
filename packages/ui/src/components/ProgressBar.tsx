import React from 'react';
import { cn } from '@almosthack/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-semibold text-zinc-200">{percentage}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-zinc-700/50', heights[size])}>
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { cn } from '@almosthack/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brand' | 'accent' | 'lavender' | 'peach';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'brand',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const barColors = {
    brand: 'bg-[#355C45]',
    accent: 'bg-[#C9DDD0]',
    lavender: 'bg-[#DCD5E8]',
    peach: 'bg-[#F3C9B2]',
  };

  const ariaValueText = label
    ? `${label}: ${percentage}%`
    : `${percentage}% complete`;

  return (
    <div
      className={cn('w-full flex flex-col gap-1.5 text-left', className)}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={ariaValueText}
      aria-label={label || 'Progress'}
    >
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-mono text-[#6D7068]">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && <span className="font-semibold text-[#171914]">{percentage}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-[#E2EBDD]/60 rounded-full overflow-hidden p-0.5 border border-[#DCDDD3]', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', barColors[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const Progress = ProgressBar;

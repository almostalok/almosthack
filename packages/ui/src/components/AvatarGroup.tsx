import React from 'react';
import { cn } from '@almosthack/utils';

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 4,
  size = 'md',
  className,
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleAvatars = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  const counterSizes = {
    xs: 'w-6 h-6 text-[9px] -ml-2',
    sm: 'w-8 h-8 text-[11px] -ml-2.5',
    md: 'w-10 h-10 text-xs -ml-3',
    lg: 'w-12 h-12 text-sm -ml-3.5',
  };

  return (
    <div className={cn('flex items-center -space-x-3 overflow-hidden', className)}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="ring-2 ring-[#FFFDF8] rounded-full">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-[#F7F4EA] text-[#6D7068] font-mono font-bold border border-[#DCDDD3] ring-2 ring-[#FFFDF8] select-none shrink-0',
            counterSizes[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { cn } from '@almosthack/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse bg-[#E2EBDD]/70 border border-[#DCDDD3]/60 rounded-[8px]', className)}
      {...props}
    />
  );
};

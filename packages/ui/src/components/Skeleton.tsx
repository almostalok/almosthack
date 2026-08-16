import React from 'react';
import { cn } from '@almosthack/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse bg-zinc-800/60 rounded-md', className)}
      {...props}
    />
  );
};

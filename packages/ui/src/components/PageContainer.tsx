import React from 'react';
import { cn } from '@almosthack/utils';

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '7xl',
  className,
}) => {
  const maxWidthClass = {
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full',
  }[maxWidth];

  return (
    <div className={cn('w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-left', maxWidthClass, className)}>
      {children}
    </div>
  );
};

import React from 'react';
import { cn } from '@almosthack/utils';

export interface LandingShellProps {
  children: React.ReactNode;
  className?: string;
}

export const LandingShell: React.FC<LandingShellProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'min-h-screen bg-[#0B0D0C] text-[#F5F7F4] font-body selection:bg-[#A8E63B]/20 selection:text-[#A8E63B] antialiased relative overflow-x-hidden',
        className
      )}
    >
      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

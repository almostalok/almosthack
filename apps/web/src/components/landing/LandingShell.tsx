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
        'min-h-screen bg-[#131413] text-[#EDEDED] font-body selection:bg-[#028051]/30 selection:text-[#5EEAD4] antialiased relative overflow-x-hidden',
        className
      )}
    >
      {/* Subtle Pixel / Grid Pattern Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `linear-gradient(#EDEDED 1px, transparent 1px), linear-gradient(90deg, #EDEDED 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

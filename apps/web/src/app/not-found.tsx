import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F4EA] text-[#171914] font-body p-4 text-center">
      <div className="max-w-md w-full bg-[#FFFDF8] border border-[#DCDDD3] rounded-[16px] p-8 shadow-xs space-y-4">
        <span className="text-6xl font-heading font-extrabold text-[#028051]">404</span>
        <h1 className="text-xl font-heading font-extrabold text-[#171914]">Resource Not Found</h1>
        <p className="text-xs text-[#6D7068] font-body leading-relaxed max-w-sm mx-auto">
          The requested path does not exist or has been relocated within the AlmostHack ledger.
        </p>
        <div className="pt-2">
          <Link
            href="/overview"
            className="inline-flex items-center px-4 py-2 bg-[#028051] hover:bg-[#274535] text-[#FFFDF8] font-mono font-bold text-xs rounded-[10px] transition-colors shadow-xs"
          >
            Return to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

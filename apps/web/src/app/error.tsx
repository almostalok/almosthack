'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log safe error telemetry without exposing secrets
    console.error('[WebErrorBoundary] Caught application error:', error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F4EA] text-[#171914] font-body p-4 text-left">
      <div className="max-w-md w-full bg-[#FFFDF8] border border-[#DCDDD3] rounded-[16px] p-6 sm:p-8 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 bg-[#FEE2E2] border border-[#FECACA] rounded-full flex items-center justify-center mx-auto text-[#991B1B]">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-heading font-extrabold text-[#171914]">Something went wrong</h1>
        <p className="text-xs text-[#6D7068] font-body leading-relaxed">
          An unexpected error occurred while processing this request. The system state has been preserved.
        </p>

        {error.digest && (
          <div className="p-2.5 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] text-xs font-mono text-[#6D7068] select-all">
            Reference ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-[#028051] hover:bg-[#274535] text-[#FFFDF8] rounded-[10px] text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs"
          >
            Try Again
          </button>
          <Link
            href="/overview"
            className="px-4 py-2 bg-[#FFFDF8] hover:bg-[#F7F4EA] text-[#171914] border border-[#DCDDD3] rounded-[10px] text-xs font-mono font-bold transition-colors"
          >
            Return to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

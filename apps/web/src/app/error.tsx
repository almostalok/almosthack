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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl text-center">
        <div className="w-12 h-12 bg-red-950/80 border border-red-800/60 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          An unexpected error occurred while loading this page. Our team has been notified.
        </p>

        {error.digest && (
          <div className="mb-6 p-2.5 bg-zinc-950 rounded border border-zinc-800 text-xs font-mono text-zinc-500 select-all">
            Error ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

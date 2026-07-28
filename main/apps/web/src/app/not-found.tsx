import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-zinc-100 font-mono p-4">
      <span className="text-6xl font-bold font-heading text-zinc-700">404</span>
      <h1 className="text-xl font-bold text-zinc-100 mt-2">Resource Not Found</h1>
      <p className="text-xs text-zinc-500 max-w-sm text-center mt-1 mb-6">
        The requested path does not exist or has been relocated within the almosthack ledger.
      </p>
      <Link
        href="/overview"
        className="px-4 py-2 bg-emerald-500 text-black font-semibold text-xs rounded hover:bg-emerald-400 transition-colors"
      >
        Return to Overview
      </Link>
    </div>
  );
}

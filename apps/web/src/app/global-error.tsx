'use client';

import React, { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[WebGlobalError] Root layout failure:', error.message);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl text-center">
          <h2 className="text-xl font-semibold mb-2">Application Error</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            A critical error prevented the application from loading.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}

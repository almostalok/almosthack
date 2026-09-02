'use client';

import React from 'react';
import { Card } from '@almosthack/ui';

export const WorkspaceSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse text-left">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-3 border-b border-[#DCDDD3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-72 bg-[#EAE7DC] rounded-[8px]" />
            <div className="h-4 w-96 bg-[#EAE7DC] rounded-[6px]" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-28 bg-[#EAE7DC] rounded-[8px]" />
            <div className="h-8 w-28 bg-[#EAE7DC] rounded-[8px]" />
          </div>
        </div>
      </div>

      {/* Nav Tabs Skeleton */}
      <div className="flex gap-2 border-b border-[#DCDDD3] pb-2 overflow-x-hidden">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-7 w-24 bg-[#EAE7DC] rounded-[6px] shrink-0" />
        ))}
      </div>

      {/* Lifecycle Progress Skeleton */}
      <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] space-y-4">
        <div className="h-4 w-48 bg-[#EAE7DC] rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[#EAE7DC] rounded-[8px]" />
          ))}
        </div>
      </Card>

      {/* Attention & Quick Actions Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] space-y-4">
            <div className="h-4 w-44 bg-[#EAE7DC] rounded" />
            <div className="h-14 w-full bg-[#EAE7DC] rounded-[8px]" />
            <div className="h-14 w-full bg-[#EAE7DC] rounded-[8px]" />
          </Card>
        </div>
        <div>
          <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] space-y-3">
            <div className="h-4 w-32 bg-[#EAE7DC] rounded" />
            <div className="h-10 w-full bg-[#EAE7DC] rounded-[8px]" />
            <div className="h-10 w-full bg-[#EAE7DC] rounded-[8px]" />
          </Card>
        </div>
      </div>

      {/* Summaries Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="p-4 bg-[#FFFDF8] border border-[#DCDDD3] space-y-3">
            <div className="h-4 w-28 bg-[#EAE7DC] rounded" />
            <div className="h-6 w-36 bg-[#EAE7DC] rounded" />
            <div className="h-3 w-full bg-[#EAE7DC] rounded" />
            <div className="h-7 w-full bg-[#EAE7DC] rounded-[6px]" />
          </Card>
        ))}
      </div>
    </div>
  );
};

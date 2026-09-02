'use client';

import React from 'react';
import { Card } from '@almosthack/ui';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse text-left">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCDDD3]">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[#EAE7DC] rounded-[8px]" />
          <div className="h-4 w-96 bg-[#EAE7DC] rounded-[6px]" />
        </div>
        <div className="h-9 w-36 bg-[#EAE7DC] rounded-[8px]" />
      </div>

      {/* Hackathon Status Banner Skeleton */}
      <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-52 bg-[#EAE7DC] rounded-[6px]" />
          <div className="h-6 w-20 bg-[#EAE7DC] rounded-full" />
        </div>
        <div className="h-4 w-72 bg-[#EAE7DC] rounded-[4px]" />
      </Card>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] space-y-3">
            <div className="h-3 w-20 bg-[#EAE7DC] rounded" />
            <div className="h-8 w-16 bg-[#EAE7DC] rounded" />
            <div className="h-3 w-28 bg-[#EAE7DC] rounded" />
          </Card>
        ))}
      </div>

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
            <div className="h-4 w-28 bg-[#EAE7DC] rounded" />
            <div className="h-10 w-full bg-[#EAE7DC] rounded-[8px]" />
            <div className="h-10 w-full bg-[#EAE7DC] rounded-[8px]" />
            <div className="h-10 w-full bg-[#EAE7DC] rounded-[8px]" />
          </Card>
        </div>
      </div>

      {/* Registration Chart & Submissions Overview Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] space-y-4">
            <div className="h-4 w-36 bg-[#EAE7DC] rounded" />
            <div className="h-44 w-full bg-[#EAE7DC] rounded" />
          </Card>
        </div>
        <div>
          <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] space-y-4">
            <div className="h-4 w-36 bg-[#EAE7DC] rounded" />
            <div className="h-6 w-full bg-[#EAE7DC] rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-[#EAE7DC] rounded-[6px]" />
              <div className="h-12 bg-[#EAE7DC] rounded-[6px]" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

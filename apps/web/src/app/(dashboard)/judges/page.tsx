'use client';

import React from 'react';
import { Breadcrumbs, JudgeCard, StatisticCard, Badge } from '@almosthack/ui';
import { Award, ShieldCheck } from 'lucide-react';

export default function JudgesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <Breadcrumbs items={[{ label: 'Platform' }, { label: 'Judge Calibration' }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
              Judge Calibration Engine
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Double-blind review integrity, bias detection, and consistency telemetry.
            </p>
          </div>
          <Badge variant="accent" size="md" className="gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Double Blind Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticCard
          label="Active Reviewers"
          stat="42"
          badgeText="Verified"
          description="Assigned across 12 active hackathon tracks"
        />
        <StatisticCard
          label="Avg Calibration Score"
          stat="98.7%"
          badgeText="Optimal"
          description="Low variance variance score model"
        />
        <StatisticCard
          label="Evaluated Submissions"
          stat="1,840"
          badgeText="100% Sealed"
          description="Audited double-blind submissions"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <JudgeCard
          name="Dr. Elena Vance"
          role="Senior Security Architect @ Anthropic"
          assignedCount={25}
          completedCount={25}
          calibrationScore={99.2}
        />
        <JudgeCard
          name="Marcus Chen"
          role="Principal Engineer @ Vercel"
          assignedCount={30}
          completedCount={28}
          calibrationScore={97.8}
        />
        <JudgeCard
          name="Sarah Jenkins"
          role="Head of Product @ Linear"
          assignedCount={20}
          completedCount={20}
          calibrationScore={98.9}
        />
      </div>
    </div>
  );
}

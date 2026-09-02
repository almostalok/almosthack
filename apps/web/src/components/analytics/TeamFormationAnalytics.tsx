'use client';

import React from 'react';
import Link from 'next/link';
import { Users2, AlertTriangle, ArrowRight } from 'lucide-react';
import { TeamFormationDistribution } from './analytics-types';

export interface TeamFormationAnalyticsProps {
  distributions: TeamFormationDistribution[];
  unassignedCount: number;
  totalApproved: number;
}

export const TeamFormationAnalytics: React.FC<TeamFormationAnalyticsProps> = ({
  distributions,
  unassignedCount,
  totalApproved,
}) => {
  const unassignedPercentage = ((unassignedCount / (totalApproved || 1)) * 100).toFixed(1);

  return (
    <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2">
          <Users2 className="w-4 h-4 text-[#028051]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
              Team Formation & Roster Distribution
            </h3>
            <p className="text-[11px] text-[#6D7068] font-body">
              Breakdown of team sizes compared with event rules (1–4 members).
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#171914]">
          136 Total Teams Active
        </span>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-3">
        {distributions.map((d) => (
          <div key={d.size} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#171914]">{d.label}</span>
              <span className="text-[#6D7068]">
                <strong>{d.count} teams</strong> ({d.percentage}%)
              </span>
            </div>
            <div className="h-2 w-full bg-[#EAE7DC] rounded-full overflow-hidden">
              <div
                style={{ width: `${d.percentage}%` }}
                className="h-full bg-[#028051] rounded-full"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned Operational Alert Callout */}
      <div className="p-3 bg-[#FFF4DC] border border-[#F0D597] rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#785A12]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>
            <strong>{unassignedCount} approved builders ({unassignedPercentage}%)</strong> have not joined a team roster.
          </span>
        </div>
        <Link
          href="/teams"
          className="text-[#028051] hover:underline font-bold flex items-center gap-1 shrink-0"
        >
          <span>Match Teams</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

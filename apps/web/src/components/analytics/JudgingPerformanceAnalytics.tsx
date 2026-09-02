'use client';

import React from 'react';
import { Scale, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { JudgingWorkloadItem } from './analytics-types';

export interface JudgingPerformanceAnalyticsProps {
  workload: JudgingWorkloadItem[];
}

export const JudgingPerformanceAnalytics: React.FC<JudgingPerformanceAnalyticsProps> = ({
  workload,
}) => {
  const totalAssigned = workload.reduce((acc, j) => acc + j.assignedCount, 0);
  const totalCompleted = workload.reduce((acc, j) => acc + j.completedCount, 0);
  const completionPercentage = Math.round((totalCompleted / (totalAssigned || 1)) * 100);

  return (
    <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#028051]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
              Judging Performance & Reviewer Workload
            </h3>
            <p className="text-[11px] text-[#6D7068] font-body">
              Evaluation completion velocity and individual reviewer load balancing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#028051] bg-[#E2EBDD] px-2.5 py-1 rounded border border-[#B8CEB0] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completionPercentage}% Total Judging Completed
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-[#DCDDD3]">
        <table className="w-full text-left text-xs font-body text-[#171914]">
          <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[10px] font-bold text-[#6D7068] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5">Reviewer</th>
              <th className="px-4 py-2.5">Domain Role</th>
              <th className="px-4 py-2.5">Assigned Projects</th>
              <th className="px-4 py-2.5">Completed Reviews</th>
              <th className="px-4 py-2.5">Completion %</th>
              <th className="px-4 py-2.5 text-right">Avg Score Given</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCDDD3]/70 font-mono">
            {workload.map((j) => (
              <tr key={j.judgeId} className="hover:bg-[#F7F4EA]/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center font-bold text-[10px]">
                      {j.judgeName.charAt(0)}
                    </div>
                    <span className="font-heading font-bold text-[#171914]">
                      {j.judgeName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#6D7068]">{j.judgeRole}</td>
                <td className="px-4 py-3">{j.assignedCount}</td>
                <td className="px-4 py-3 font-bold text-[#028051]">
                  {j.completedCount}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-bold text-[#028051]">
                    {j.completionPercentage}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#171914]">
                  {j.avgScoreGiven.toFixed(1)} pts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

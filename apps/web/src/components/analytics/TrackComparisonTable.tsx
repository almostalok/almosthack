'use client';

import React from 'react';
import { Layers, Award, CheckCircle2 } from 'lucide-react';
import { TrackAnalyticsItem } from './analytics-types';

export interface TrackComparisonTableProps {
  tracks: TrackAnalyticsItem[];
}

export const TrackComparisonTable: React.FC<TrackComparisonTableProps> = ({
  tracks,
}) => {
  return (
    <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-4">
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#028051]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
              Track & Challenge Comparison
            </h3>
            <p className="text-[11px] text-[#6D7068] font-body">
              Team engagement, submission yields, and average calibrated scores by track.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#171914]">
          {tracks.length} Tracks Configured
        </span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-[#DCDDD3]">
        <table className="w-full text-left text-xs font-body text-[#171914]">
          <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[10px] font-bold text-[#6D7068] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5">Track / Challenge</th>
              <th className="px-4 py-2.5">Active Teams</th>
              <th className="px-4 py-2.5">Projects Submitted</th>
              <th className="px-4 py-2.5">Completion Rate</th>
              <th className="px-4 py-2.5 text-right">Avg Consensus Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCDDD3]/70 font-mono">
            {tracks.map((t) => (
              <tr key={t.trackId} className="hover:bg-[#F7F4EA]/60">
                <td className="px-4 py-3 font-heading font-bold text-[#171914]">
                  {t.trackName}
                </td>
                <td className="px-4 py-3">{t.teamsCount} teams</td>
                <td className="px-4 py-3 font-bold text-[#028051]">
                  {t.submissionsCount} projects
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold">{t.completionRate}%</span>
                    <div className="w-16 h-1.5 bg-[#EAE7DC] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${t.completionRate}%` }}
                        className="h-full bg-[#028051] rounded-full"
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-extrabold text-sm text-[#171914]">
                  {t.averageScore.toFixed(1)}{' '}
                  <span className="text-[10px] text-[#6D7068] font-normal">/ 100</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

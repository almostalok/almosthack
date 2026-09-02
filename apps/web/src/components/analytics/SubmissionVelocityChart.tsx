'use client';

import React from 'react';
import { FileCode2, Clock, CheckCircle2 } from 'lucide-react';
import { SubmissionVelocityPoint } from './analytics-types';

export interface SubmissionVelocityChartProps {
  velocityPoints: SubmissionVelocityPoint[];
}

export const SubmissionVelocityChart: React.FC<SubmissionVelocityChartProps> = ({
  velocityPoints,
}) => {
  const totalSubmissions = velocityPoints[velocityPoints.length - 1]?.cumulative || 84;
  const deadlineCount = velocityPoints
    .filter((p) => p.isDeadlineWindow)
    .reduce((acc, p) => acc + p.count, 0);
  const deadlinePercentage = ((deadlineCount / (totalSubmissions || 1)) * 100).toFixed(1);

  return (
    <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-[#028051]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
              Submission Arrival Velocity
            </h3>
            <p className="text-[11px] text-[#6D7068] font-body">
              Project delivery timestamps relative to final submission deadline.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#D97706] bg-[#FFF4DC] px-2.5 py-1 rounded border border-[#F0D597]">
          {deadlinePercentage}% in Final 6 Hours
        </span>
      </div>

      {/* Arrival Histogram */}
      <div className="grid grid-cols-6 gap-2 pt-2 text-center font-mono">
        {velocityPoints.map((pt) => {
          const barHeightPercentage = Math.round((pt.count / 25) * 100);

          return (
            <div key={pt.timeBucket} className="flex flex-col justify-end items-center gap-1.5 h-32">
              <span className="text-[10px] font-bold text-[#171914]">
                +{pt.count}
              </span>

              <div className="w-full bg-[#EAE7DC] rounded-[4px] h-20 flex items-end overflow-hidden p-0.5">
                <div
                  style={{ height: `${barHeightPercentage}%` }}
                  className={`w-full rounded-[2px] transition-all duration-300 ${
                    pt.isDeadlineWindow ? 'bg-[#D97706]' : 'bg-[#028051]'
                  }`}
                />
              </div>

              <span className="text-[10px] text-[#6D7068] truncate w-full">
                {pt.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-[#DCDDD3]/70 flex items-center justify-between text-[11px] font-mono text-[#6D7068]">
        <span>Total Verified Projects: <strong className="text-[#171914]">{totalSubmissions}</strong></span>
        <span>Deadline Window: <strong className="text-[#D97706]">{deadlineCount} projects (T-6h to T-0)</strong></span>
      </div>
    </div>
  );
};

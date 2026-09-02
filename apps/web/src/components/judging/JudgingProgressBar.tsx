'use client';

import React from 'react';
import { Award, CheckCircle2, Clock, Users2, ShieldCheck } from 'lucide-react';
import { JudgingMetrics, JudgingLifecycleState } from './judging-types';

export interface JudgingProgressBarProps {
  metrics: JudgingMetrics;
  lifecycleState: JudgingLifecycleState;
}

export const JudgingProgressBar: React.FC<JudgingProgressBarProps> = ({
  metrics,
  lifecycleState,
}) => {
  const getLifecycleBadge = () => {
    switch (lifecycleState) {
      case 'OPEN':
        return (
          <span className="text-[10px] font-mono font-bold bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0] px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#028051] animate-pulse" />
            JUDGING LIVE
          </span>
        );
      case 'PAUSED':
        return (
          <span className="text-[10px] font-mono font-bold bg-[#FFF4DC] text-[#785A12] border border-[#F0D597] px-2 py-0.5 rounded flex items-center gap-1">
            PAUSED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="text-[10px] font-mono font-bold bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2] px-2 py-0.5 rounded flex items-center gap-1">
            CLOSED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold bg-[#EAE7DC] text-[#6D7068] px-2 py-0.5 rounded">
            NOT STARTED
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#028051]" />
          <h3 className="text-xs font-heading font-extrabold text-[#171914] uppercase tracking-wider">
            Overall Judging Progress
          </h3>
          {getLifecycleBadge()}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#6D7068]">
            <strong className="text-[#171914]">{metrics.completedEvaluations}</strong> of{' '}
            <strong className="text-[#171914]">{metrics.requiredEvaluations}</strong> evaluations submitted
          </span>
          <span className="text-sm font-heading font-extrabold text-[#028051]">
            {metrics.completionPercentage}%
          </span>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="h-3 w-full bg-[#EAE7DC] rounded-full overflow-hidden p-0.5">
        <div
          style={{ width: `${Math.min(100, metrics.completionPercentage)}%` }}
          className="h-full bg-[#028051] rounded-full transition-all duration-300"
        />
      </div>

      {/* Supporting details row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#DCDDD3]/60 text-[11px] font-mono text-[#6D7068]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D97706]" />
          <span>{metrics.remainingEvaluations} evaluations remaining</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users2 className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{metrics.totalJudges} active judges assigned</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />
          <span>{metrics.calibratedJudges}/{metrics.totalJudges} judges calibrated</span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#028051]" />
          <span>{metrics.totalSubmissions} submissions in pool</span>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ResultsReadinessSummary } from './results-types';

export interface ResultsReadinessBannerProps {
  readiness: ResultsReadinessSummary;
}

export const ResultsReadinessBanner: React.FC<ResultsReadinessBannerProps> = ({
  readiness,
}) => {
  const isReady = readiness.isReadyForFinalization && readiness.unresolvedTiesCount === 0;

  if (isReady) {
    return (
      <div className="p-3.5 bg-[#E2EBDD] border border-[#B8CEB0] rounded-[10px] flex items-center justify-between gap-3 text-xs shadow-2xs font-mono text-[#274535]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#028051] shrink-0" />
          <span>
            <strong>Readiness Verified:</strong> 100% evaluations completed ({readiness.completedEvaluations}/{readiness.requiredEvaluations}), 0 ties pending resolution, all awards allocated.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-[#FFF4DC] border border-[#F0D597] rounded-[10px] flex items-center justify-between gap-3 text-xs shadow-2xs font-mono text-[#785A12]">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
        <span>
          <strong>Pending Actions:</strong>{' '}
          {!readiness.isJudgingComplete && 'Judging evaluations still in progress. '}
          {readiness.unresolvedTiesCount > 0 && `${readiness.unresolvedTiesCount} ties require committee review. `}
          {readiness.awardsAssignedCount < readiness.totalAwardsCount &&
            `${readiness.totalAwardsCount - readiness.awardsAssignedCount} awards unassigned.`}
        </span>
      </div>
    </div>
  );
};

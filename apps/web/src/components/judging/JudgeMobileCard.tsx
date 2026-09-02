'use client';

import React from 'react';
import { Users2, ShieldCheck, ChevronRight, Eye, AlertTriangle } from 'lucide-react';
import { JudgeItem, JudgePerformanceStatus } from './judging-types';

export interface JudgeMobileCardProps {
  judge: JudgeItem;
  onViewDetails: () => void;
}

export const JudgeMobileCard: React.FC<JudgeMobileCardProps> = ({
  judge,
  onViewDetails,
}) => {
  const getStatusBadge = (status: JudgePerformanceStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            COMPLETED
          </span>
        );
      case 'ON_TRACK':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]">
            ON TRACK
          </span>
        );
      case 'BEHIND':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            BEHIND
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] hover:border-[#B8CEB0] transition-all text-left space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs font-heading font-bold text-[#171914] hover:text-[#028051] text-left truncate block cursor-pointer"
          >
            {judge.name}
          </button>
          <span className="text-[11px] font-body text-[#6D7068] truncate block">
            {judge.title || 'Judge'} · {judge.organization || 'Reviewer'}
          </span>
        </div>

        <div className="shrink-0">{getStatusBadge(judge.status)}</div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 p-2.5 bg-[#F7F4EA] rounded-[6px] border border-[#DCDDD3] text-xs font-mono">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#6D7068]">Evaluations Progress</span>
          <span className="font-bold text-[#171914]">
            {judge.completedCount} / {judge.assignedCount} ({judge.completionRate}%)
          </span>
        </div>
        <div className="h-2 w-full bg-[#EAE7DC] rounded-full overflow-hidden">
          <div
            style={{ width: `${judge.completionRate}%` }}
            className="h-full bg-[#028051] rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#DCDDD3]/60 text-xs font-mono">
        <div className="flex items-center gap-2">
          {judge.isCalibrated && (
            <span className="text-[10px] text-[#028051] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Calibrated
            </span>
          )}
          {judge.conflicts.length > 0 && (
            <span className="text-[10px] text-[#DC2626] font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 1 Conflict
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onViewDetails}
          className="text-xs font-mono text-[#028051] flex items-center gap-0.5 cursor-pointer font-bold"
        >
          <span>Judge Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

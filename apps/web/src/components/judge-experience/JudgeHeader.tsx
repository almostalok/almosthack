'use client';

import React from 'react';
import { Award, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { JudgeMetrics } from './judge-types';

export interface JudgeHeaderProps {
  metrics: JudgeMetrics;
  hackathonName?: string;
  onContinueNext: () => void;
}

export const JudgeHeader: React.FC<JudgeHeaderProps> = ({
  metrics,
  hackathonName = 'Hack The Future 2026',
  onContinueNext,
}) => {
  const remaining = metrics.totalAssigned - metrics.completed;

  return (
    <div className="space-y-4 pb-4 border-b border-[#DCDDD3] text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center text-[#028051]">
              <Award className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight">
              Judge Evaluation Workspace
            </h1>
          </div>
          <p className="text-xs text-[#6D7068] font-body">
            {hackathonName} • {remaining > 0 ? (
              <span>You have <strong className="text-[#171914]">{remaining} submissions</strong> remaining to evaluate.</span>
            ) : (
              <span className="text-[#028051] font-bold">All assigned submissions have been evaluated!</span>
            )}
          </p>
        </div>

        {remaining > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={onContinueNext}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8.5 font-bold"
          >
            Continue Next Review
          </Button>
        )}
      </div>

      {/* Progress Bar Barometer */}
      <div className="p-3.5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#6D7068] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#028051]" />
            <span>Judging Progress:</span>
            <strong className="text-[#171914]">
              {metrics.completed} / {metrics.totalAssigned} Evaluations Finalized
            </strong>
          </span>

          <span className="font-bold text-[#028051]">
            {metrics.progressPercent}% Complete
          </span>
        </div>

        <div className="w-full bg-[#F7F4EA] border border-[#DCDDD3] rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#028051] h-full rounded-full transition-all duration-300"
            style={{ width: `${metrics.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

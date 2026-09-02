'use client';

import React from 'react';
import { Scale, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { TransparentCriterionScore } from './transparent-judging-types';

export interface CriteriaBreakdownLedgerProps {
  criteria: TransparentCriterionScore[];
  finalScore: number;
  maxScore: number;
}

export const CriteriaBreakdownLedger: React.FC<CriteriaBreakdownLedgerProps> = ({
  criteria,
  finalScore,
  maxScore,
}) => {
  return (
    <div className="p-6 rounded-[12px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs text-left space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#028051]" />
          <div>
            <h3 className="text-sm font-heading font-extrabold text-[#171914] uppercase tracking-wider">
              Transparent Score Calculation
            </h3>
            <p className="text-xs text-[#6D7068] font-body">
              Calculated strictly using published criteria weights and calibrated reviewer evaluations.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#028051] bg-[#E2EBDD] px-2.5 py-1 rounded border border-[#B8CEB0]">
          100% Total Normalized Weight
        </span>
      </div>

      {/* Criteria Rows */}
      <div className="divide-y divide-[#DCDDD3]/70">
        {criteria.map((c) => (
          <div key={c.criterionId} className="py-4 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-heading font-bold text-[#171914]">
                    {c.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#F7F4EA] text-[#6D7068] px-2 py-0.2 rounded border border-[#DCDDD3]">
                    {c.weightPercentage}% Weight
                  </span>
                </div>
                {c.description && (
                  <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0 font-mono">
                <div className="text-sm font-heading font-extrabold text-[#171914]">
                  {c.weightedScore.toFixed(1)}{' '}
                  <span className="text-xs text-[#6D7068] font-normal">/ {c.maxWeightedScore} pts</span>
                </div>
                <span className="text-[11px] font-bold text-[#028051]">
                  {c.percentageAchieved.toFixed(1)}% achieved
                </span>
              </div>
            </div>

            {/* Restrained Progress Bar */}
            <div className="h-2 w-full bg-[#EAE7DC] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, c.percentageAchieved)}%` }}
                className="h-full bg-[#028051] rounded-full transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total Calculation Footer */}
      <div className="pt-3 border-t-2 border-[#171914] flex items-center justify-between font-mono text-xs font-bold text-[#171914]">
        <div className="flex items-center gap-2 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#028051]" />
          <span>Consensus Weighted Total</span>
        </div>
        <div className="text-right">
          <span className="text-base font-heading font-extrabold text-[#028051]">
            {finalScore.toFixed(1)}
          </span>
          <span className="text-xs text-[#6D7068] font-normal"> / {maxScore}</span>
        </div>
      </div>
    </div>
  );
};

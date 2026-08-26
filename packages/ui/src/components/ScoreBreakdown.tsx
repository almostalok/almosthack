import React from 'react';
import { Card } from './Card';
import { cn } from '@almosthack/utils';

export interface ScoreCriterion {
  id?: string;
  name: string;
  score: number;
  maxScore?: number;
  weight?: number;
  feedback?: string;
}

export interface ScoreBreakdownProps {
  criteria: ScoreCriterion[];
  overallScore?: number;
  maxOverallScore?: number;
  judgeCount?: number;
  isCalibrated?: boolean;
  className?: string;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  criteria,
  overallScore,
  maxOverallScore = 10,
  judgeCount,
  isCalibrated = true,
  className,
}) => {
  // Calculate overall score if not explicitly provided
  const calculatedOverall =
    overallScore !== undefined
      ? overallScore
      : criteria.length > 0
      ? Number((criteria.reduce((acc, c) => acc + c.score, 0) / criteria.length).toFixed(1))
      : 0;

  return (
    <Card variant="editorial" className={cn('flex flex-col gap-4 text-left font-body', className)}>
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
        <div>
          <h4 className="text-sm font-bold font-heading text-[#171914]">
            Transparent Score Ledger
          </h4>
          <span className="text-[11px] font-mono text-[#6D7068]">
            {isCalibrated ? 'Calibrated consensus algorithm' : 'Raw evaluation breakdown'}
            {judgeCount ? ` • ${judgeCount} judge evaluations` : ''}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-[#6D7068] block">Overall Score</span>
          <span className="text-2xl font-extrabold font-heading text-[#355C45]">
            {calculatedOverall}
            <span className="text-xs font-mono text-[#6D7068] font-normal"> / {maxOverallScore}</span>
          </span>
        </div>
      </div>

      {/* Criteria Breakdown Rows */}
      <div className="flex flex-col divide-y divide-[#DCDDD3]/70 font-mono text-xs">
        {criteria.map((criterion, idx) => {
          const max = criterion.maxScore || 10;
          const percentage = Math.min(100, (criterion.score / max) * 100);

          return (
            <div key={criterion.id || idx} className="py-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#171914]">{criterion.name}</span>
                <div className="flex items-center gap-2">
                  {criterion.weight && (
                    <span className="text-[10px] text-[#9A9C94]">({criterion.weight}% wt)</span>
                  )}
                  <span className="font-bold text-[#171914]">{criterion.score.toFixed(1)}</span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full h-1.5 bg-[#F7F4EA] rounded-full overflow-hidden border border-[#DCDDD3]/80">
                <div
                  className="h-full bg-[#355C45] rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {criterion.feedback && (
                <p className="text-[11px] font-body text-[#6D7068] italic pt-0.5">
                  &ldquo;{criterion.feedback}&rdquo;
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Overall Summary */}
      <div className="flex items-center justify-between pt-2 border-t-2 border-[#274535] font-mono text-xs font-bold text-[#171914]">
        <span className="uppercase tracking-wider">Consensus Score</span>
        <span className="text-sm text-[#355C45]">{calculatedOverall.toFixed(1)} / {maxOverallScore}</span>
      </div>
    </Card>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card, Button } from '@almosthack/ui';
import { JudgingProgressData } from './dashboard-mock-data';

export interface JudgingOverviewProps {
  data: JudgingProgressData;
  hackathonId?: string;
}

export const JudgingOverview: React.FC<JudgingOverviewProps> = ({
  data,
  hackathonId = 'htf-2026',
}) => {
  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD3]/70 mb-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
              Judging & Double-Blind Consensus
            </h3>
            <p className="text-[11px] font-body text-[#6D7068]">
              {data.totalJudges} active judges evaluating rubric criteria
            </p>
          </div>

          <Link href="/judging">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-mono gap-1 h-7 px-2.5"
            >
              <span>Manage Judging</span>
              <ArrowRight className="w-3 h-3 text-[#028051]" />
            </Button>
          </Link>
        </div>

        {/* Progress Metric Header */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914]">
              {data.progressPercent}%
            </span>
            <span className="text-xs font-mono text-[#6D7068]">completed</span>
          </div>
          <span className="text-xs font-mono text-[#028051] font-bold">
            {data.totalReviewed} of {data.totalAssigned} reviewed
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-[#F0ECE1] overflow-hidden mb-4 shadow-inner">
          <div
            style={{ width: `${data.progressPercent}%` }}
            className="h-full bg-[#028051] transition-all rounded-full"
          />
        </div>

        {/* 4 Stat Breakdown Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5">
          <div className="p-2 rounded-[6px] bg-[#F7F4EA]/60 border border-[#DCDDD3]/50 text-center">
            <span className="text-[10px] font-mono uppercase text-[#6D7068] block">Judges</span>
            <span className="text-sm font-heading font-extrabold text-[#171914]">{data.totalJudges}</span>
          </div>
          <div className="p-2 rounded-[6px] bg-[#F7F4EA]/60 border border-[#DCDDD3]/50 text-center">
            <span className="text-[10px] font-mono uppercase text-[#6D7068] block">Assigned</span>
            <span className="text-sm font-heading font-extrabold text-[#171914]">{data.totalAssigned}</span>
          </div>
          <div className="p-2 rounded-[6px] bg-[#E2EBDD]/60 border border-[#B8CEB0]/60 text-center">
            <span className="text-[10px] font-mono uppercase text-[#274535] block">Reviewed</span>
            <span className="text-sm font-heading font-extrabold text-[#028051]">{data.totalReviewed}</span>
          </div>
          <div className="p-2 rounded-[6px] bg-[#FFF4DC]/60 border border-[#F0D597]/60 text-center">
            <span className="text-[10px] font-mono uppercase text-[#785A12] block">Remaining</span>
            <span className="text-sm font-heading font-extrabold text-[#785A12]">{data.totalRemaining}</span>
          </div>
        </div>

        {/* Flagged Alert Banner */}
        {data.flaggedCount > 0 && (
          <div className="p-2.5 rounded-[8px] bg-[#FBE6E3]/70 border border-[#F3C9B2] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-body text-[#8B2C24]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                <strong className="font-semibold">{data.flaggedCount} evaluations</strong> flagged for review.
              </span>
            </div>
            <Link
              href={`/hackathons/${hackathonId}/integrity`}
              className="text-[11px] font-mono font-bold text-[#8B2C24] hover:underline shrink-0 ml-2"
            >
              Review flags →
            </Link>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#DCDDD3]/50 mt-4 flex items-center justify-between text-[11px] font-mono text-[#6D7068]">
        <span>Consensus algorithm</span>
        <span className="text-[#028051] font-semibold">Trimmed Mean (5% Cutoff)</span>
      </div>
    </Card>
  );
};

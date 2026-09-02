'use client';

import React from 'react';
import Link from 'next/link';
import { FileCode2, ArrowRight } from 'lucide-react';
import { Card, Button } from '@almosthack/ui';
import { SubmissionBreakdown } from './dashboard-mock-data';

export interface SubmissionOverviewProps {
  breakdown: SubmissionBreakdown;
  hackathonId?: string;
}

export const SubmissionOverview: React.FC<SubmissionOverviewProps> = ({
  breakdown,
  hackathonId = 'htf-2026',
}) => {
  const total = breakdown.total || 1;
  const submittedPct = Math.round((breakdown.submitted / total) * 100);
  const underReviewPct = Math.round((breakdown.underReview / total) * 100);
  const reviewedPct = Math.round((breakdown.reviewed / total) * 100);
  const flaggedPct = Math.round((breakdown.flagged / total) * 100);

  const segments = [
    {
      label: 'Submitted',
      count: breakdown.submitted,
      pct: submittedPct,
      color: 'bg-[#028051]',
      textColor: 'text-[#028051]',
      border: 'border-[#B8CEB0]',
    },
    {
      label: 'Under Review',
      count: breakdown.underReview,
      pct: underReviewPct,
      color: 'bg-[#D97706]',
      textColor: 'text-[#785A12]',
      border: 'border-[#F0D597]',
    },
    {
      label: 'Reviewed',
      count: breakdown.reviewed,
      pct: reviewedPct,
      color: 'bg-[#2563EB]',
      textColor: 'text-[#243F60]',
      border: 'border-[#BACDE2]',
    },
    {
      label: 'Flagged',
      count: breakdown.flagged,
      pct: flaggedPct,
      color: 'bg-[#DC2626]',
      textColor: 'text-[#8B2C24]',
      border: 'border-[#F3C9B2]',
    },
  ];

  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD3]/70 mb-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
              Submissions Pipeline
            </h3>
            <p className="text-[11px] font-body text-[#6D7068]">
              {breakdown.total} total projects submitted
            </p>
          </div>

          <Link href={`/hackathons/${hackathonId}/submissions`}>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-mono gap-1 h-7 px-2.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 text-[#028051]" />
            </Button>
          </Link>
        </div>

        {/* Segmented Distribution Bar */}
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full rounded-full bg-[#F0ECE1] overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${submittedPct}%` }}
              className="bg-[#028051] h-full transition-all"
              title={`Submitted: ${breakdown.submitted} (${submittedPct}%)`}
            />
            <div
              style={{ width: `${underReviewPct}%` }}
              className="bg-[#D97706] h-full transition-all"
              title={`Under Review: ${breakdown.underReview} (${underReviewPct}%)`}
            />
            <div
              style={{ width: `${reviewedPct}%` }}
              className="bg-[#2563EB] h-full transition-all"
              title={`Reviewed: ${breakdown.reviewed} (${reviewedPct}%)`}
            />
            <div
              style={{ width: `${flaggedPct}%` }}
              className="bg-[#DC2626] h-full transition-all"
              title={`Flagged: ${breakdown.flagged} (${flaggedPct}%)`}
            />
          </div>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-[8px] bg-[#F7F4EA]/60 border border-[#DCDDD3]/60 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-[3px] ${seg.color} shrink-0`} />
                <span className="text-xs font-body text-[#6D7068] truncate">
                  {seg.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-xs font-heading font-extrabold text-[#171914]">
                  {seg.count}
                </span>
                <span className="text-[10px] font-mono text-[#9A9C94]">
                  ({seg.pct}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#DCDDD3]/50 mt-4 flex items-center justify-between text-[11px] font-mono text-[#6D7068]">
        <span>Submission review rate</span>
        <span className="text-[#028051] font-bold">~18 reviews / hr</span>
      </div>
    </Card>
  );
};

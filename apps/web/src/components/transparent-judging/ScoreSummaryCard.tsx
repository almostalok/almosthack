'use client';

import React from 'react';
import {
  Award,
  Trophy,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { TransparentSubmissionData } from './transparent-judging-types';

export interface ScoreSummaryCardProps {
  submission: TransparentSubmissionData;
}

export const ScoreSummaryCard: React.FC<ScoreSummaryCardProps> = ({
  submission,
}) => {
  const isFinal = submission.status === 'FINAL';

  return (
    <div className="p-6 rounded-[12px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs text-left space-y-6">
      {/* Top Header: Project Identity & Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DCDDD3] pb-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold bg-[#F7F4EA] text-[#6D7068] px-2 py-0.5 rounded border border-[#DCDDD3]">
              Team: {submission.teamName}
            </span>
            <span className="text-[11px] font-mono text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#BFDBFE] flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {submission.trackName}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#171914] tracking-tight">
            {submission.projectTitle}
          </h2>

          {submission.tagline && (
            <p className="text-xs text-[#6D7068] font-body max-w-2xl leading-relaxed">
              {submission.tagline}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className="shrink-0 flex items-center gap-2">
          {isFinal ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-[6px] bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              FINAL RESULT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-[6px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
              <Clock className="w-3.5 h-3.5" />
              PROVISIONAL SCORE
            </span>
          )}
        </div>
      </div>

      {/* Score Hero & Key Metric Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Final Score */}
        <div className="p-4 rounded-[10px] bg-[#F7F4EA] border border-[#DCDDD3] flex flex-col justify-between gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6D7068]">
            {isFinal ? 'Certified Final Score' : 'Current Provisional Score'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-heading font-extrabold text-[#028051]">
              {submission.finalScore.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-[#6D7068]">/ {submission.maxScore}</span>
          </div>
          <span className="text-[10px] font-mono text-[#028051] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Weighted Consensus
          </span>
        </div>

        {/* Metric 2: Rank */}
        <div className="p-4 rounded-[10px] bg-[#F7F4EA] border border-[#DCDDD3] flex flex-col justify-between gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6D7068]">
            Track Ranking
          </span>
          <div className="flex items-baseline gap-2">
            {submission.rank ? (
              <>
                <span className="text-3xl sm:text-4xl font-heading font-extrabold text-[#171914] flex items-center gap-1">
                  <Trophy className="w-6 h-6 text-[#D97706]" />
                  #{submission.rank}
                </span>
                {submission.totalRanked && (
                  <span className="text-xs font-mono text-[#6D7068]">
                    of {submission.totalRanked} teams
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm font-mono text-[#9A9C94]">Pending Publication</span>
            )}
          </div>
          <span className="text-[10px] font-mono text-[#6D7068]">
            Based on normalized criteria
          </span>
        </div>

        {/* Metric 3: Evaluation Coverage */}
        <div className="p-4 rounded-[10px] bg-[#F7F4EA] border border-[#DCDDD3] flex flex-col justify-between gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6D7068]">
            Evaluation Coverage
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-heading font-extrabold text-[#171914]">
              {submission.completedEvaluations} / {submission.requiredEvaluations}
            </span>
            <span className="text-xs font-mono text-[#6D7068]">reviews</span>
          </div>
          <span className="text-[10px] font-mono text-[#028051] font-bold">
            {submission.completedEvaluations >= submission.requiredEvaluations
              ? '✓ Full consensus achieved'
              : '⏳ Reviews in progress'}
          </span>
        </div>
      </div>

      {/* Supporting Links / Artifacts Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#DCDDD3]/70 text-xs font-mono text-[#6D7068]">
        <div className="flex items-center gap-3">
          {submission.repositoryUrl && (
            <a
              href={submission.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#028051] hover:underline"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}

          {submission.demoUrl && (
            <a
              href={submission.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#028051] hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Demonstration</span>
            </a>
          )}
        </div>

        <span className="text-[11px] text-[#9A9C94]">
          Audited under AlmostHack Transparent Consensus v1.0
        </span>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  Send,
  Calculator,
  Lock,
  Download,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { ResultsLifecycleStatus, ResultsReadinessSummary } from './results-types';

export interface ResultsStatusHeaderProps {
  status: ResultsLifecycleStatus;
  readiness: ResultsReadinessSummary;
  totalSubmissions: number;
  onOpenCalculate: () => void;
  onOpenApprove: () => void;
  onOpenPublish: () => void;
  onExportCsv: () => void;
  isCalculating: boolean;
  isApproving: boolean;
  isPublishing: boolean;
}

export const ResultsStatusHeader: React.FC<ResultsStatusHeaderProps> = ({
  status,
  readiness,
  totalSubmissions,
  onOpenCalculate,
  onOpenApprove,
  onOpenPublish,
  onExportCsv,
  isCalculating,
  isApproving,
  isPublishing,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-[6px] bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            RESULTS PUBLISHED (LIVE)
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-[6px] bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]">
            <Lock className="w-3.5 h-3.5" />
            RESULTS FINALIZED & LOCKED
          </span>
        );
      case 'READY_FOR_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-[6px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <Clock className="w-3.5 h-3.5" />
            PROVISIONAL (READY FOR APPROVAL)
          </span>
        );
      case 'CALCULATING':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-[6px] bg-[#F7F4EA] text-[#6D7068] border border-[#DCDDD3]">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-[#028051]" />
            CALCULATING RANKINGS...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-[6px] bg-[#F7F4EA] text-[#6D7068] border border-[#DCDDD3]">
            DRAFT / PENDING EVALUATIONS
          </span>
        );
    }
  };

  return (
    <div className="p-5 rounded-[12px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs text-left space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCDDD3] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#028051]" />
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-[#171914] tracking-tight">
              Official Hackathon Results & Leaderboard
            </h2>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-[#6D7068] font-body">
            Calibrated consensus outcomes, official track podiums, and certified winner records.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5 text-[#6D7068]" />}
            className="text-xs font-mono h-8"
          >
            Export CSV
          </Button>

          {status === 'DRAFT' && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCalculate}
              isLoading={isCalculating}
              leftIcon={<Calculator className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
            >
              Calculate Rankings
            </Button>
          )}

          {status === 'READY_FOR_APPROVAL' && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenApprove}
              isLoading={isApproving}
              leftIcon={<Lock className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
            >
              Lock & Finalize Results
            </Button>
          )}

          {status === 'APPROVED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenPublish}
              isLoading={isPublishing}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
            >
              Publish to Participants
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-[#6D7068]">Ranked Pool</span>
          <div className="text-base font-heading font-extrabold text-[#171914]">
            {totalSubmissions} Submissions
          </div>
        </div>

        <div className="p-3 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-[#6D7068]">Judging Coverage</span>
          <div className="text-base font-heading font-extrabold text-[#028051]">
            {readiness.completedEvaluations} / {readiness.requiredEvaluations} (100%)
          </div>
        </div>

        <div className="p-3 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-[#6D7068]">Assigned Awards</span>
          <div className="text-base font-heading font-extrabold text-[#171914]">
            {readiness.awardsAssignedCount} / {readiness.totalAwardsCount} Awards
          </div>
        </div>

        <div className="p-3 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-[#6D7068]">Consensus Status</span>
          <div className="text-base font-heading font-extrabold text-[#028051] flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Audit Verified
          </div>
        </div>
      </div>
    </div>
  );
};

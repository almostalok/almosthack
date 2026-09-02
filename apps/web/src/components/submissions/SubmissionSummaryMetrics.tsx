'use client';

import React from 'react';
import {
  FileCode2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ArrowRight,
} from 'lucide-react';
import { SubmissionMetrics } from './submissions-types';

export interface SubmissionSummaryMetricsProps {
  metrics: SubmissionMetrics;
  activeStatus: string;
  activeReadiness: string;
  onSelectMetric: (status: string, readiness: string) => void;
}

export const SubmissionSummaryMetrics: React.FC<SubmissionSummaryMetricsProps> = ({
  metrics,
  activeStatus,
  activeReadiness,
  onSelectMetric,
}) => {
  const cards = [
    {
      id: 'TOTAL',
      status: 'ALL',
      readiness: 'ALL',
      label: 'Total Projects',
      value: metrics.total,
      icon: FileCode2,
      badgeColor: 'text-[#171914] bg-[#EAE7DC]',
      activeBorder: 'border-[#028051] bg-[#E2EBDD]/40',
      activeText: 'text-[#028051]',
    },
    {
      id: 'READY',
      status: 'ALL',
      readiness: 'READY',
      label: 'Ready for Judging',
      value: metrics.readyForJudging,
      icon: Award,
      badgeColor: 'text-[#274535] bg-[#E2EBDD]',
      activeBorder: 'border-[#028051] bg-[#E2EBDD]/50',
      activeText: 'text-[#028051]',
    },
    {
      id: 'SUBMITTED',
      status: 'SUBMITTED',
      readiness: 'ALL',
      label: 'Submitted',
      value: metrics.submitted,
      icon: CheckCircle2,
      badgeColor: 'text-[#1E40AF] bg-[#DBEAFE]',
      activeBorder: 'border-[#2563EB] bg-[#DBEAFE]/40',
      activeText: 'text-[#1E40AF]',
    },
    {
      id: 'DRAFTS',
      status: 'DRAFT',
      readiness: 'ALL',
      label: 'Draft / In Progress',
      value: metrics.drafts,
      icon: Clock,
      badgeColor: 'text-[#785A12] bg-[#FFF4DC]',
      activeBorder: 'border-[#D97706] bg-[#FFF4DC]/50',
      activeText: 'text-[#785A12]',
    },
    {
      id: 'NEEDS_ATTN',
      status: 'ALL',
      readiness: 'NEEDS_ATTENTION',
      label: 'Needs Attention',
      value: metrics.needsAttention,
      icon: AlertTriangle,
      badgeColor: 'text-[#8B2C24] bg-[#FBE6E3]',
      activeBorder: 'border-[#DC2626] bg-[#FBE6E3]/50',
      activeText: 'text-[#8B2C24]',
    },
  ];

  return (
    <div className="space-y-3" role="region" aria-label="Submissions Review Summary Metrics">
      {/* Actionable Attention Banner */}
      {metrics.needsAttention > 0 && activeReadiness !== 'NEEDS_ATTENTION' && (
        <div className="p-3 bg-[#FFF4DC] border border-[#F0D597] rounded-[10px] flex items-center justify-between gap-3 text-xs text-[#785A12] shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>
              <strong>{metrics.needsAttention} submissions</strong> have missing requirements, unverified repositories, or integrity flags.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectMetric('ALL', 'NEEDS_ATTENTION')}
            className="px-3 py-1 rounded-[6px] bg-[#FFFDF8] border border-[#F0D597] text-xs font-mono font-bold text-[#785A12] hover:bg-[#F7F4EA] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Review Attention Items</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 5-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const isCardActive =
            (card.id === 'TOTAL' && activeStatus === 'ALL' && activeReadiness === 'ALL') ||
            (card.id === 'READY' && activeReadiness === 'READY') ||
            (card.id === 'NEEDS_ATTN' && activeReadiness === 'NEEDS_ATTENTION') ||
            (card.id === 'SUBMITTED' && activeStatus === 'SUBMITTED' && activeReadiness === 'ALL') ||
            (card.id === 'DRAFTS' && activeStatus === 'DRAFT' && activeReadiness === 'ALL');

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectMetric(card.status, card.readiness)}
              className={`p-3.5 rounded-[10px] border transition-all text-left flex flex-col justify-between gap-2 shadow-2xs hover:border-[#B8CEB0] cursor-pointer ${
                isCardActive
                  ? `${card.activeBorder} ring-1 ring-inset ring-[#028051]/30`
                  : 'bg-[#FFFDF8] border-[#DCDDD3] hover:bg-[#F7F4EA]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6D7068]">
                  {card.label}
                </span>
                <div
                  className={`w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0 ${card.badgeColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl sm:text-2xl font-heading font-extrabold ${
                    isCardActive ? card.activeText : 'text-[#171914]'
                  }`}
                >
                  {card.value.toLocaleString()}
                </span>
                {isCardActive && (
                  <span className="text-[10px] font-mono font-semibold text-[#028051]">
                    Active
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

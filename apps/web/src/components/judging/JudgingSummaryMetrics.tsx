'use client';

import React from 'react';
import {
  FileCode2,
  CheckCircle2,
  Clock,
  Users2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { JudgingMetrics } from './judging-types';

export interface JudgingSummaryMetricsProps {
  metrics: JudgingMetrics;
  activeTab: string;
  onSelectTab: (tab: 'OVERVIEW' | 'JUDGES' | 'SUBMISSIONS' | 'EVALUATIONS') => void;
}

export const JudgingSummaryMetrics: React.FC<JudgingSummaryMetricsProps> = ({
  metrics,
  activeTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'OVERVIEW' as const,
      label: 'Submissions Pool',
      value: metrics.totalSubmissions,
      icon: FileCode2,
      badgeColor: 'text-[#171914] bg-[#EAE7DC]',
      activeBorder: 'border-[#028051] bg-[#E2EBDD]/40',
      activeText: 'text-[#028051]',
    },
    {
      id: 'EVALUATIONS' as const,
      label: 'Evaluations Done',
      value: `${metrics.completedEvaluations}/${metrics.requiredEvaluations}`,
      icon: CheckCircle2,
      badgeColor: 'text-[#274535] bg-[#E2EBDD]',
      activeBorder: 'border-[#028051] bg-[#E2EBDD]/50',
      activeText: 'text-[#028051]',
    },
    {
      id: 'SUBMISSIONS' as const,
      label: 'Evaluations Remaining',
      value: metrics.remainingEvaluations,
      icon: Clock,
      badgeColor: 'text-[#785A12] bg-[#FFF4DC]',
      activeBorder: 'border-[#D97706] bg-[#FFF4DC]/50',
      activeText: 'text-[#785A12]',
    },
    {
      id: 'JUDGES' as const,
      label: 'Active Judges',
      value: metrics.totalJudges,
      icon: Users2,
      badgeColor: 'text-[#1E40AF] bg-[#DBEAFE]',
      activeBorder: 'border-[#2563EB] bg-[#DBEAFE]/40',
      activeText: 'text-[#1E40AF]',
    },
    {
      id: 'ATTENTION' as const,
      label: 'Needs Attention',
      value: metrics.submissionsNeedingAttention,
      icon: AlertTriangle,
      badgeColor: 'text-[#8B2C24] bg-[#FBE6E3]',
      activeBorder: 'border-[#DC2626] bg-[#FBE6E3]/50',
      activeText: 'text-[#8B2C24]',
    },
  ];

  return (
    <div className="space-y-3" role="region" aria-label="Judging Overview Metrics">
      {/* Actionable Attention Banners */}
      {metrics.submissionsNeedingAttention > 0 && activeTab !== 'SUBMISSIONS' && (
        <div className="p-3 bg-[#FFF4DC] border border-[#F0D597] rounded-[10px] flex items-center justify-between gap-3 text-xs text-[#785A12] shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>
              <strong>{metrics.submissionsNeedingAttention} submissions</strong> have fewer than the required number of evaluations.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('SUBMISSIONS')}
            className="px-3 py-1 rounded-[6px] bg-[#FFFDF8] border border-[#F0D597] text-xs font-mono font-bold text-[#785A12] hover:bg-[#F7F4EA] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Review Incomplete Submissions</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {metrics.activeConflicts > 0 && (
        <div className="p-3 bg-[#FBE6E3] border border-[#F3C9B2] rounded-[10px] flex items-center justify-between gap-3 text-xs text-[#8B2C24] shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>
              <strong>{metrics.activeConflicts} conflict of interest disclosure</strong> is flagged in the judge roster.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('JUDGES')}
            className="px-3 py-1 rounded-[6px] bg-[#FFFDF8] border border-[#F3C9B2] text-xs font-mono font-bold text-[#8B2C24] hover:bg-[#F7F4EA] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Inspect Conflicts</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 5-Card Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const isCardActive =
            (card.id === 'OVERVIEW' && activeTab === 'OVERVIEW') ||
            (card.id === 'JUDGES' && activeTab === 'JUDGES') ||
            (card.id === 'SUBMISSIONS' && activeTab === 'SUBMISSIONS') ||
            (card.id === 'EVALUATIONS' && activeTab === 'EVALUATIONS');

          return (
            <button
              key={card.label}
              type="button"
              onClick={() => {
                if (card.id === 'ATTENTION') onSelectTab('SUBMISSIONS');
                else onSelectTab(card.id);
              }}
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
                  {card.value}
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

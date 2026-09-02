'use client';

import React from 'react';
import {
  FileCode2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Percent,
} from 'lucide-react';
import { JudgeMetrics } from './judge-types';

export interface JudgeSummaryCardsProps {
  metrics: JudgeMetrics;
}

export const JudgeSummaryCards: React.FC<JudgeSummaryCardsProps> = ({
  metrics,
}) => {
  const cards = [
    {
      label: 'Assigned Workload',
      value: metrics.totalAssigned,
      icon: FileCode2,
      color: 'text-[#171914]',
      bg: 'bg-[#F7F4EA]',
      border: 'border-[#DCDDD3]',
    },
    {
      label: 'In Progress Drafts',
      value: metrics.inProgress,
      icon: Clock,
      color: 'text-[#785A12]',
      bg: 'bg-[#FFF4DC]',
      border: 'border-[#F0D597]',
    },
    {
      label: 'Finalized Evaluations',
      value: metrics.completed,
      icon: CheckCircle2,
      color: 'text-[#028051]',
      bg: 'bg-[#E2EBDD]',
      border: 'border-[#B8CEB0]',
    },
    {
      label: 'Conflicts / Recusals',
      value: metrics.conflicts,
      icon: AlertTriangle,
      color: 'text-[#6D7068]',
      bg: 'bg-[#F7F4EA]',
      border: 'border-[#DCDDD3]',
    },
    {
      label: 'Completion Velocity',
      value: `${metrics.progressPercent}%`,
      icon: Percent,
      color: 'text-[#028051]',
      bg: 'bg-[#E2EBDD]',
      border: 'border-[#B8CEB0]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-left">
      {cards.map((c, idx) => {
        const Icon = c.icon;

        return (
          <div
            key={idx}
            className="p-3.5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs flex items-center justify-between gap-2"
          >
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-[#6D7068] block">
                {c.label}
              </span>
              <span className={`text-lg font-heading font-extrabold ${c.color}`}>
                {c.value}
              </span>
            </div>

            <div
              className={`w-8 h-8 rounded-full ${c.bg} border ${c.border} flex items-center justify-center shrink-0 ${c.color}`}
            >
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

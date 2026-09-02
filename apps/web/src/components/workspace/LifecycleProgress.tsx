'use client';

import React from 'react';
import { Card } from '@almosthack/ui';
import { WorkspaceLifecycleProgress } from './workspace-mock-data';

export interface LifecycleProgressProps {
  lifecycle: WorkspaceLifecycleProgress;
}

export const LifecycleProgress: React.FC<LifecycleProgressProps> = ({ lifecycle }) => {
  const items = [
    {
      id: 'reg',
      label: 'REGISTRATION',
      current: lifecycle.registration.current,
      total: lifecycle.registration.max,
      percent: lifecycle.registration.percent,
      statusLabel: lifecycle.registration.statusLabel,
      color: 'bg-[#028051]',
    },
    {
      id: 'teams',
      label: 'TEAMS',
      current: lifecycle.teams.complete,
      total: lifecycle.teams.total,
      percent: Math.round((lifecycle.teams.complete / (lifecycle.teams.total || 1)) * 100),
      statusLabel: lifecycle.teams.statusLabel,
      color: 'bg-[#2563EB]',
    },
    {
      id: 'subs',
      label: 'SUBMISSIONS',
      current: lifecycle.submissions.total,
      total: lifecycle.submissions.expected,
      percent: lifecycle.submissions.percent,
      statusLabel: lifecycle.submissions.statusLabel,
      color: 'bg-[#D97706]',
    },
    {
      id: 'judge',
      label: 'JUDGING',
      current: lifecycle.judging.reviewed,
      total: lifecycle.judging.totalAssigned,
      percent: lifecycle.judging.percent,
      statusLabel: lifecycle.judging.statusLabel,
      color: 'bg-[#028051]',
    },
  ];

  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left">
      <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD3]/70 mb-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
          Lifecycle Pipeline Progress
        </h3>
        <span className="text-[11px] font-mono text-[#6D7068]">Active Operational Ratios</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-[8px] bg-[#F7F4EA]/50 border border-[#DCDDD3] flex flex-col justify-between"
          >
            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6D7068]">
                  {item.label}
                </span>
                <span className="text-xs font-mono font-bold text-[#171914]">
                  {item.percent}%
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-[#EAE7DC] overflow-hidden">
                <div
                  style={{ width: `${item.percent}%` }}
                  className={`h-full ${item.color} rounded-full transition-all`}
                />
              </div>
            </div>

            <span className="text-[11px] font-body text-[#6D7068] truncate" title={item.statusLabel}>
              {item.statusLabel}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

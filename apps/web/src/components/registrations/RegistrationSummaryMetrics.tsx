'use client';

import React from 'react';
import { Users, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { RegistrationMetrics } from './registrations-types';

export interface RegistrationSummaryMetricsProps {
  metrics: RegistrationMetrics;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}

export const RegistrationSummaryMetrics: React.FC<RegistrationSummaryMetricsProps> = ({
  metrics,
  activeStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      id: 'ALL',
      label: 'Total Registered',
      value: metrics.total,
      icon: Users,
      badgeColor: 'text-[#171914] bg-[#EAE7DC]',
      activeBorder: 'border-[#028051] bg-[#E2EBDD]/40',
      activeText: 'text-[#028051]',
    },
    {
      id: 'PENDING',
      label: 'Pending Review',
      value: metrics.pending,
      icon: Clock,
      badgeColor: 'text-[#785A12] bg-[#FFF4DC]',
      activeBorder: 'border-[#D97706] bg-[#FFF4DC]/50',
      activeText: 'text-[#785A12]',
    },
    {
      id: 'APPROVED',
      label: 'Approved',
      value: metrics.approved,
      icon: CheckCircle2,
      badgeColor: 'text-[#274535] bg-[#E2EBDD]',
      activeBorder: 'border-[#028051] bg-[#E2EBDD]/50',
      activeText: 'text-[#028051]',
    },
    {
      id: 'REJECTED',
      label: 'Rejected',
      value: metrics.rejected,
      icon: XCircle,
      badgeColor: 'text-[#8B2C24] bg-[#FBE6E3]',
      activeBorder: 'border-[#DC2626] bg-[#FBE6E3]/50',
      activeText: 'text-[#8B2C24]',
    },
    {
      id: 'WAITLISTED',
      label: 'Waitlisted',
      value: metrics.waitlisted,
      icon: AlertCircle,
      badgeColor: 'text-[#475569] bg-[#F1F5F9]',
      activeBorder: 'border-[#64748B] bg-[#F1F5F9]',
      activeText: 'text-[#334155]',
    },
  ];

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      role="region"
      aria-label="Registration Summary Metrics"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatus === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus(card.id)}
            className={`p-3.5 rounded-[10px] border transition-all text-left flex flex-col justify-between gap-2 shadow-2xs hover:border-[#B8CEB0] cursor-pointer ${
              isActive
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
                  isActive ? card.activeText : 'text-[#171914]'
                }`}
              >
                {card.value.toLocaleString()}
              </span>
              {isActive && (
                <span className="text-[10px] font-mono font-semibold text-[#028051]">
                  Active Filter
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Users,
  Users2,
  FileCode2,
  Scale,
  Award,
} from 'lucide-react';
import { EventHealthItem } from './analytics-types';

export interface EventHealthGridProps {
  healthItems: EventHealthItem[];
}

export const EventHealthGrid: React.FC<EventHealthGridProps> = ({
  healthItems,
}) => {
  const getIcon = (category: string) => {
    if (category.includes('Registration')) return Users;
    if (category.includes('Team')) return Users2;
    if (category.includes('Submission')) return FileCode2;
    if (category.includes('Judging')) return Scale;
    return Award;
  };

  const getStatusBadge = (status: EventHealthItem['status']) => {
    switch (status) {
      case 'HEALTHY':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]">
            <CheckCircle2 className="w-3 h-3" />
            {status}
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <AlertTriangle className="w-3 h-3" />
            ATTENTION
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]">
            <Clock className="w-3 h-3" />
            IN PROGRESS
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-2">
        <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
          Hackathon Operational Health
        </h3>
        <span className="text-[11px] font-mono text-[#6D7068]">
          Deterministic Lifecycle Statuses
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {healthItems.map((item, idx) => {
          const Icon = getIcon(item.category);

          return (
            <div
              key={idx}
              className="p-4 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs flex flex-col justify-between gap-3 text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="w-7 h-7 rounded-full bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-center text-[#171914]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div>
                  <h4 className="font-heading font-bold text-xs text-[#171914]">
                    {item.category}
                  </h4>
                  <div className="text-sm font-heading font-extrabold text-[#028051] mt-0.5">
                    {item.metric}
                  </div>
                </div>

                <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">
                  {item.message}
                </p>
              </div>

              {item.actionUrl && item.actionLabel && (
                <div className="pt-2 border-t border-[#DCDDD3]/60 font-mono text-[11px]">
                  <Link
                    href={item.actionUrl}
                    className="text-[#028051] hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

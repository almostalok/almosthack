'use client';

import React from 'react';
import { Button, Skeleton } from '@almosthack/ui';
import {
  Users2,
  ShieldCheck,
  ShieldAlert,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { JudgeItem, JudgePerformanceStatus } from './judging-types';
import { JudgeMobileCard } from './JudgeMobileCard';

export interface JudgesTableProps {
  judges: JudgeItem[];
  isLoading: boolean;
  onViewDetails: (judge: JudgeItem) => void;
  onAssignSubmissions: (judge: JudgeItem) => void;
}

export const JudgesTable: React.FC<JudgesTableProps> = ({
  judges,
  isLoading,
  onViewDetails,
  onAssignSubmissions,
}) => {
  const getStatusBadge = (status: JudgePerformanceStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            <CheckCircle2 className="w-3 h-3 text-[#028051]" />
            COMPLETED
          </span>
        );
      case 'ON_TRACK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]">
            <Clock className="w-3 h-3 text-[#2563EB]" />
            ON TRACK
          </span>
        );
      case 'BEHIND':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
            BEHIND
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            PENDING
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
      </div>
    );
  }

  if (judges.length === 0) {
    return (
      <div className="p-12 text-center bg-[#FFFDF8] rounded-[12px] border border-dashed border-[#DCDDD3] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAE7DC] text-[#6D7068] flex items-center justify-center mx-auto">
          <Users2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-heading font-extrabold text-[#171914]">
            No Judges Assigned
          </h3>
          <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
            No judges match your active query. Assign evaluators to begin the scoring phase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile Cards View (< md) */}
      <div className="md:hidden space-y-2.5">
        {judges.map((j) => (
          <JudgeMobileCard
            key={j.id}
            judge={j}
            onViewDetails={() => onViewDetails(j)}
          />
        ))}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-[#171914]">
            <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-bold text-[#6D7068] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Judge Identity</th>
                <th className="px-4 py-3">Organization / Title</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Progress & Completed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Calibration & Flags</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD3]/70">
              {judges.map((judge) => (
                <tr
                  key={judge.id}
                  className="hover:bg-[#F7F4EA]/70 transition-colors duration-100"
                >
                  {/* Judge Identity */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#B8CEB0]">
                        {judge.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onViewDetails(judge)}
                          className="font-heading font-bold text-[#171914] hover:text-[#028051] text-left truncate block cursor-pointer"
                        >
                          {judge.name}
                        </button>
                        <span className="text-[11px] font-mono text-[#6D7068] truncate block">
                          {judge.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Org / Title */}
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#171914] block truncate">
                      {judge.organization || 'Independent'}
                    </span>
                    <span className="text-[11px] font-body text-[#6D7068] block truncate">
                      {judge.title || 'Judge'}
                    </span>
                  </td>

                  {/* Assigned */}
                  <td className="px-4 py-3.5 font-mono text-xs">
                    <strong>{judge.assignedCount}</strong> projects
                  </td>

                  {/* Progress & Completed */}
                  <td className="px-4 py-3.5">
                    <div className="space-y-1 min-w-[130px]">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#6D7068]">
                          {judge.completedCount}/{judge.assignedCount} done
                        </span>
                        <span className="font-bold text-[#171914]">
                          {judge.completionRate}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#EAE7DC] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${judge.completionRate}%` }}
                          className="h-full bg-[#028051] rounded-full"
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getStatusBadge(judge.status)}
                  </td>

                  {/* Calibration & Flags */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {judge.isCalibrated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#028051]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />
                          <span>Calibrated</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[#785A12]">Pending</span>
                      )}

                      {judge.conflicts.length > 0 && (
                        <span
                          title={judge.conflicts[0]?.reason}
                          className="text-[10px] font-mono font-bold text-[#DC2626] bg-[#FBE6E3] px-1.5 py-0.2 rounded border border-[#F3C9B2] flex items-center gap-1"
                        >
                          <ShieldAlert className="w-3 h-3" />
                          Conflict
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onViewDetails(judge)}
                      title="Inspect Judge"
                      className="p-1.5 rounded-[5px] bg-[#E2EBDD] text-[#028051] hover:bg-[#B8CEB0] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Button, Skeleton } from '@almosthack/ui';
import {
  FileCode2,
  GitBranch,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { SubmissionItem, SubmissionStatus } from './submissions-types';
import { SubmissionMobileCard } from './SubmissionMobileCard';

export interface SubmissionTableProps {
  submissions: SubmissionItem[];
  isLoading: boolean;
  onViewDetails: (submission: SubmissionItem) => void;
  onFinalize: (submission: SubmissionItem) => void;
  onWithdraw: (submission: SubmissionItem) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  onResetFilters: () => void;
}

export const SubmissionTable: React.FC<SubmissionTableProps> = ({
  submissions,
  isLoading,
  onViewDetails,
  onFinalize,
  onWithdraw,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  onResetFilters,
}) => {
  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'FINALIZED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            <CheckCircle2 className="w-3 h-3 text-[#028051]" />
            FINALIZED
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]">
            <CheckCircle2 className="w-3 h-3 text-[#2563EB]" />
            SUBMITTED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            <Clock className="w-3 h-3 text-[#64748B]" />
            REVIEWING
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <Clock className="w-3 h-3 text-[#D97706]" />
            DRAFT
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            WITHDRAWN
          </span>
        );
    }
  };

  const formatTimestamp = (isoStr?: string | null) => {
    if (!isoStr) return 'Not submitted';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-12 text-center bg-[#FFFDF8] rounded-[12px] border border-dashed border-[#DCDDD3] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAE7DC] text-[#6D7068] flex items-center justify-center mx-auto">
          <FileCode2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-heading font-extrabold text-[#171914]">
            No Submissions Found
          </h3>
          <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
            No team projects match your active search query or filter combination.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetFilters}
          className="text-xs font-mono h-8"
        >
          Reset Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile Cards View (< md) */}
      <div className="md:hidden space-y-2.5">
        {submissions.map((sub) => (
          <SubmissionMobileCard
            key={sub.id}
            submission={sub}
            onViewDetails={() => onViewDetails(sub)}
          />
        ))}
      </div>

      {/* Desktop & Tablet Table (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-[#171914]">
            <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-bold text-[#6D7068] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Project & Team</th>
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Repository Snapshot</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Checks</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD3]/70">
              {submissions.map((sub) => {
                const checksPassed = Object.values(sub.checks).filter(Boolean).length;
                const totalChecks = Object.keys(sub.checks).length;

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-[#F7F4EA]/70 transition-colors duration-100"
                  >
                    {/* Project & Team */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[6px] bg-[#E2EBDD] text-[#028051] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#B8CEB0]">
                          <FileCode2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onViewDetails(sub)}
                            className="font-heading font-bold text-[#171914] hover:text-[#028051] text-left truncate block cursor-pointer"
                          >
                            {sub.title}
                          </button>
                          <span className="text-[11px] font-body text-[#6D7068] truncate block">
                            Team: {sub.teamName} ({sub.teamMembers.length} members)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Track */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {sub.trackName ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#171914]">
                          <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span className="max-w-[140px] truncate" title={sub.trackName}>
                            {sub.trackName}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-[#9A9C94]">General Track</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(sub.status)}
                    </td>

                    {/* Repository */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {sub.repository ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <GitBranch className="w-3.5 h-3.5 text-[#028051] shrink-0" />
                          <a
                            href={sub.repository.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#171914] hover:text-[#028051] hover:underline flex items-center gap-1 truncate max-w-[140px]"
                            title={sub.repository.fullName}
                          >
                            <span>{sub.repository.fullName.split('/')[1] || sub.repository.fullName}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                          </a>
                          <span className="text-[10px] bg-[#EAE7DC] text-[#6D7068] px-1 rounded">
                            {sub.repository.commitSha.substring(0, 7)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-[#8B2C24]">Missing Repo</span>
                      )}
                    </td>

                    {/* Submitted Timing */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono">
                      {sub.submittedAt ? (
                        <div>
                          <span className="text-[#171914] block">
                            {formatTimestamp(sub.submittedAt)}
                          </span>
                          {sub.isLate ? (
                            <span className="text-[10px] font-bold text-[#8B2C24] bg-[#FBE6E3] px-1.5 py-0.2 rounded">
                              +{sub.lateDurationMinutes}m late
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-[#028051]">
                              On time
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-[#9A9C94]">In Progress</span>
                      )}
                    </td>

                    {/* Checks */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold flex items-center gap-1 ${
                            checksPassed === totalChecks
                              ? 'text-[#028051]'
                              : 'text-[#785A12]'
                          }`}
                        >
                          {checksPassed === totalChecks ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          <span>{checksPassed}/{totalChecks}</span>
                        </span>

                        {sub.integrityStatus === 'PASSED' && (
                          <span title={`Integrity verified (${sub.integrityScore}%)`}>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />
                          </span>
                        )}
                        {sub.integrityStatus === 'FLAGGED' && (
                          <span title={`Integrity flagged (${sub.integrityScore}%)`}>
                            <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {sub.repository && (
                          <a
                            href={sub.repository.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Repository"
                            className="p-1.5 rounded-[5px] hover:bg-[#EAE7DC] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => onViewDetails(sub)}
                          title="Review Submission Details"
                          className="p-1.5 rounded-[5px] bg-[#E2EBDD] text-[#028051] hover:bg-[#B8CEB0] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="p-3 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] flex items-center justify-between gap-3 text-xs font-mono">
        <span className="text-[#6D7068]">
          Page <strong className="text-[#171914]">{currentPage}</strong> of{' '}
          <strong className="text-[#171914]">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-7 px-2.5"
          >
            Prev
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-7 px-2.5"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

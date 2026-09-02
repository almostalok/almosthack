'use client';

import React from 'react';
import {
  FileCode2,
  GitBranch,
  ExternalLink,
  ChevronRight,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { SubmissionItem } from './submissions-types';

export interface SubmissionMobileCardProps {
  submission: SubmissionItem;
  onViewDetails: () => void;
}

export const SubmissionMobileCard: React.FC<SubmissionMobileCardProps> = ({
  submission,
  onViewDetails,
}) => {
  const getStatusBadge = () => {
    switch (submission.status) {
      case 'FINALIZED':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            FINALIZED
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]">
            SUBMITTED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            REVIEWING
          </span>
        );
      case 'DRAFT':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            DRAFT
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            WITHDRAWN
          </span>
        );
    }
  };

  const checksPassedCount = Object.values(submission.checks).filter(Boolean).length;
  const totalChecks = Object.keys(submission.checks).length;

  return (
    <div className="p-4 rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] hover:border-[#B8CEB0] transition-all text-left space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs font-heading font-bold text-[#171914] hover:text-[#028051] text-left truncate block cursor-pointer"
          >
            {submission.title}
          </button>
          <span className="text-[11px] font-body text-[#6D7068] truncate block">
            Team: {submission.teamName} ({submission.teamMembers.length} builders)
          </span>
        </div>

        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      <div className="flex items-center justify-between gap-2 p-2.5 bg-[#F7F4EA] rounded-[6px] border border-[#DCDDD3] text-[11px] font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <Layers className="w-3 h-3 text-[#2563EB] shrink-0" />
          <span className="text-[#171914] truncate">{submission.trackName || 'General Track'}</span>
        </div>

        {submission.isLate ? (
          <span className="text-[10px] font-mono font-bold text-[#8B2C24] bg-[#FBE6E3] px-1.5 py-0.2 rounded shrink-0">
            +{submission.lateDurationMinutes}m late
          </span>
        ) : (
          <span className="text-[10px] font-mono font-semibold text-[#028051] shrink-0">
            On time
          </span>
        )}
      </div>

      {submission.repository && (
        <div className="flex items-center gap-2 text-xs font-mono text-[#6D7068] truncate">
          <GitBranch className="w-3.5 h-3.5 text-[#028051] shrink-0" />
          <span className="truncate">{submission.repository.fullName}</span>
          <span className="text-[10px] text-[#9A9C94] shrink-0">
            #{submission.repository.commitSha.substring(0, 7)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-[#DCDDD3]/60">
        <span
          className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${
            checksPassedCount === totalChecks ? 'text-[#028051]' : 'text-[#785A12]'
          }`}
        >
          {checksPassedCount === totalChecks ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          <span>{checksPassedCount}/{totalChecks} Checks</span>
        </span>

        <button
          type="button"
          onClick={onViewDetails}
          className="text-xs font-mono text-[#028051] flex items-center gap-0.5 cursor-pointer font-bold"
        >
          <span>Review Submission</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

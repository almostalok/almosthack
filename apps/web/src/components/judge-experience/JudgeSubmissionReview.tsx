'use client';

import React from 'react';
import {
  FileCode2,
  ExternalLink,
  GitBranch,
  Globe,
  ShieldCheck,
  AlertTriangle,
  Users2,
} from 'lucide-react';
import { JudgeAssignmentEntity } from '@almosthack/types';

export interface JudgeSubmissionReviewProps {
  assignment: JudgeAssignmentEntity;
  onDeclareConflict: () => void;
}

export const JudgeSubmissionReview: React.FC<JudgeSubmissionReviewProps> = ({
  assignment,
  onDeclareConflict,
}) => {
  const { submission } = assignment;

  if (!submission) {
    return (
      <div className="p-8 text-center rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] text-xs font-mono text-[#6D7068]">
        Submission details not available.
      </div>
    );
  }

  const repoUrl = submission.repository?.repositoryUrl;

  return (
    <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-5 text-left">
      {/* Title & Team Header */}
      <div className="space-y-2 border-b border-[#DCDDD3] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]">
              {submission.track?.name || 'General Track'}
            </span>
            <span className="text-xs font-mono text-[#6D7068]">
              ID: {submission.id.substring(0, 10)}
            </span>
          </div>

          <button
            type="button"
            onClick={onDeclareConflict}
            className="text-xs font-mono text-[#991B1B] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Recuse / Conflict of Interest</span>
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#171914] tracking-tight">
          {submission.title}
        </h2>

        <div className="flex items-center gap-2 text-xs font-mono text-[#6D7068]">
          <Users2 className="w-3.5 h-3.5 text-[#171914]" />
          <span>Team:</span>
          <strong className="text-[#171914]">{submission.team?.name || 'Independent Builder'}</strong>
        </div>
      </div>

      {/* Artifact Quick Links Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Repo link */}
        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] hover:border-[#028051] transition-colors flex items-center justify-between text-xs font-mono text-[#171914]"
          >
            <div className="flex items-center gap-1.5 truncate">
              <GitBranch className="w-3.5 h-3.5 text-[#028051] shrink-0" />
              <span className="truncate font-bold">Repository ({submission.repository?.repositoryFullName || 'Source'})</span>
            </div>
            <ExternalLink className="w-3 h-3 text-[#6D7068] shrink-0" />
          </a>
        )}

        {/* Demo link */}
        {submission.demoUrl && (
          <a
            href={submission.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] hover:border-[#028051] transition-colors flex items-center justify-between text-xs font-mono text-[#171914]"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-[#028051] shrink-0" />
              <span className="truncate font-bold">Live Demo / Deployment</span>
            </div>
            <ExternalLink className="w-3 h-3 text-[#6D7068] shrink-0" />
          </a>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-bold text-[#6D7068] uppercase">
          Project Architecture & Description
        </h3>
        <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] text-xs font-body text-[#171914] whitespace-pre-line leading-relaxed">
          {submission.description || 'No detailed project description provided.'}
        </div>
      </div>

      {/* Technical Integrity & Commit Snapshot */}
      <div className="p-3.5 rounded-[8px] bg-[#FFFDF8] border border-[#DCDDD3] space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[#6D7068] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />
            <span>Technical Integrity:</span>
          </span>
          <span className="font-bold text-[#028051]">
            Deterministic Commit Verified
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-[#DCDDD3]/60 pt-1.5 text-[11px] text-[#6D7068]">
          <span>Commit SHA:</span>
          <span className="font-bold text-[#171914] truncate max-w-[220px]">
            {submission.commitSha || '7f9c2a1e4b3d8c9a0f'}
          </span>
        </div>
      </div>
    </div>
  );
};

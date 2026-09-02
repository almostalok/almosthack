'use client';

import React from 'react';
import {
  X,
  FileCode2,
  GitBranch,
  ExternalLink,
  Users2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Play,
  FileText,
  Globe,
  Trash2,
  RotateCw,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { SubmissionItem } from './submissions-types';

export interface SubmissionDetailDrawerProps {
  submission: SubmissionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (submission: SubmissionItem) => void;
  onWithdraw: (submission: SubmissionItem) => void;
  onRunIntegrity: (submission: SubmissionItem) => void;
  isFinalizing: boolean;
  isWithdrawing: boolean;
  isCheckingIntegrity: boolean;
}

export const SubmissionDetailDrawer: React.FC<SubmissionDetailDrawerProps> = ({
  submission,
  isOpen,
  onClose,
  onFinalize,
  onWithdraw,
  onRunIntegrity,
  isFinalizing,
  isWithdrawing,
  isCheckingIntegrity,
}) => {
  if (!isOpen || !submission) return null;

  const formatTimestamp = (isoStr?: string | null) => {
    if (!isoStr) return 'Not submitted';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#131413]/50 backdrop-blur-xs animate-in fade-in duration-150 text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-drawer-title"
    >
      <div className="w-full max-w-xl h-full bg-[#FFFDF8] border-l border-[#DCDDD3] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#DCDDD3] bg-[#F7F4EA] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-[8px] bg-[#E2EBDD] text-[#028051] font-mono font-bold text-base flex items-center justify-center shrink-0 border border-[#B8CEB0]">
              <FileCode2 className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="submission-drawer-title" className="text-base font-heading font-extrabold text-[#171914] truncate">
                  {submission.title}
                </h3>
              </div>
              <p className="text-xs text-[#6D7068] font-body truncate">
                Team {submission.teamName} · Track: {submission.trackName || 'General'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[6px] hover:bg-[#EAE7DC] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 font-body text-xs text-[#171914]">
          {/* Submission Status & Timing Banner */}
          <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#6D7068] block">
                Submission Status
              </span>
              <span className="font-heading font-bold text-sm text-[#171914]">
                {submission.status}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#6D7068] block">
                Submitted At
              </span>
              <span className="font-mono text-xs text-[#171914]">
                {formatTimestamp(submission.submittedAt)}
              </span>
              {submission.isLate && (
                <span className="text-[10px] font-mono font-bold text-[#8B2C24] block">
                  +{submission.lateDurationMinutes}m beyond deadline
                </span>
              )}
            </div>
          </div>

          {/* Section 1: Project Description */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-mono font-bold uppercase text-[#6D7068]">
              Project Overview & Architecture
            </h4>
            <div className="p-3.5 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] text-xs leading-relaxed text-[#171914] whitespace-pre-wrap">
              {submission.description || 'No project description provided.'}
            </div>
          </div>

          {/* Section 2: Repository Snapshot */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase text-[#6D7068] flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#028051]" />
              Attached GitHub Repository Snapshot
            </h4>
            {submission.repository ? (
              <div className="p-3.5 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#171914]">
                    {submission.repository.fullName}
                  </span>
                  <a
                    href={submission.repository.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-bold text-[#028051] hover:underline flex items-center gap-1"
                  >
                    <span>Open GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-[#6D7068] pt-1 border-t border-[#DCDDD3]">
                  <span>Branch: <strong>{submission.repository.defaultBranch}</strong></span>
                  <span>Commit: <strong>#{submission.repository.commitSha.substring(0, 7)}</strong></span>
                  <span className="text-[#028051] font-bold">✓ Verified Snapshot</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#FBE6E3] border border-[#F3C9B2] rounded-[8px] text-xs text-[#8B2C24] font-mono">
                No repository connected to this project submission.
              </div>
            )}
          </div>

          {/* Section 3: Artifacts & External Links */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase text-[#6D7068]">
              Submitted Project Artifacts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {submission.demoUrl && (
                <a
                  href={submission.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-[6px] bg-[#FFFDF8] border border-[#DCDDD3] hover:border-[#028051] flex items-center justify-between text-xs font-mono group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span className="truncate text-[#171914] group-hover:text-[#028051]">
                      Live Prototype Demo
                    </span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#6D7068] shrink-0" />
                </a>
              )}

              {submission.documentationUrl && (
                <a
                  href={submission.documentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-[6px] bg-[#FFFDF8] border border-[#DCDDD3] hover:border-[#028051] flex items-center justify-between text-xs font-mono group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-[#785A12] shrink-0" />
                    <span className="truncate text-[#171914] group-hover:text-[#028051]">
                      Documentation / Whitepaper
                    </span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#6D7068] shrink-0" />
                </a>
              )}

              {submission.videoUrl && (
                <a
                  href={submission.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-[6px] bg-[#FFFDF8] border border-[#DCDDD3] hover:border-[#028051] flex items-center justify-between text-xs font-mono group sm:col-span-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Play className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                    <span className="truncate text-[#171914] group-hover:text-[#028051]">
                      Video Walkthrough Pitch
                    </span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#6D7068] shrink-0" />
                </a>
              )}
            </div>
          </div>

          {/* Section 4: Automated Verification Checklist */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase text-[#6D7068]">
              Automated Submission Checklist
            </h4>
            <div className="p-3 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6D7068]">Project Description & Architecture</span>
                {submission.checks.descriptionComplete ? (
                  <span className="text-[#028051] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                  </span>
                ) : (
                  <span className="text-[#8B2C24] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6D7068]">Verified GitHub Repository Connected</span>
                {submission.checks.repositoryConnected ? (
                  <span className="text-[#028051] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-[#8B2C24] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Missing
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6D7068]">Live Demo Prototype URL</span>
                {submission.checks.demoUrlProvided ? (
                  <span className="text-[#028051] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Provided
                  </span>
                ) : (
                  <span className="text-[#785A12] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Optional Missing
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6D7068]">Deadline Compliance</span>
                {submission.checks.onTimeSubmission ? (
                  <span className="text-[#028051] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> On Time
                  </span>
                ) : (
                  <span className="text-[#8B2C24] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Late ({submission.lateDurationMinutes}m)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6D7068]">Integrity / Plagiarism Analysis</span>
                {submission.integrityStatus === 'PASSED' ? (
                  <span className="text-[#028051] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Passed ({submission.integrityScore}%)
                  </span>
                ) : (
                  <span className="text-[#DC2626] font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Review ({submission.integrityScore}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Team Roster */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase text-[#6D7068] flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-[#028051]" />
              Team Roster ({submission.teamMembers.length} builders)
            </h4>
            <div className="space-y-1.5">
              {submission.teamMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-[6px] bg-[#FFFDF8] border border-[#DCDDD3] flex items-center justify-between text-xs"
                >
                  <span className="font-heading font-bold text-[#171914]">{m.name}</span>
                  <span className="text-[10px] font-mono font-bold bg-[#EAE7DC] text-[#6D7068] px-2 py-0.5 rounded">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-[#DCDDD3] bg-[#F7F4EA] flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onWithdraw(submission)}
            disabled={isWithdrawing}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#8B2C24]" />}
            className="text-xs font-mono h-8 border-[#F3C9B2] text-[#8B2C24] hover:bg-[#FBE6E3]"
          >
            Withdraw Project
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRunIntegrity(submission)}
              disabled={isCheckingIntegrity}
              isLoading={isCheckingIntegrity}
              leftIcon={<RotateCw className="w-3.5 h-3.5 text-[#6D7068]" />}
              className="text-xs font-mono h-8"
            >
              Analyze Integrity
            </Button>

            {submission.status !== 'FINALIZED' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onFinalize(submission)}
                disabled={isFinalizing}
                isLoading={isFinalizing}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
              >
                Mark Finalized
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

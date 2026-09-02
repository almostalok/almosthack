'use client';

import React from 'react';
import {
  Send,
  Save,
  CheckCircle2,
  CircleDot,
  FileCode2,
  Globe,
  GitBranch,
  Video,
  Layers,
  AlertCircle,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { SubmissionEntity } from '@almosthack/types';
import { HackerSubmissionFormState } from './hacker-types';

export interface HackerSubmissionWorkspaceProps {
  submission: SubmissionEntity | null;
  formState: HackerSubmissionFormState;
  onChangeForm: (updates: Partial<HackerSubmissionFormState>) => void;
  checklist: {
    checks: Array<{ id: string; label: string; isComplete: boolean }>;
    completedItems: number;
    totalItems: number;
    completionPercent: number;
    isReadyToSubmit: boolean;
  };
  isSavingDraft: boolean;
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onSubmitFinal: () => void;
  successMessage?: string;
  actionError?: string;
}

export const HackerSubmissionWorkspace: React.FC<HackerSubmissionWorkspaceProps> = ({
  submission,
  formState,
  onChangeForm,
  checklist,
  isSavingDraft,
  isSubmitting,
  onSaveDraft,
  onSubmitFinal,
  successMessage,
  actionError,
}) => {
  const isFinalized = submission?.status === 'SUBMITTED';

  return (
    <div className="space-y-6 text-left">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-[10px] bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051] text-xs font-mono flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Submission Finalized Lock Callout */}
      {isFinalized && (
        <div className="p-4 rounded-[10px] bg-[#E2EBDD] border border-[#B8CEB0] space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#028051] flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              Project Submission Finalized & Locked
            </span>
            <span className="text-[#6D7068]">
              Status: <strong className="text-[#028051]">SUBMITTED</strong>
            </span>
          </div>
          <p className="text-[11px] text-[#43463E] leading-relaxed">
            Your project has been recorded to the evaluation queue. The judging panel is now reviewing your repository and live demo.
          </p>
        </div>
      )}

      {/* Progress Checklist Barometer */}
      <div className="p-5 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCDDD3] pb-3">
          <div className="space-y-0.5">
            <h3 className="font-heading font-extrabold text-sm text-[#171914]">
              Submission Requirements Checklist
            </h3>
            <p className="text-xs font-mono text-[#6D7068]">
              {checklist.completedItems} of {checklist.totalItems} requirements satisfied
            </p>
          </div>

          <div className="text-right">
            <span className="text-sm font-heading font-extrabold text-[#028051] px-2.5 py-1 rounded bg-[#E2EBDD] border border-[#B8CEB0]">
              {isFinalized ? 100 : checklist.completionPercent}% Complete
            </span>
          </div>
        </div>

        {/* Checklist Item Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          {checklist.checks.map((chk) => (
            <div
              key={chk.id}
              className={`p-2.5 rounded-[6px] border flex items-center gap-2 ${
                chk.isComplete || isFinalized
                  ? 'bg-[#E2EBDD]/50 border-[#B8CEB0] text-[#028051]'
                  : 'bg-[#F7F4EA] border-[#DCDDD3] text-[#6D7068]'
              }`}
            >
              {chk.isComplete || isFinalized ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#028051]" />
              ) : (
                <CircleDot className="w-4 h-4 shrink-0 text-[#9A9C94]" />
              )}
              <span className="truncate font-bold">{chk.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Submission Form */}
      <div className="p-6 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-5">
        <h3 className="font-heading font-extrabold text-base text-[#171914] border-b border-[#DCDDD3] pb-3">
          Project Metadata & Artifacts
        </h3>

        <div className="space-y-4">
          {/* Project Title */}
          <div className="space-y-1.5 text-xs font-mono">
            <label htmlFor="sub-title" className="font-bold text-[#171914] block">
              Project Title *
            </label>
            <input
              id="sub-title"
              type="text"
              disabled={isFinalized}
              value={formState.title}
              onChange={(e) => onChangeForm({ title: e.target.value })}
              placeholder="e.g. ByteForge: Real-Time Decentralized State Sync"
              className="w-full px-3 py-2 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051] disabled:opacity-60"
            />
          </div>

          {/* Track Selector */}
          <div className="space-y-1.5 text-xs font-mono">
            <label htmlFor="sub-track" className="font-bold text-[#171914] block">
              Target Track / Challenge *
            </label>
            <select
              id="sub-track"
              disabled={isFinalized}
              value={formState.trackId}
              onChange={(e) => onChangeForm({ trackId: e.target.value })}
              className="w-full px-3 py-2 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] disabled:opacity-60 cursor-pointer"
            >
              <option value="">Select track...</option>
              <option value="trk_core_infra">Core Infrastructure & Scalability</option>
              <option value="trk_ai_safety">AI Safety & Formal Verification</option>
              <option value="trk_privacy">Privacy & Cryptography</option>
              <option value="trk_climate">Climate & Sustainability</option>
            </select>
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5 text-xs font-mono">
            <label htmlFor="sub-desc" className="font-bold text-[#171914] block">
              Project Architecture & Technical Description *
            </label>
            <textarea
              id="sub-desc"
              rows={5}
              disabled={isFinalized}
              value={formState.description}
              onChange={(e) => onChangeForm({ description: e.target.value })}
              placeholder="Describe your technical architecture, design decisions, challenges overcome, and technologies utilized..."
              className="w-full p-3 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051] disabled:opacity-60 leading-relaxed"
            />
          </div>

          {/* Demo URL & Presentation Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-xs font-mono">
              <label htmlFor="sub-demo" className="font-bold text-[#171914] block">
                Live Demo / Deployment URL *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6D7068]" />
                <input
                  id="sub-demo"
                  type="url"
                  disabled={isFinalized}
                  value={formState.demoUrl}
                  onChange={(e) => onChangeForm({ demoUrl: e.target.value })}
                  placeholder="https://my-app.vercel.app"
                  className="w-full pl-8 pr-3 py-2 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051] disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <label htmlFor="sub-video" className="font-bold text-[#171914] block">
                Pitch Video or Slide Deck
              </label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6D7068]" />
                <input
                  id="sub-video"
                  type="url"
                  disabled={isFinalized}
                  value={formState.videoUrl}
                  onChange={(e) => onChangeForm({ videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-8 pr-3 py-2 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051] disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="p-2.5 rounded-[6px] bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-mono flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Actions Bar */}
        {!isFinalized && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#DCDDD3]">
            <span className="text-xs font-mono text-[#6D7068]">
              {checklist.isReadyToSubmit
                ? 'All requirements satisfied. Ready to submit!'
                : 'Complete all required items to enable final submission.'}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onSaveDraft}
                isLoading={isSavingDraft}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                className="text-xs font-mono"
              >
                Save Draft
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={!checklist.isReadyToSubmit}
                onClick={onSubmitFinal}
                isLoading={isSubmitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="text-xs font-mono font-bold"
              >
                Submit Project
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

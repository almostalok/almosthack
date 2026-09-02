'use client';

import React from 'react';
import { Send, X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@almosthack/ui';
import {
  JudgeAssignmentEntity,
  JudgingCriterionEntity,
} from '@almosthack/types';
import { JudgeScoreState } from './judge-types';

export interface JudgeSubmitConfirmModalProps {
  isOpen: boolean;
  assignment: JudgeAssignmentEntity | null;
  criteria: JudgingCriterionEntity[];
  scoresMap: Record<string, JudgeScoreState>;
  calculatedTotalPercent: number;
  generalFeedback: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export const JudgeSubmitConfirmModal: React.FC<JudgeSubmitConfirmModalProps> = ({
  isOpen,
  assignment,
  criteria,
  scoresMap,
  calculatedTotalPercent,
  generalFeedback,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  if (!isOpen || !assignment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-dialog-title"
    >
      <div className="w-full max-w-lg bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-2xl p-6 text-left space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
          <div className="flex items-center gap-2 text-[#028051]">
            <ShieldCheck className="w-5 h-5" />
            <h3
              id="submit-dialog-title"
              className="font-heading font-extrabold text-base text-[#171914]"
            >
              Submit Final Evaluation
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6D7068] hover:text-[#171914] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project & Total Score Header */}
        <div className="p-3.5 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#6D7068] uppercase font-bold block">
              Project Evaluation
            </span>
            <div className="font-heading font-extrabold text-sm text-[#171914] truncate max-w-[240px]">
              {assignment.submission?.title}
            </div>
            <div className="text-[11px] font-mono text-[#6D7068]">
              Team: {assignment.submission?.team?.name}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-[#6D7068] uppercase font-bold block">
              Calibrated Total
            </span>
            <span className="text-xl font-heading font-extrabold text-[#028051]">
              {calculatedTotalPercent}%
            </span>
          </div>
        </div>

        {/* Breakdown of Criteria Scores */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#6D7068] uppercase block">
            Rubric Scores Summary
          </span>
          <div className="divide-y divide-[#DCDDD3]/70 rounded-[6px] border border-[#DCDDD3] bg-[#FFFDF8] text-xs font-mono">
            {criteria.map((c) => {
              const score = scoresMap[c.id]?.score ?? 0;
              const max = c.maxScore || 10;

              return (
                <div key={c.id} className="p-2.5 flex items-center justify-between">
                  <span className="text-[#171914] font-bold">{c.name}</span>
                  <span className="text-[#028051] font-bold">
                    {score} / {max}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback preview */}
        {generalFeedback && (
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#6D7068] uppercase block">
              General Feedback
            </span>
            <div className="p-2.5 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] text-xs font-body text-[#171914] max-h-24 overflow-y-auto">
              {generalFeedback}
            </div>
          </div>
        )}

        {/* Consequence Notice */}
        <div className="p-3 rounded-[6px] bg-[#FFF4DC] border border-[#F0D597] text-xs font-mono text-[#785A12] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Immutable Submission Notice:</strong> Once submitted, your scores and feedback will be recorded to the immutable ledger and used to compute official rankings.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono"
          >
            Review Again
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="text-xs font-mono font-bold"
          >
            Confirm & Finalize
          </Button>
        </div>
      </div>
    </div>
  );
};

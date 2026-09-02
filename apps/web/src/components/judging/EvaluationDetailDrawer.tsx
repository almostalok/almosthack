'use client';

import React from 'react';
import {
  X,
  FileCode2,
  Award,
  CheckCircle2,
  MessageSquare,
  Scale,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { EvaluationItem } from './judging-types';

export interface EvaluationDetailDrawerProps {
  evaluation: EvaluationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvaluationDetailDrawer: React.FC<EvaluationDetailDrawerProps> = ({
  evaluation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !evaluation) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#131413]/50 backdrop-blur-xs animate-in fade-in duration-150 text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eval-drawer-title"
    >
      <div className="w-full max-w-xl h-full bg-[#FFFDF8] border-l border-[#DCDDD3] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#DCDDD3] bg-[#F7F4EA] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-[8px] bg-[#E2EBDD] text-[#028051] font-mono font-bold text-base flex items-center justify-center shrink-0 border border-[#B8CEB0]">
              <Award className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <h3 id="eval-drawer-title" className="text-base font-heading font-extrabold text-[#171914] truncate">
                Evaluation Review
              </h3>
              <p className="text-xs text-[#6D7068] font-body truncate">
                {evaluation.projectTitle} · Judge: {evaluation.judgeName}
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
          {/* Total Score Banner */}
          <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#6D7068] block">
                Total Score Awarded
              </span>
              <span className="font-heading font-extrabold text-2xl text-[#028051]">
                {evaluation.totalScore}{' '}
                <span className="text-xs text-[#6D7068] font-normal">/ {evaluation.maxScore}</span>
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold bg-[#E2EBDD] text-[#274535] px-2.5 py-1 rounded border border-[#B8CEB0]">
              SUBMITTED
            </span>
          </div>

          {/* Section 1: Criterion Scores Breakdown */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase text-[#6D7068] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#028051]" />
              Rubric Criterion Scores
            </h4>

            <div className="space-y-2">
              {evaluation.criterionScores.map((crit, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-heading font-bold text-[#171914]">
                      {crit.criterionName} ({Math.round(crit.weight * 100)}% Weight)
                    </span>
                    <span className="font-bold text-[#028051]">
                      {crit.score} / {crit.maxScore}
                    </span>
                  </div>

                  {crit.comment && (
                    <p className="text-[11px] text-[#6D7068] font-body bg-[#F7F4EA] p-2 rounded">
                      &ldquo;{crit.comment}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: General Feedback Notes */}
          {evaluation.generalFeedback && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-mono font-bold uppercase text-[#6D7068] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />
                Qualitative Feedback
              </h4>
              <div className="p-3.5 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] text-xs leading-relaxed text-[#171914]">
                {evaluation.generalFeedback}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-[#DCDDD3] bg-[#F7F4EA] flex items-center justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono h-8"
          >
            Close Evaluation
          </Button>
        </div>
      </div>
    </div>
  );
};

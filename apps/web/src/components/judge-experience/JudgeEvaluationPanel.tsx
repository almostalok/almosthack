'use client';

import React from 'react';
import {
  Sliders,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import {
  JudgingCriterionEntity,
  JudgeAssignmentEntity,
} from '@almosthack/types';
import { JudgeScoreState } from './judge-types';

export interface JudgeEvaluationPanelProps {
  criteria: JudgingCriterionEntity[];
  scoresMap: Record<string, JudgeScoreState>;
  onScoreChange: (criterionId: string, score: number) => void;
  onCommentChange: (criterionId: string, comment: string) => void;
  generalFeedback: string;
  onGeneralFeedbackChange: (val: string) => void;
  calculatedTotalPercent: number;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  onSaveDraft: () => void;
  onSubmitEvaluation: () => void;
  isEvaluated: boolean;
  actionError?: string;
}

export const JudgeEvaluationPanel: React.FC<JudgeEvaluationPanelProps> = ({
  criteria,
  scoresMap,
  onScoreChange,
  onCommentChange,
  generalFeedback,
  onGeneralFeedbackChange,
  calculatedTotalPercent,
  isSubmitting,
  isSavingDraft,
  onSaveDraft,
  onSubmitEvaluation,
  isEvaluated,
  actionError,
}) => {
  return (
    <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-5 text-left sticky top-4">
      {/* Header with live score preview */}
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#028051]" />
          <h3 className="font-heading font-extrabold text-sm text-[#171914]">
            Evaluation Rubric
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#6D7068]">Score Preview:</span>
          <span className="text-base font-heading font-extrabold text-[#028051] px-2 py-0.5 rounded bg-[#E2EBDD] border border-[#B8CEB0]">
            {calculatedTotalPercent}%
          </span>
        </div>
      </div>

      {isEvaluated && (
        <div className="p-3 rounded-[6px] bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Evaluation submitted & finalized. Records are immutable.</span>
        </div>
      )}

      {/* Criteria Sliders */}
      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
        {criteria.map((c) => {
          const currentScore = scoresMap[c.id]?.score ?? 0;
          const currentComment = scoresMap[c.id]?.comment ?? '';
          const max = c.maxScore || 10;
          const weightPercent = Math.round((c.weight || 1.0) * 100);

          return (
            <div
              key={c.id}
              className="p-3.5 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-2.5 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-heading font-extrabold text-xs text-[#171914]">
                    {c.name}
                  </h4>
                  {c.description && (
                    <p className="text-[11px] font-body text-[#6D7068] mt-0.5">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="font-heading font-extrabold text-xs text-[#171914] block">
                    {currentScore} / {max}
                  </span>
                  <span className="text-[10px] font-mono text-[#6D7068] block">
                    Weight: {weightPercent}%
                  </span>
                </div>
              </div>

              {/* Slider Control */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={max}
                  step={0.5}
                  value={currentScore}
                  disabled={isEvaluated}
                  aria-valuemin={0}
                  aria-valuemax={max}
                  aria-valuenow={currentScore}
                  aria-valuetext={`${currentScore} out of ${max} for ${c.name}`}
                  onChange={(e) =>
                    onScoreChange(c.id, parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-[#DCDDD3] rounded-lg appearance-none cursor-pointer accent-[#028051] disabled:opacity-50"
                  aria-label={`Score for ${c.name}`}
                />
                <div className="flex justify-between text-[10px] font-mono text-[#6D7068]">
                  <span>0 (Inadequate)</span>
                  <span>{max / 2} (Proficient)</span>
                  <span>{max} (Exceptional)</span>
                </div>
              </div>

              {/* Criterion Specific Comment */}
              <input
                type="text"
                value={currentComment}
                disabled={isEvaluated}
                onChange={(e) => onCommentChange(c.id, e.target.value)}
                placeholder="Optional criterion note..."
                aria-label={`Optional notes for criterion ${c.name}`}
                className="w-full px-2.5 py-1.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[4px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051] disabled:opacity-50"
              />
            </div>
          );
        })}

        {/* General Feedback Textarea */}
        <div className="space-y-1.5 text-xs font-mono">
          <label
            htmlFor="judge-feedback"
            className="font-bold text-[#171914] block"
          >
            Constructive Feedback & Notes:
          </label>
          <textarea
            id="judge-feedback"
            rows={3}
            value={generalFeedback}
            disabled={isEvaluated}
            onChange={(e) => onGeneralFeedbackChange(e.target.value)}
            placeholder="Share feedback on technical choices, design polish, and suggestions for future iterations..."
            className="w-full p-2.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051] disabled:opacity-50"
          />
        </div>
      </div>

      {actionError && (
        <div className="p-2.5 rounded-[6px] bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-mono flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Action Buttons */}
      {!isEvaluated && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
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
            onClick={onSubmitEvaluation}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="text-xs font-mono font-bold"
          >
            Submit Final
          </Button>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { cn } from '@almosthack/utils';
import { ShieldCheck, Award } from 'lucide-react';

export interface RubricItem {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage
  maxScore: number;
}

export interface JudgingPanelProps {
  rubric: RubricItem[];
  scores: Record<string, number>;
  onScoreChange: (rubricId: string, score: number) => void;
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isCalibrated?: boolean;
  className?: string;
}

export const JudgingPanel: React.FC<JudgingPanelProps> = ({
  rubric,
  scores,
  onScoreChange,
  feedback,
  onFeedbackChange,
  onSubmit,
  isSubmitting = false,
  isCalibrated = true,
  className,
}) => {
  const totalScore = rubric.reduce((sum, item) => {
    const s = scores[item.id] || 0;
    return sum + (s * (item.weight / 100));
  }, 0);

  return (
    <Card variant="editorial" className={cn('flex flex-col gap-6 text-left font-body', className)}>
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-4">
        <div>
          <h3 className="text-lg font-bold font-heading text-[#171914] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#355C45]" /> Judge Evaluation Rubric
          </h3>
          <p className="text-xs text-[#6D7068] font-body mt-0.5">
            Calibrated scoring interface. Scores are cryptographically verifiable.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-[#6D7068] block">Weighted Total</span>
          <span className="text-2xl font-extrabold font-heading text-[#355C45]">
            {totalScore.toFixed(2)}
            <span className="text-xs font-mono text-[#6D7068] font-normal"> / 10.0</span>
          </span>
        </div>
      </div>

      {/* Rubric Criteria Sliders / Inputs */}
      <div className="flex flex-col gap-5">
        {rubric.map((item) => {
          const currentScore = scores[item.id] ?? 5;

          return (
            <div key={item.id} className="p-4 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[12px] flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold font-heading text-[#171914]">{item.name}</h4>
                    <span className="text-[10px] font-mono text-[#6D7068] px-1.5 py-0.5 rounded bg-[#FFFDF8] border border-[#DCDDD3]">
                      Weight: {item.weight}%
                    </span>
                  </div>
                  <p className="text-xs text-[#6D7068] font-body mt-0.5">{item.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-extrabold font-heading text-[#355C45]">
                    {currentScore.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-[#6D7068]"> / {item.maxScore}</span>
                </div>
              </div>

              {/* Slider Input */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={item.maxScore}
                  step="0.5"
                  value={currentScore}
                  onChange={(e) => onScoreChange(item.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#DCDDD3] rounded-lg appearance-none cursor-pointer accent-[#355C45]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Written Feedback */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono font-semibold uppercase text-[#6D7068]">
          Qualitative Evaluation & Feedback
        </label>
        <Textarea
          placeholder="Provide specific feedback, strengths, and areas for improvement..."
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          rows={4}
        />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#DCDDD3]">
        <span className="text-xs font-mono text-[#6D7068] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#355C45]" />
          {isCalibrated ? 'Zero-knowledge calibration active' : 'Standard consensus'}
        </span>
        <Button variant="primary" size="md" isLoading={isSubmitting} onClick={onSubmit}>
          Submit Calibrated Evaluation
        </Button>
      </div>
    </Card>
  );
};

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface StepItem {
  id: number;
  title: string;
  description: string;
}

export interface WizardStepIndicatorProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  maxCompletedStep: number;
}

export const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  maxCompletedStep,
}) => {
  return (
    <div className="w-full bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] p-3 sm:p-4 shadow-xs text-left">
      <nav aria-label="Creation Progress">
        <ol className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {steps.map((step, idx) => {
            const isCompleted = step.id < currentStep || step.id <= maxCompletedStep;
            const isCurrent = step.id === currentStep;
            const isClickable = step.id <= maxCompletedStep + 1;

            return (
              <li
                key={step.id}
                className={cn(
                  'flex items-center gap-2 shrink-0 py-1 px-2 rounded-[6px] transition-colors',
                  isClickable ? 'cursor-pointer hover:bg-[#F7F4EA]' : 'opacity-60 cursor-not-allowed'
                )}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all',
                    isCurrent
                      ? 'bg-[#028051] text-white ring-2 ring-[#028051]/30'
                      : isCompleted
                      ? 'bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]'
                      : 'bg-[#F0ECE1] text-[#6D7068] border border-[#DCDDD3]'
                  )}
                >
                  {isCompleted && !isCurrent ? <Check className="w-3.5 h-3.5" /> : step.id}
                </div>

                <div className="hidden md:block">
                  <span
                    className={cn(
                      'text-xs font-mono font-bold block leading-none',
                      isCurrent ? 'text-[#171914]' : 'text-[#6D7068]'
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-[#9A9C94] font-body block truncate max-w-[90px]">
                    {step.description}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block w-4 h-[1px] bg-[#DCDDD3] ml-1" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

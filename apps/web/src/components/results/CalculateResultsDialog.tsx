'use client';

import React from 'react';
import { Button } from '@almosthack/ui';
import { Calculator, X, CheckCircle2 } from 'lucide-react';

export interface CalculateResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCalculating: boolean;
}

export const CalculateResultsDialog: React.FC<CalculateResultsDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCalculating,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calc-dialog-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 id="calc-dialog-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Calculate Official Rankings
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Aggregate judge evaluations into normalized consensus scores.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6D7068] hover:text-[#171914] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#171914] leading-relaxed">
          This operation will process all completed judge evaluations, normalize criteria weights, compute weighted ranking totals, and generate provisional leaderboard standings.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isCalculating}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            isLoading={isCalculating}
            leftIcon={<Calculator className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Run Calculation
          </Button>
        </div>
      </div>
    </div>
  );
};

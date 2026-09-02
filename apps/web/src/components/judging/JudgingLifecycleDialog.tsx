'use client';

import React, { useState } from 'react';
import { Button } from '@almosthack/ui';
import { Play, Pause, Lock, X, AlertTriangle } from 'lucide-react';
import { JudgingLifecycleState } from './judging-types';

export interface JudgingLifecycleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: JudgingLifecycleState;
  onTransition: (newState: JudgingLifecycleState) => void;
}

export const JudgingLifecycleDialog: React.FC<JudgingLifecycleDialogProps> = ({
  isOpen,
  onClose,
  currentState,
  onTransition,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lifecycle-dialog-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div>
            <h3 id="lifecycle-dialog-title" className="text-sm font-heading font-extrabold text-[#171914]">
              Judging Phase Controls
            </h3>
            <p className="text-xs text-[#6D7068] font-body">
              Current state: <strong className="font-mono">{currentState}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6D7068] hover:text-[#171914] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs font-mono">
          {currentState !== 'OPEN' && (
            <button
              type="button"
              onClick={() => onTransition('OPEN')}
              className="w-full p-3 rounded-[8px] bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051] hover:bg-[#B8CEB0] transition-colors flex items-center justify-between font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                <span>Open / Resume Scoring Window</span>
              </div>
              <span className="text-[10px] uppercase">Set LIVE</span>
            </button>
          )}

          {currentState === 'OPEN' && (
            <button
              type="button"
              onClick={() => onTransition('PAUSED')}
              className="w-full p-3 rounded-[8px] bg-[#FFF4DC] border border-[#F0D597] text-[#785A12] hover:bg-[#F0D597] transition-colors flex items-center justify-between font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Pause className="w-4 h-4" />
                <span>Pause Scoring Window</span>
              </div>
              <span className="text-[10px] uppercase">Hold</span>
            </button>
          )}

          {currentState !== 'CLOSED' && (
            <button
              type="button"
              onClick={() => onTransition('CLOSED')}
              className="w-full p-3 rounded-[8px] bg-[#FBE6E3] border border-[#F3C9B2] text-[#8B2C24] hover:bg-[#F3C9B2] transition-colors flex items-center justify-between font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Close Judging Phase</span>
              </div>
              <span className="text-[10px] uppercase">Lock</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

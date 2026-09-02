'use client';

import React from 'react';
import { Button } from '@almosthack/ui';
import { Rocket, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export interface PublishHackathonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
  hackathonName: string;
  isReady: boolean;
  warnings?: string[];
}

export const PublishHackathonDialog: React.FC<PublishHackathonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPublishing,
  hackathonName,
  isReady,
  warnings = [],
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs animate-in fade-in duration-150 text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-lg w-full p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 id="publish-dialog-title" className="text-base font-heading font-extrabold text-[#171914]">
                Publish Hackathon?
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                State transition from DRAFT to PUBLISHED discovery mode.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-[#F7F4EA] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-3 text-xs font-body text-[#171914] bg-[#F7F4EA] p-4 rounded-[8px] border border-[#DCDDD3]">
          <p>
            You are about to publish <strong>{hackathonName}</strong>. Once published:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#6D7068] font-mono text-[11px]">
            <li>Builders can discover and register for this event.</li>
            <li>Configured tracks and challenge rubrics become publicly visible.</li>
            <li>Registration quotas and countdown timers start tracking live.</li>
          </ul>

          {warnings.length > 0 && (
            <div className="p-3 bg-[#FFF4DC] border border-[#F0D597] rounded-[6px] text-[#785A12] space-y-1">
              <div className="flex items-center gap-1.5 font-bold font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Notice before publishing:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] font-mono">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isPublishing}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={!isReady || isPublishing}
            isLoading={isPublishing}
            leftIcon={<Rocket className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Confirm & Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

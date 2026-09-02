'use client';

import React, { useState } from 'react';
import { Button } from '@almosthack/ui';
import { UserPlus, X, Shuffle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { JudgeItem, SubmissionJudgingItem } from './judging-types';

export interface AssignJudgesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  judges: JudgeItem[];
  submissions: SubmissionJudgingItem[];
  onAssign: (submissionId: string, judgeUserId: string) => void;
  onAutoAssign: () => void;
  isAssigning: boolean;
  isAutoAssigning: boolean;
}

export const AssignJudgesDialog: React.FC<AssignJudgesDialogProps> = ({
  isOpen,
  onClose,
  judges,
  submissions,
  onAssign,
  onAutoAssign,
  isAssigning,
  isAutoAssigning,
}) => {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(
    submissions[0]?.submissionId || submissions[0]?.id || ''
  );
  const [selectedJudgeId, setSelectedJudgeId] = useState(judges[0]?.id || '');
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');

  if (!isOpen) return null;

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubmissionId && selectedJudgeId) {
      onAssign(selectedSubmissionId, selectedJudgeId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-judge-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-lg w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 id="assign-judge-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Assign Judges to Projects
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Distribute judging workload evenly across calibrated reviewers.
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

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] text-xs font-mono">
          <button
            type="button"
            onClick={() => setMode('MANUAL')}
            className={`py-1.5 rounded-[6px] font-bold transition-all cursor-pointer ${
              mode === 'MANUAL'
                ? 'bg-[#FFFDF8] text-[#171914] shadow-xs'
                : 'text-[#6D7068] hover:text-[#171914]'
            }`}
          >
            Manual Assignment
          </button>
          <button
            type="button"
            onClick={() => setMode('AUTO')}
            className={`py-1.5 rounded-[6px] font-bold transition-all cursor-pointer ${
              mode === 'AUTO'
                ? 'bg-[#FFFDF8] text-[#171914] shadow-xs'
                : 'text-[#6D7068] hover:text-[#171914]'
            }`}
          >
            Auto-Distribute Load
          </button>
        </div>

        {mode === 'MANUAL' ? (
          <form onSubmit={handleManualAssign} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                Select Project Submission
              </label>
              <select
                value={selectedSubmissionId}
                onChange={(e) => setSelectedSubmissionId(e.target.value)}
                className="w-full bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] p-2 text-xs font-body text-[#171914] focus:outline-none focus:border-[#028051]"
              >
                {submissions.map((s) => (
                  <option key={s.id} value={s.submissionId || s.id}>
                    {s.projectTitle} (Team: {s.teamName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                Select Judge
              </label>
              <select
                value={selectedJudgeId}
                onChange={(e) => setSelectedJudgeId(e.target.value)}
                className="w-full bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] p-2 text-xs font-body text-[#171914] focus:outline-none focus:border-[#028051]"
              >
                {judges.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name} ({j.organization || 'Judge'}) — {j.assignedCount} currently assigned
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={onClose}
                disabled={isAssigning}
                className="text-xs font-mono h-8"
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isAssigning}
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
              >
                Assign Judge
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-[#E2EBDD]/50 border border-[#B8CEB0] rounded-[8px] space-y-1.5 font-mono text-[11px] text-[#274535]">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#028051]" />
                <span>Balanced Conflict-Free Allocation</span>
              </div>
              <p>
                Automatically allocates <strong>2 calibrated judges</strong> to each submitted project in the pool while respecting declared conflicts of interest.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={isAutoAssigning}
                className="text-xs font-mono h-8"
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={onAutoAssign}
                isLoading={isAutoAssigning}
                leftIcon={<Shuffle className="w-3.5 h-3.5" />}
                className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
              >
                Run Auto-Distribution
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

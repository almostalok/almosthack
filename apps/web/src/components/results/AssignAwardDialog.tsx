'use client';

import React, { useState } from 'react';
import { Button } from '@almosthack/ui';
import { Award, X, CheckCircle2 } from 'lucide-react';
import { AwardItem, ResultRankingItem } from './results-types';

export interface AssignAwardDialogProps {
  award: AwardItem | null;
  isOpen: boolean;
  onClose: () => void;
  rankings: ResultRankingItem[];
  onAssign: (awardId: string, submissionId: string) => void;
}

export const AssignAwardDialog: React.FC<AssignAwardDialogProps> = ({
  award,
  isOpen,
  onClose,
  rankings,
  onAssign,
}) => {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(
    rankings[0]?.submissionId || ''
  );

  if (!isOpen || !award) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubmissionId) {
      onAssign(award.id, selectedSubmissionId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="award-assign-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF4DC] text-[#785A12] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 id="award-assign-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Assign Award Recipient
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                {award.name} {award.prizeAmount ? `(${award.prizeAmount})` : ''}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
              Select Winning Project
            </label>
            <select
              value={selectedSubmissionId}
              onChange={(e) => setSelectedSubmissionId(e.target.value)}
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] p-2 text-xs font-body text-[#171914] focus:outline-none focus:border-[#028051]"
            >
              {rankings.map((r) => (
                <option key={r.submissionId} value={r.submissionId}>
                  #{r.rank} {r.projectTitle} (Team: {r.teamName} · {r.finalScore.toFixed(1)} pts)
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
              className="text-xs font-mono h-8"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              leftIcon={<Award className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
            >
              Confirm Award
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

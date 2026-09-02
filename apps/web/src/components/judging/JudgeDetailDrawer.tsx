'use client';

import React from 'react';
import {
  X,
  Users2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  FileCode2,
  Award,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { JudgeItem } from './judging-types';

export interface JudgeDetailDrawerProps {
  judge: JudgeItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JudgeDetailDrawer: React.FC<JudgeDetailDrawerProps> = ({
  judge,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !judge) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#131413]/50 backdrop-blur-xs animate-in fade-in duration-150 text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judge-drawer-title"
    >
      <div className="w-full max-w-xl h-full bg-[#FFFDF8] border-l border-[#DCDDD3] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#DCDDD3] bg-[#F7F4EA] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#E2EBDD] text-[#028051] font-mono font-bold text-base flex items-center justify-center shrink-0 border border-[#B8CEB0]">
              {judge.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 id="judge-drawer-title" className="text-base font-heading font-extrabold text-[#171914] truncate">
                {judge.name}
              </h3>
              <p className="text-xs text-[#6D7068] font-body truncate">
                {judge.title || 'Judge'} · {judge.organization || 'Reviewer'}
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
          {/* Section 1: Progress & Performance Banner */}
          <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-2.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#6D7068] uppercase text-[10px] font-bold">
                Assigned Evaluations: {judge.completedCount} / {judge.assignedCount}
              </span>
              <span className="font-heading font-extrabold text-[#028051]">
                {judge.completionRate}% Complete
              </span>
            </div>

            <div className="h-2.5 w-full bg-[#EAE7DC] rounded-full overflow-hidden">
              <div
                style={{ width: `${judge.completionRate}%` }}
                className="h-full bg-[#028051] rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#6D7068] pt-1">
              <span>Remaining: {judge.remainingCount} projects</span>
              {judge.averageScoreGiven !== undefined && (
                <span>Average score given: <strong>{judge.averageScoreGiven} / 100</strong></span>
              )}
            </div>
          </div>

          {/* Section 2: Calibration & Readiness */}
          <div className="p-3 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[8px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#028051]" />
              <div>
                <span className="font-heading font-bold text-xs text-[#171914] block">
                  Judge Calibration Status
                </span>
                <span className="text-[11px] text-[#6D7068] font-mono">
                  {judge.isCalibrated ? 'Benchmark test completed & calibrated' : 'Calibration benchmark pending'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#E2EBDD] text-[#274535] px-2 py-0.5 rounded border border-[#B8CEB0]">
              {judge.isCalibrated ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>

          {/* Section 3: Conflict Disclosures */}
          {judge.conflicts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono font-bold uppercase text-[#8B2C24] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
                Conflict of Interest Disclosures ({judge.conflicts.length})
              </h4>
              <div className="space-y-1.5">
                {judge.conflicts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[6px] bg-[#FBE6E3]/60 border border-[#F3C9B2] text-xs space-y-1"
                  >
                    <span className="font-bold text-[#8B2C24] block">{c.projectTitle}</span>
                    <p className="text-[11px] text-[#171914] font-mono">Reason: {c.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Contact & Account Info */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-mono font-bold uppercase text-[#6D7068]">
              Contact & System Identity
            </h4>
            <div className="p-3 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#6D7068]">Email:</span>
                <span className="text-[#171914]">{judge.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D7068]">User ID:</span>
                <span className="text-[#171914]">{judge.userId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-[#DCDDD3] bg-[#F7F4EA] flex items-center justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono h-8"
          >
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};

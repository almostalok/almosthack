'use client';

import React from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { AuditFieldDiff } from './audit-log-types';

export interface AuditLogDiffViewerProps {
  diffs?: AuditFieldDiff[];
}

export const AuditLogDiffViewer: React.FC<AuditLogDiffViewerProps> = ({ diffs }) => {
  if (!diffs || diffs.length === 0) {
    return (
      <div className="p-4 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] text-xs font-mono text-[#6D7068] text-left">
        No state field modifications recorded for this event.
      </div>
    );
  }

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="rounded-[8px] border border-[#DCDDD3] bg-[#FFFDF8] overflow-hidden text-left shadow-2xs">
      <div className="bg-[#F7F4EA] px-3.5 py-2 border-b border-[#DCDDD3] flex items-center justify-between font-mono text-[10px] font-bold text-[#6D7068] uppercase">
        <span>Modified Field</span>
        <div className="flex items-center gap-6">
          <span>Previous Value</span>
          <span>Updated Value</span>
        </div>
      </div>

      <div className="divide-y divide-[#DCDDD3]/70 font-mono text-xs">
        {diffs.map((d, idx) => {
          return (
            <div
              key={idx}
              className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center hover:bg-[#F7F4EA]/40 transition-colors"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-[#171914] block">
                  {d.label || d.field}
                </span>
                <span className="text-[10px] text-[#6D7068] block">{d.field}</span>
              </div>

              {/* Before */}
              <div className="p-2 rounded-[4px] bg-[#FEE2E2]/60 border border-[#FECACA] text-[#991B1B] text-[11px] flex items-center gap-1.5 overflow-x-auto">
                <Minus className="w-3 h-3 shrink-0" />
                <span className="truncate">{formatValue(d.before)}</span>
              </div>

              {/* After */}
              <div className="p-2 rounded-[4px] bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051] font-bold text-[11px] flex items-center gap-1.5 overflow-x-auto">
                <Plus className="w-3 h-3 shrink-0" />
                <span className="truncate">{formatValue(d.after)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

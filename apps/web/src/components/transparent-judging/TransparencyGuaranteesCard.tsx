'use client';

import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Scale } from 'lucide-react';

export const TransparencyGuaranteesCard: React.FC = () => {
  return (
    <div className="p-5 rounded-[12px] border border-[#DCDDD3] bg-[#F7F4EA] text-left space-y-3.5">
      <div className="flex items-center gap-2 border-b border-[#DCDDD3] pb-2.5">
        <ShieldCheck className="w-4 h-4 text-[#028051]" />
        <h3 className="text-xs font-heading font-extrabold text-[#171914] uppercase tracking-wider">
          AlmostHack Trust & Transparency Guarantees
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] space-y-1">
          <div className="flex items-center gap-1.5 font-bold font-heading text-[#171914]">
            <Scale className="w-3.5 h-3.5 text-[#028051]" />
            <span>Strict Weight Compliance</span>
          </div>
          <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">
            All scoring calculations mathematically adhere to the 100% normalized rubric configured prior to evaluation start.
          </p>
        </div>

        <div className="p-3 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] space-y-1">
          <div className="flex items-center gap-1.5 font-bold font-heading text-[#171914]">
            <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Double-Blind Reviewer Privacy</span>
          </div>
          <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">
            Evaluator identities remain masked to preserve objective grading and prevent bias or post-competition harassment.
          </p>
        </div>
      </div>
    </div>
  );
};

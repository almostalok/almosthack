'use client';

import React from 'react';
import { Card, Input } from '@almosthack/ui';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export interface StepParticipationData {
  eligibilityType: 'OPEN' | 'STUDENTS_ONLY' | 'INVITE_ONLY';
  allowedBranchesText: string;
  allowedCollegesText: string;
  graduationYearFrom: string;
  graduationYearTo: string;
}

export interface StepParticipationProps {
  data: StepParticipationData;
  onChange: (data: Partial<StepParticipationData>) => void;
  errors: Record<string, string>;
}

export const StepParticipation: React.FC<StepParticipationProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#171914]">
          Step 3: Eligibility & Participation Scope
        </h2>
        <p className="text-xs text-[#6D7068] font-body mt-0.5">
          Configure builder eligibility criteria, institutional whitelists, and academic boundaries.
        </p>
      </div>

      <div className="space-y-4">
        {/* Scope selector */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />
            Eligibility Policy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'OPEN',
                label: 'Open (Global)',
                desc: 'Anyone from anywhere may register and build.',
              },
              {
                id: 'STUDENTS_ONLY',
                label: 'Students Only',
                desc: 'Restricted to enrolled university/college students.',
              },
              {
                id: 'INVITE_ONLY',
                label: 'Invite Only',
                desc: 'Requires manual organizer verification or pass.',
              },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => onChange({ eligibilityType: opt.id as any })}
                className={`p-3.5 rounded-[8px] border cursor-pointer transition-all ${
                  data.eligibilityType === opt.id
                    ? 'bg-[#E2EBDD] border-[#028051] ring-1 ring-[#028051]'
                    : 'bg-[#FFFDF8] border-[#DCDDD3] hover:bg-[#F7F4EA]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-heading font-bold text-[#171914]">{opt.label}</span>
                  {data.eligibilityType === opt.id && (
                    <span className="w-2 h-2 rounded-full bg-[#028051]" />
                  )}
                </div>
                <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Academic restrictions */}
        {data.eligibilityType === 'STUDENTS_ONLY' && (
          <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-4 animate-in fade-in duration-150">
            <h3 className="text-xs font-mono font-bold uppercase text-[#171914] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#028051]" />
              Academic Filters (Optional Whitelists)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                  Allowed Branches / Majors <span className="text-[#6D7068] font-normal">(Comma-separated)</span>
                </label>
                <Input
                  placeholder="e.g. Computer Science, IT, Data Science"
                  value={data.allowedBranchesText}
                  onChange={(e) => onChange({ allowedBranchesText: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                  Allowed Institutions <span className="text-[#6D7068] font-normal">(Comma-separated)</span>
                </label>
                <Input
                  placeholder="e.g. IIT Bombay, MIT, Stanford, BITS"
                  value={data.allowedCollegesText}
                  onChange={(e) => onChange({ allowedCollegesText: e.target.value })}
                  className="w-full text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                  Graduation Year Range (From)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 2024"
                  value={data.graduationYearFrom}
                  onChange={(e) => onChange({ graduationYearFrom: e.target.value })}
                  className="w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                  Graduation Year Range (To)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 2028"
                  value={data.graduationYearTo}
                  onChange={(e) => onChange({ graduationYearTo: e.target.value })}
                  className="w-full text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

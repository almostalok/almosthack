'use client';

import React from 'react';
import { Card, Input } from '@almosthack/ui';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export interface ParticipationConfigData {
  eligibilityType: 'OPEN' | 'STUDENTS_ONLY' | 'INVITE_ONLY';
  allowedBranchesText: string;
  allowedCollegesText: string;
  graduationYearFrom: string;
  graduationYearTo: string;
}

export interface ConfigSectionParticipationProps {
  data: ParticipationConfigData;
  onChange: (data: Partial<ParticipationConfigData>) => void;
  isLocked?: boolean;
}

export const ConfigSectionParticipation: React.FC<ConfigSectionParticipationProps> = ({
  data,
  onChange,
  isLocked = false,
}) => {
  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <h2 className="text-base font-heading font-extrabold text-[#171914]">
          Participation Scope & Academic Whitelists
        </h2>
        <p className="text-xs text-[#6D7068] font-body mt-0.5">
          Configure builder eligibility requirements and institutional filters.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />
            Eligibility Scope
          </label>
          <select
            value={data.eligibilityType}
            onChange={(e) => onChange({ eligibilityType: e.target.value as any })}
            disabled={isLocked}
            className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] disabled:opacity-60"
          >
            <option value="OPEN">OPEN (Unrestricted Global Registration)</option>
            <option value="STUDENTS_ONLY">STUDENTS ONLY (Enrolled Students)</option>
            <option value="INVITE_ONLY">INVITE ONLY (Requires Manual Approval)</option>
          </select>
        </div>

        <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-[#171914] flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#028051]" />
            Institutional & Academic Filtering
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                Allowed Branches / Majors <span className="text-[#6D7068] font-normal">(Comma-separated)</span>
              </label>
              <Input
                placeholder="e.g. CSE, ECE, IT, AI"
                value={data.allowedBranchesText}
                onChange={(e) => onChange({ allowedBranchesText: e.target.value })}
                disabled={isLocked}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                Allowed Colleges / Universities <span className="text-[#6D7068] font-normal">(Comma-separated)</span>
              </label>
              <Input
                placeholder="e.g. IIT Delhi, BITS Pilani, MIT"
                value={data.allowedCollegesText}
                onChange={(e) => onChange({ allowedCollegesText: e.target.value })}
                disabled={isLocked}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                Graduation Year (From)
              </label>
              <Input
                type="number"
                placeholder="e.g. 2024"
                value={data.graduationYearFrom}
                onChange={(e) => onChange({ graduationYearFrom: e.target.value })}
                disabled={isLocked}
                className="w-full text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                Graduation Year (To)
              </label>
              <Input
                type="number"
                placeholder="e.g. 2028"
                value={data.graduationYearTo}
                onChange={(e) => onChange({ graduationYearTo: e.target.value })}
                disabled={isLocked}
                className="w-full text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

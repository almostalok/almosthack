'use client';

import React from 'react';
import { Card, Input } from '@almosthack/ui';
import { Users, User, Info } from 'lucide-react';

export interface StepTeamSettingsData {
  participationMode: 'BOTH' | 'TEAM' | 'INDIVIDUAL';
  minTeamSize: number;
  maxTeamSize: number;
}

export interface StepTeamSettingsProps {
  data: StepTeamSettingsData;
  onChange: (data: Partial<StepTeamSettingsData>) => void;
  errors: Record<string, string>;
}

export const StepTeamSettings: React.FC<StepTeamSettingsProps> = ({
  data,
  onChange,
  errors,
}) => {
  const getHumanReadableSummary = () => {
    if (data.participationMode === 'INDIVIDUAL') {
      return 'Solo participation only. Team formation is disabled for this hackathon.';
    }
    if (data.participationMode === 'TEAM') {
      if (data.minTeamSize === data.maxTeamSize) {
        return `Strict teams required: exactly ${data.minTeamSize} members per team.`;
      }
      return `Teams required: builders must form teams of ${data.minTeamSize} to ${data.maxTeamSize} members. Solo participation is prohibited.`;
    }
    return `Flexible participation: Solo builders allowed, or teams of up to ${data.maxTeamSize} members.`;
  };

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#171914]">
          Step 4: Team Formation & Sizing
        </h2>
        <p className="text-xs text-[#6D7068] font-body mt-0.5">
          Configure whether builders collaborate in squads or ship as individual solo hackers.
        </p>
      </div>

      <div className="space-y-4">
        {/* Participation Mode */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#028051]" />
            Participation Structure
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'BOTH',
                label: 'Individual & Teams (Both)',
                desc: 'Solo builders and formed squads both allowed.',
                icon: Users,
              },
              {
                id: 'TEAM',
                label: 'Teams Only (Required)',
                desc: 'Builders must form a team to submit projects.',
                icon: Users,
              },
              {
                id: 'INDIVIDUAL',
                label: 'Individual Only (Solo)',
                desc: 'No squads. Every builder works independently.',
                icon: User,
              },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.id}
                  onClick={() => onChange({ participationMode: opt.id as any })}
                  className={`p-3.5 rounded-[8px] border cursor-pointer transition-all ${
                    data.participationMode === opt.id
                      ? 'bg-[#E2EBDD] border-[#028051] ring-1 ring-[#028051]'
                      : 'bg-[#FFFDF8] border-[#DCDDD3] hover:bg-[#F7F4EA]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-heading font-bold text-[#171914] flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#028051]" />
                      {opt.label}
                    </span>
                    {data.participationMode === opt.id && (
                      <span className="w-2 h-2 rounded-full bg-[#028051]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">{opt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team sizing inputs */}
        {data.participationMode !== 'INDIVIDUAL' && (
          <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-[#171914]">
              Team Size Limits (Builders per Team)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                  Minimum Team Size <span className="text-[#8B2C24]">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={data.minTeamSize}
                  onChange={(e) => onChange({ minTeamSize: Math.max(1, Number(e.target.value)) })}
                  className="w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                  Maximum Team Size <span className="text-[#8B2C24]">*</span>
                </label>
                <Input
                  type="number"
                  min={data.minTeamSize}
                  max={50}
                  value={data.maxTeamSize}
                  onChange={(e) =>
                    onChange({
                      maxTeamSize: Math.max(data.minTeamSize, Number(e.target.value)),
                    })
                  }
                  className="w-full text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live human readable feedback banner */}
        <div className="p-3 bg-[#E2EBDD]/60 border border-[#B8CEB0] rounded-[8px] flex items-start gap-2 text-xs font-body text-[#274535]">
          <Info className="w-4 h-4 shrink-0 text-[#028051] mt-0.5" />
          <div>
            <strong className="font-heading font-bold">Rule Summary: </strong>
            <span>{getHumanReadableSummary()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

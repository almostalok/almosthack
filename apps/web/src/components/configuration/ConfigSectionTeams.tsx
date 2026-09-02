'use client';

import React from 'react';
import { Card, Input } from '@almosthack/ui';
import { Users, Info } from 'lucide-react';

export interface TeamsConfigData {
  participationMode: 'BOTH' | 'TEAM' | 'INDIVIDUAL';
  minTeamSize: number;
  maxTeamSize: number;
}

export interface ConfigSectionTeamsProps {
  data: TeamsConfigData;
  onChange: (data: Partial<TeamsConfigData>) => void;
  isLocked?: boolean;
}

export const ConfigSectionTeams: React.FC<ConfigSectionTeamsProps> = ({
  data,
  onChange,
  isLocked = false,
}) => {
  const getRuleSummary = () => {
    if (data.participationMode === 'INDIVIDUAL') {
      return 'Individual participation only. Team formation is disabled.';
    }
    if (data.participationMode === 'TEAM') {
      return `Teams required: builders must form teams of ${data.minTeamSize} to ${data.maxTeamSize} members.`;
    }
    return `Flexible: Solo hackers allowed, or squads of up to ${data.maxTeamSize} members.`;
  };

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <h2 className="text-base font-heading font-extrabold text-[#171914]">
          Team Formation & Sizing Boundaries
        </h2>
        <p className="text-xs text-[#6D7068] font-body mt-0.5">
          Configure squad limits, collaboration rules, and minimum team membership requirements.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#171914] mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#028051]" />
            Participation Structure
          </label>
          <select
            value={data.participationMode}
            onChange={(e) => onChange({ participationMode: e.target.value as any })}
            disabled={isLocked}
            className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051] disabled:opacity-60"
          >
            <option value="BOTH">INDIVIDUAL & TEAMS (Both Permitted)</option>
            <option value="TEAM">TEAMS ONLY (Squads Required)</option>
            <option value="INDIVIDUAL">INDIVIDUAL ONLY (Solo Hackers Only)</option>
          </select>
        </div>

        {data.participationMode !== 'INDIVIDUAL' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3]">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                Minimum Team Size
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={data.minTeamSize}
                onChange={(e) => onChange({ minTeamSize: Math.max(1, Number(e.target.value)) })}
                disabled={isLocked}
                className="w-full text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                Maximum Team Size
              </label>
              <Input
                type="number"
                min={data.minTeamSize}
                max={50}
                value={data.maxTeamSize}
                onChange={(e) =>
                  onChange({ maxTeamSize: Math.max(data.minTeamSize, Number(e.target.value)) })
                }
                disabled={isLocked}
                className="w-full text-xs font-mono"
              />
            </div>
          </div>
        )}

        <div className="p-3 bg-[#E2EBDD]/60 border border-[#B8CEB0] rounded-[8px] flex items-center gap-2 text-xs font-body text-[#274535]">
          <Info className="w-4 h-4 shrink-0 text-[#028051]" />
          <span>
            <strong>Summary: </strong>
            {getRuleSummary()}
          </span>
        </div>
      </div>
    </Card>
  );
};

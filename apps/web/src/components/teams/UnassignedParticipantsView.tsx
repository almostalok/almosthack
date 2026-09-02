'use client';

import React from 'react';
import { UserCheck, UserPlus, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { UnassignedParticipantItem } from './teams-types';

export interface UnassignedParticipantsViewProps {
  participants: UnassignedParticipantItem[];
  onAssignToTeam: (participant: UnassignedParticipantItem) => void;
}

export const UnassignedParticipantsView: React.FC<UnassignedParticipantsViewProps> = ({
  participants,
  onAssignToTeam,
}) => {
  if (participants.length === 0) {
    return (
      <div className="p-12 text-center bg-[#FFFDF8] rounded-[12px] border border-dashed border-[#DCDDD3] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-heading font-extrabold text-[#171914]">
            All Participants Assigned
          </h3>
          <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
            Every registered builder has successfully joined or formed a team squad!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Informative Banner */}
      <div className="p-3.5 bg-[#FFF4DC] border border-[#F0D597] rounded-[10px] text-xs font-mono text-[#785A12] flex items-center justify-between gap-3">
        <span>
          <strong>{participants.length} builders</strong> are currently unassigned. You can match them with existing teams or group them together.
        </span>
      </div>

      {/* Unassigned List */}
      <div className="overflow-hidden rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-[#171914]">
            <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-bold text-[#6D7068] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Institution & Branch</th>
                <th className="px-4 py-3">Preferred Track</th>
                <th className="px-4 py-3">Skills</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD3]/70">
              {participants.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[#F7F4EA]/70 transition-colors duration-100"
                >
                  {/* Participant */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EAE7DC] text-[#171914] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-heading font-bold text-[#171914] block truncate">
                          {p.name}
                        </span>
                        <span className="text-[11px] font-body text-[#6D7068] block truncate">
                          {p.email} · @{p.username}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* College & Branch */}
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#171914] block truncate">
                      {p.college}
                    </span>
                    <span className="text-[11px] text-[#6D7068] font-mono block truncate">
                      {p.branch}
                    </span>
                  </td>

                  {/* Track */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {p.trackName ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#171914]">
                        <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                        {p.trackName}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#9A9C94]">Flexible</span>
                    )}
                  </td>

                  {/* Skills */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {p.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.2 rounded bg-[#EAE7DC] text-[10px] font-mono text-[#171914]"
                        >
                          {skill}
                        </span>
                      ))}
                      {p.skills.length > 3 && (
                        <span className="text-[10px] font-mono text-[#6D7068]">
                          +{p.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onAssignToTeam(p)}
                      leftIcon={<UserPlus className="w-3.5 h-3.5 text-[#028051]" />}
                      className="text-xs font-mono h-7 px-2.5 border-[#B8CEB0] text-[#028051] hover:bg-[#E2EBDD]"
                    >
                      Assign to Team
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Award, Trophy, UserCheck, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { AwardItem } from './results-types';

export interface AwardsGridProps {
  awards: AwardItem[];
  onAssignAward: (award: AwardItem) => void;
  isLocked: boolean;
}

export const AwardsGrid: React.FC<AwardsGridProps> = ({
  awards,
  onAssignAward,
  isLocked,
}) => {
  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#028051]" />
          <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
            Configured Hackathon Awards ({awards.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#6D7068]">
          Special Category & Track Recognitions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {awards.map((award) => {
          const hasWinner = Boolean(award.winnerSubmissionId);

          return (
            <div
              key={award.id}
              className="p-4 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs flex flex-col justify-between gap-3 text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#F7F4EA] text-[#6D7068] border border-[#DCDDD3]">
                    {award.category} AWARD
                  </span>
                  {award.prizeAmount && (
                    <span className="font-mono font-bold text-[#D97706] text-xs">
                      {award.prizeAmount}
                    </span>
                  )}
                </div>

                <h4 className="font-heading font-bold text-sm text-[#171914]">
                  {award.name}
                </h4>

                <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">
                  {award.description}
                </p>
              </div>

              {/* Winner Assignment Box */}
              <div className="p-2.5 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#6D7068] block">
                  Assigned Recipient
                </span>
                {hasWinner ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-[#171914] truncate block">
                        {award.winnerProjectTitle}
                      </span>
                      <span className="text-[11px] font-mono text-[#028051] truncate block">
                        Team: {award.winnerTeamName}
                      </span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#028051] shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-[#D97706]">Unassigned</span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => onAssignAward(award)}
                        className="text-[11px] font-mono font-bold text-[#028051] hover:underline cursor-pointer"
                      >
                        Assign Winner
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

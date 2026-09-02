'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Award, Crown, Medal, ArrowRight, Layers, ShieldCheck } from 'lucide-react';
import { ResultRankingItem } from './results-types';

export interface ResultsMobileCardProps {
  ranking: ResultRankingItem;
  hackathonId: string;
}

export const ResultsMobileCard: React.FC<ResultsMobileCardProps> = ({
  ranking,
  hackathonId,
}) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-[#FFF4DC] border border-[#F0D597] text-[#785A12] font-mono font-bold text-xs flex items-center justify-center shrink-0">
          <Crown className="w-3.5 h-3.5 text-[#D97706]" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] font-mono font-bold text-xs flex items-center justify-center shrink-0">
          <Medal className="w-3.5 h-3.5 text-[#64748B]" />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-[#FFF4DC] border border-[#F0D597] text-[#785A12] font-mono font-bold text-xs flex items-center justify-center shrink-0">
          <Medal className="w-3.5 h-3.5 text-[#B45309]" />
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-[#F7F4EA] border border-[#DCDDD3] text-[#6D7068] font-mono font-bold text-xs flex items-center justify-center shrink-0">
        #{rank}
      </span>
    );
  };

  return (
    <div className="p-4 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-3">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {getRankBadge(ranking.rank)}
          <div className="min-w-0">
            <h4 className="text-xs font-heading font-bold text-[#171914] truncate">
              {ranking.projectTitle}
            </h4>
            <span className="text-[11px] font-body text-[#6D7068] block truncate">
              Team: {ranking.teamName} · {ranking.trackName}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0 font-mono">
          <span className="text-sm font-heading font-extrabold text-[#028051]">
            {ranking.finalScore.toFixed(1)}
          </span>
          <span className="text-[10px] text-[#6D7068] block">/ {ranking.maxScore}</span>
        </div>
      </div>

      {ranking.awards.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ranking.awards.map((a) => (
            <span
              key={a.id}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7F4EA] text-[#171914] border border-[#DCDDD3] flex items-center gap-1"
            >
              <Award className="w-3 h-3 text-[#D97706]" />
              <span className="truncate max-w-[180px]">{a.name}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-[#DCDDD3]/70 text-xs font-mono">
        <span className="text-[10px] text-[#028051] font-bold">
          {ranking.isFinalist ? 'Finalist' : 'Ranked Entry'}
        </span>

        <Link
          href={`/hackathons/${hackathonId}/results/${ranking.submissionId}`}
          className="text-xs font-bold text-[#028051] hover:underline flex items-center gap-1"
        >
          <span>Transparent Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

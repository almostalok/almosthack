'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Crown,
  Medal,
  ExternalLink,
  GitBranch,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ResultRankingItem } from './results-types';

export interface WinnersPodiumHeroProps {
  topWinners: ResultRankingItem[];
  hackathonId: string;
}

export const WinnersPodiumHero: React.FC<WinnersPodiumHeroProps> = ({
  topWinners,
  hackathonId,
}) => {
  const champion = topWinners.find((w) => w.rank === 1);
  const second = topWinners.find((w) => w.rank === 2);
  const third = topWinners.find((w) => w.rank === 3);

  if (!champion) return null;

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#D97706]" />
          <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
            Official Winner Podiums
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#6D7068]">
          Certified by Calibrated Evaluation Protocol
        </span>
      </div>

      {/* 1st Place Grand Champion Hero Card */}
      <div className="p-6 rounded-[12px] bg-[#FFFDF8] border-2 border-[#D97706]/40 shadow-xs space-y-4 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#FFF4DC]/40 rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#FFF4DC] border border-[#F0D597] text-[#785A12] text-xs font-mono font-bold">
                <Crown className="w-3.5 h-3.5 text-[#D97706]" />
                1ST PLACE — GRAND CHAMPION
              </span>
              <span className="text-[11px] font-mono text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#BFDBFE]">
                {champion.trackName}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#171914] tracking-tight">
              {champion.projectTitle}
            </h2>

            <p className="text-xs text-[#6D7068] font-body">
              Developed by <strong className="text-[#171914]">Team {champion.teamName}</strong>
            </p>
          </div>

          <div className="text-right shrink-0 font-mono">
            <span className="text-[10px] uppercase font-bold text-[#6D7068] block">
              Consensus Score
            </span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#028051]">
              {champion.finalScore.toFixed(1)}{' '}
              <span className="text-xs text-[#6D7068] font-normal">/ {champion.maxScore}</span>
            </div>
            {champion.awards[0]?.prizeAmount && (
              <span className="text-xs font-bold text-[#D97706] block">
                {champion.awards[0].prizeAmount}
              </span>
            )}
          </div>
        </div>

        {/* Awards list & Transparent Ledger Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#DCDDD3] relative z-10 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            {champion.awards.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F7F4EA] border border-[#DCDDD3] text-[11px] text-[#171914]"
              >
                <Award className="w-3 h-3 text-[#D97706]" />
                <span>{a.name}</span>
              </span>
            ))}
          </div>

          <Link
            href={`/hackathons/${hackathonId}/results/${champion.submissionId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#028051] hover:underline"
          >
            <span>View Transparent Score Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2nd & 3rd Place Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 2nd Place */}
        {second && (
          <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] text-[11px] font-mono font-bold">
                  <Medal className="w-3 h-3 text-[#64748B]" />
                  2ND PLACE — RUNNER UP
                </span>
                <h4 className="text-sm font-heading font-extrabold text-[#171914] truncate">
                  {second.projectTitle}
                </h4>
                <p className="text-[11px] text-[#6D7068] font-body truncate">
                  Team: {second.teamName} · {second.trackName}
                </p>
              </div>

              <div className="text-right shrink-0 font-mono">
                <div className="text-lg font-heading font-extrabold text-[#028051]">
                  {second.finalScore.toFixed(1)}
                </div>
                {second.awards[0]?.prizeAmount && (
                  <span className="text-[10px] text-[#6D7068] block">
                    {second.awards[0].prizeAmount}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#DCDDD3]/70 flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#6D7068] truncate max-w-[180px]">
                {second.awards.map((a) => a.name).join(', ')}
              </span>
              <Link
                href={`/hackathons/${hackathonId}/results/${second.submissionId}`}
                className="text-[#028051] hover:underline flex items-center gap-1 font-bold"
              >
                <span>Audit Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] border border-[#F0D597] text-[#785A12] text-[11px] font-mono font-bold">
                  <Medal className="w-3 h-3 text-[#B45309]" />
                  3RD PLACE
                </span>
                <h4 className="text-sm font-heading font-extrabold text-[#171914] truncate">
                  {third.projectTitle}
                </h4>
                <p className="text-[11px] text-[#6D7068] font-body truncate">
                  Team: {third.teamName} · {third.trackName}
                </p>
              </div>

              <div className="text-right shrink-0 font-mono">
                <div className="text-lg font-heading font-extrabold text-[#028051]">
                  {third.finalScore.toFixed(1)}
                </div>
                {third.awards[0]?.prizeAmount && (
                  <span className="text-[10px] text-[#6D7068] block">
                    {third.awards[0].prizeAmount}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#DCDDD3]/70 flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#6D7068] truncate max-w-[180px]">
                {third.awards.map((a) => a.name).join(', ')}
              </span>
              <Link
                href={`/hackathons/${hackathonId}/results/${third.submissionId}`}
                className="text-[#028051] hover:underline flex items-center gap-1 font-bold"
              >
                <span>Audit Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

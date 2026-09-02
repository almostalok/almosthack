'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Crown,
  Medal,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ResultRankingItem } from './results-types';
import { ResultsMobileCard } from './ResultsMobileCard';

export interface OfficialLeaderboardTableProps {
  rankings: ResultRankingItem[];
  hackathonId: string;
}

export const OfficialLeaderboardTable: React.FC<OfficialLeaderboardTableProps> = ({
  rankings,
  hackathonId,
}) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
          <Crown className="w-3 h-3 text-[#D97706]" />
          #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
          <Medal className="w-3 h-3 text-[#64748B]" />
          #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
          <Medal className="w-3 h-3 text-[#B45309]" />
          #3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#F7F4EA] text-[#6D7068] border border-[#DCDDD3]">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-3 text-left">
      {/* Mobile Cards (< md) */}
      <div className="md:hidden space-y-2.5">
        {rankings.map((r) => (
          <ResultsMobileCard
            key={r.id}
            ranking={r}
            hackathonId={hackathonId}
          />
        ))}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-[#171914]">
            <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-bold text-[#6D7068] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Project & Team</th>
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Consensus Score</th>
                <th className="px-4 py-3">Awards Won</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD3]/70">
              {rankings.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#F7F4EA]/70 transition-colors duration-100"
                >
                  {/* Rank */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getRankBadge(item.rank)}
                  </td>

                  {/* Project & Team */}
                  <td className="px-4 py-3.5">
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-[#171914] block truncate">
                        {item.projectTitle}
                      </span>
                      <span className="text-[11px] font-body text-[#6D7068] block truncate">
                        Team: {item.teamName}
                      </span>
                    </div>
                  </td>

                  {/* Track */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                    <span className="text-[11px] text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#BFDBFE]">
                      {item.trackName}
                    </span>
                  </td>

                  {/* Consensus Score */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                    <span className="font-heading font-extrabold text-sm text-[#028051]">
                      {item.finalScore.toFixed(1)}{' '}
                      <span className="text-[10px] text-[#6D7068] font-normal">/ {item.maxScore}</span>
                    </span>
                  </td>

                  {/* Awards */}
                  <td className="px-4 py-3.5">
                    {item.awards.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.awards.map((a) => (
                          <span
                            key={a.id}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FFF4DC] text-[#785A12] border border-[#F0D597] flex items-center gap-1"
                          >
                            <Award className="w-2.5 h-2.5 text-[#D97706]" />
                            <span className="truncate max-w-[120px]">{a.name}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-[#9A9C94]">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px]">
                    {item.isDisqualified ? (
                      <span className="text-[#8B2C24] bg-[#FBE6E3] px-1.5 py-0.5 rounded border border-[#F3C9B2] font-bold">
                        Disqualified
                      </span>
                    ) : item.awards.length > 0 ? (
                      <span className="text-[#028051] bg-[#E2EBDD] px-1.5 py-0.5 rounded border border-[#B8CEB0] font-bold">
                        Award Winner
                      </span>
                    ) : (
                      <span className="text-[#6D7068]">Ranked</span>
                    )}
                  </td>

                  {/* Audit Action */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <Link
                      href={`/hackathons/${hackathonId}/results/${item.submissionId}`}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#028051] hover:underline"
                    >
                      <span>Ledger</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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

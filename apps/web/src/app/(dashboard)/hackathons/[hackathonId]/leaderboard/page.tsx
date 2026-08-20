'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumbs, Button, Badge, Card, Skeleton } from '@almosthack/ui';
import {
  Trophy,
  Award,
  Crown,
  Medal,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  LeaderboardResponseDto,
  LeaderboardEntryEntity,
  HackathonEntity,
  HackathonTrackEntity,
} from '@almosthack/types';

export default function HackathonLeaderboardPage() {
  const params = useParams();
  const hackathonId = params.hackathonId as string;

  const [selectedTrackId, setSelectedTrackId] = React.useState<string>('ALL');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  // Fetch Hackathon
  const { data: hackathon } = useQuery<HackathonEntity>({
    queryKey: ['hackathon', hackathonId],
    queryFn: () => apiClient.getHackathon(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch Tracks
  const { data: tracks = [] } = useQuery<HackathonTrackEntity[]>({
    queryKey: ['hackathon-tracks', hackathonId],
    queryFn: () => apiClient.getHackathonTracks(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch Leaderboard
  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard,
  } = useQuery<LeaderboardResponseDto>({
    queryKey: ['hackathon-leaderboard', hackathonId, selectedTrackId],
    queryFn: () =>
      apiClient.getLeaderboard(
        hackathonId,
        selectedTrackId === 'ALL' ? undefined : { trackId: selectedTrackId }
      ),
    enabled: !!hackathonId,
  });

  const filteredEntries = React.useMemo(() => {
    if (!leaderboard?.entries) return [];
    if (!searchTerm.trim()) return leaderboard.entries;
    const term = searchTerm.toLowerCase();
    return leaderboard.entries.filter(
      (e) =>
        e.teamName.toLowerCase().includes(term) ||
        e.submissionTitle.toLowerCase().includes(term) ||
        (e.trackName && e.trackName.toLowerCase().includes(term))
    );
  }, [leaderboard?.entries, searchTerm]);

  const topThree = React.useMemo(() => {
    if (!leaderboard?.entries) return [];
    return leaderboard.entries.slice(0, 3);
  }, [leaderboard?.entries]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Navigation */}
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { label: 'Hackathons', href: '/hackathons' },
            { label: hackathon?.name || 'Hackathon', href: `/hackathons/${hackathonId}` },
            { label: 'Official Leaderboard' },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-400" />
              {hackathon?.name || 'Hackathon'} — Official Leaderboard
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Verified ranking projection derived from finalized judge evaluations and jury consensus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {leaderboard?.isPublished && (
              <Badge variant="success" size="md" className="font-mono text-xs">
                Official Results Published
              </Badge>
            )}
          </div>
        </div>
      </div>

      {isLoadingLeaderboard ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !leaderboard?.isPublished ? (
        /* Unpublished State Card */
        <Card className="p-12 text-center bg-zinc-950/40 border-zinc-800 space-y-4">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-6 h-6 text-amber-400/80" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-200 font-heading">
              Official Results Pending Publication
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto font-mono">
              Judges are currently reviewing submissions and evaluating integrity checks. The official leaderboard will be made available once results have been formally approved and published by the organizers.
            </p>
          </div>
          <div className="pt-2">
            <Link href={`/hackathons/${hackathonId}`}>
              <Button variant="outline" size="sm" className="font-mono text-xs">
                Return to Hackathon Overview
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Published Leaderboard Content */
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((entry, index) => {
                const isGold = index === 0;
                const isSilver = index === 1;
                const isBronze = index === 2;

                return (
                  <div
                    key={entry.submissionId}
                    className={`relative rounded-xl p-5 border transition-all ${
                      isGold
                        ? 'bg-gradient-to-b from-amber-950/30 via-zinc-900/60 to-zinc-950 border-amber-500/40 shadow-lg shadow-amber-950/20'
                        : isSilver
                        ? 'bg-gradient-to-b from-slate-800/30 via-zinc-900/60 to-zinc-950 border-slate-400/30'
                        : 'bg-gradient-to-b from-orange-950/20 via-zinc-900/60 to-zinc-950 border-orange-600/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isGold && <Crown className="w-5 h-5 text-amber-400" />}
                        {isSilver && <Medal className="w-5 h-5 text-slate-300" />}
                        {isBronze && <Medal className="w-5 h-5 text-orange-400" />}
                        <span className="text-xs font-mono font-bold uppercase text-zinc-300">
                          {isGold ? '1st Place Winner' : isSilver ? '2nd Place' : '3rd Place'}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                        {entry.score.toFixed(2)}%
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-100 font-heading truncate">
                      {entry.teamName}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5 line-clamp-1">
                      {entry.submissionTitle}
                    </p>

                    <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>{entry.trackName || 'General Track'}</span>
                      {entry.awardTitle && (
                        <span className="text-amber-400 font-medium">{entry.awardTitle}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filters & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedTrackId('ALL')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                  selectedTrackId === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Tracks
              </button>
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-colors ${
                    selectedTrackId === track.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {track.name}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search teams or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Full Leaderboard Table */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 w-16">Rank</th>
                    <th className="px-4 py-3">Team Name</th>
                    <th className="px-4 py-3">Project Title</th>
                    <th className="px-4 py-3">Track</th>
                    <th className="px-4 py-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.submissionId} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3 font-bold">
                        {entry.rank === 1 ? (
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <Trophy className="w-3.5 h-3.5" /> 1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <Medal className="w-3.5 h-3.5" /> 2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-flex items-center gap-1 text-orange-400">
                            <Medal className="w-3.5 h-3.5" /> 3
                          </span>
                        ) : (
                          `#${entry.rank}`
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-100">
                        <div className="flex items-center gap-2">
                          <span>{entry.teamName}</span>
                          {entry.isWinner && (
                            <Badge variant="accent" size="sm" className="text-[10px] py-0">
                              Winner
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{entry.submissionTitle}</td>
                      <td className="px-4 py-3 text-zinc-400">{entry.trackName || 'General Track'}</td>
                      <td className="px-4 py-3 text-right font-bold text-cyan-400 text-sm">
                        {entry.score.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        No teams match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

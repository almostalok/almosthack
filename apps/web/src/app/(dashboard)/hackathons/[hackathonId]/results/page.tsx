'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Badge, Card, Skeleton } from '@almosthack/ui';
import {
  Trophy,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Send,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Layers,
  History,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  ResultSetEntity,
  ResultEntryEntity,
  HackathonEntity,
  ResultSetStatus,
  ResultEligibilityStatus,
} from '@almosthack/types';

export default function HackathonResultsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;

  const [activeTab, setActiveTab] = React.useState<'current' | 'history'>('current');
  const [selectedEntry, setSelectedEntry] = React.useState<ResultEntryEntity | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = React.useState<boolean>(false);
  const [approvalNotes, setApprovalNotes] = React.useState<string>('');
  const [actionError, setActionError] = React.useState<string>('');

  // Fetch Hackathon
  const { data: hackathon } = useQuery<HackathonEntity>({
    queryKey: ['hackathon', hackathonId],
    queryFn: () => apiClient.getHackathon(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch Latest Result Set
  const {
    data: resultSet,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useQuery<ResultSetEntity>({
    queryKey: ['hackathon-results', hackathonId],
    queryFn: () => apiClient.getResults(hackathonId),
    enabled: !!hackathonId,
    retry: false,
  });

  // Fetch Historical Result Sets
  const { data: resultHistory = [], isLoading: isLoadingHistory } = useQuery<ResultSetEntity[]>({
    queryKey: ['hackathon-results-history', hackathonId],
    queryFn: () => apiClient.getResultHistory(hackathonId),
    enabled: !!hackathonId && activeTab === 'history',
  });

  // Calculate Results Mutation
  const calculateMutation = useMutation({
    mutationFn: () => apiClient.calculateResults(hackathonId),
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['hackathon-results', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-results-history', hackathonId] });
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to calculate results');
    },
  });

  // Approve Results Mutation
  const approveMutation = useMutation({
    mutationFn: () => apiClient.approveResults(hackathonId, { notes: approvalNotes }),
    onSuccess: () => {
      setActionError('');
      setApprovalModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon-results', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-results-history', hackathonId] });
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to approve results');
    },
  });

  // Publish Results Mutation
  const publishMutation = useMutation({
    mutationFn: () => apiClient.publishResults(hackathonId, { notifyParticipants: true }),
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['hackathon-results', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-results-history', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-leaderboard', hackathonId] });
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to publish results');
    },
  });

  const getStatusBadge = (status: ResultSetStatus) => {
    switch (status) {
      case ResultSetStatus.PUBLISHED:
        return <Badge variant="success">Published to Public</Badge>;
      case ResultSetStatus.APPROVED:
        return <Badge variant="accent">Approved (Ready to Publish)</Badge>;
      case ResultSetStatus.CALCULATED:
        return <Badge variant="warning">Calculated (Pending Review)</Badge>;
      case ResultSetStatus.UNDER_REVIEW:
        return <Badge variant="warning">Under Review</Badge>;
      case ResultSetStatus.SUPERSEDED:
        return <Badge variant="outline">Superseded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEligibilityBadge = (status: ResultEligibilityStatus) => {
    switch (status) {
      case ResultEligibilityStatus.ELIGIBLE:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
          </span>
        );
      case ResultEligibilityStatus.INELIGIBLE:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" /> Disqualified
          </span>
        );
      case ResultEligibilityStatus.PENDING_REVIEW:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      default:
        return <span className="text-xs font-mono text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Navigation */}
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { label: 'Hackathons', href: '/hackathons' },
            { label: hackathon?.name || 'Hackathon', href: `/hackathons/${hackathonId}` },
            { label: 'Results & Rankings' },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-400" />
              Results, Rankings & Completion
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Authoritative multi-judge score aggregation, deterministic ranking, and official leaderboard publication.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/hackathons/${hackathonId}/leaderboard`}>
              <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                <Eye className="w-3.5 h-3.5" /> Public Leaderboard
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 font-mono text-xs"
              onClick={() => calculateMutation.mutate()}
              isLoading={calculateMutation.isPending}
            >
              <RefreshCw className="w-3.5 h-3.5" /> {resultSet ? 'Recalculate Results' : 'Calculate Results'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {actionError && (
        <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg flex items-center gap-2 text-xs text-red-200">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-2.5 px-3 text-xs font-mono transition-colors ${
            activeTab === 'current'
              ? 'border-b-2 border-cyan-400 text-cyan-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Active Result Set
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-3 text-xs font-mono transition-colors ${
            activeTab === 'history'
              ? 'border-b-2 border-cyan-400 text-cyan-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Calculation History
        </button>
      </div>

      {activeTab === 'current' ? (
        isLoadingResults ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !resultSet ? (
          <Card className="p-12 text-center bg-zinc-950/40 border-zinc-800">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-500">
              <Trophy className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1 font-heading">No Results Calculated Yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
              When judging evaluations and integrity reviews are completed, calculate the official results snapshot.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="gap-2 font-mono text-xs"
              onClick={() => calculateMutation.mutate()}
              isLoading={calculateMutation.isPending}
            >
              <RefreshCw className="w-4 h-4" /> Calculate Results Snapshot
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Snapshot Metadata Banner */}
            <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-zinc-100 font-heading">
                    Result Snapshot v{resultSet.calculationVersion}
                  </span>
                  {getStatusBadge(resultSet.status)}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                  <span>Calculated: {new Date(resultSet.calculatedAt).toLocaleString()}</span>
                  {resultSet.approvedAt && (
                    <span className="text-cyan-400">Approved: {new Date(resultSet.approvedAt).toLocaleString()}</span>
                  )}
                  {resultSet.publishedAt && (
                    <span className="text-emerald-400">Published: {new Date(resultSet.publishedAt).toLocaleString()}</span>
                  )}
                  <span className="text-zinc-500 text-[10px] truncate max-w-[200px]" title={resultSet.inputFingerprint}>
                    SHA-256: {resultSet.inputFingerprint.substring(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {resultSet.status === ResultSetStatus.CALCULATED && (
                  <Button
                    variant="accent"
                    size="sm"
                    className="gap-1.5 font-mono text-xs"
                    onClick={() => setApprovalModalOpen(true)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Results
                  </Button>
                )}

                {resultSet.status === ResultSetStatus.APPROVED && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5 font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => publishMutation.mutate()}
                    isLoading={publishMutation.isPending}
                  >
                    <Send className="w-3.5 h-3.5" /> Publish Official Leaderboard
                  </Button>
                )}

                {resultSet.status === ResultSetStatus.PUBLISHED && (
                  <Link href={`/hackathons/${hackathonId}/leaderboard`}>
                    <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs text-emerald-400 border-emerald-800/60">
                      <ExternalLink className="w-3.5 h-3.5" /> View Live Leaderboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold font-mono uppercase text-zinc-300">
                  Ranked Entries ({resultSet.entries?.length || 0})
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Tie-Break Rule: {resultSet.tieBreakRule}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-2.5 w-16">Rank</th>
                      <th className="px-4 py-2.5">Team & Submission</th>
                      <th className="px-4 py-2.5">Track</th>
                      <th className="px-4 py-2.5 text-right">Score</th>
                      <th className="px-4 py-2.5 text-center">Judges</th>
                      <th className="px-4 py-2.5">Eligibility</th>
                      <th className="px-4 py-2.5 text-right">Breakdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                    {resultSet.entries?.map((entry) => (
                      <tr key={entry.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-4 py-3 font-bold">
                          {entry.rank === 1 ? (
                            <span className="inline-flex items-center gap-1 text-amber-400">
                              <Trophy className="w-3.5 h-3.5" /> 1
                            </span>
                          ) : (
                            `#${entry.rank}`
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-zinc-100 flex items-center gap-2">
                            {entry.teamName}
                            {entry.isWinner && (
                              <Badge variant="accent" size="sm" className="text-[10px] py-0">
                                {entry.awardTitle || 'Winner'}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400">{entry.submissionTitle}</div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {entry.trackName || 'General Track'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-cyan-400 text-sm">
                          {entry.score.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-center text-zinc-400">
                          {entry.judgeCount}
                        </td>
                        <td className="px-4 py-3">
                          {getEligibilityBadge(entry.eligibilityStatus)}
                          {entry.eligibilityReason && (
                            <div className="text-[10px] text-red-400/80 mt-0.5 truncate max-w-[180px]" title={entry.eligibilityReason}>
                              {entry.eligibilityReason}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs font-mono"
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <BarChart3 className="w-3 h-3 text-zinc-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : (
        /* History Tab */
        <div className="space-y-4">
          {isLoadingHistory ? (
            <Skeleton className="h-48 w-full" />
          ) : resultHistory.length === 0 ? (
            <Card className="p-8 text-center bg-zinc-950/40 border-zinc-800 text-xs text-zinc-400">
              No historical result sets found.
            </Card>
          ) : (
            <div className="space-y-3">
              {resultHistory.map((hist) => (
                <div
                  key={hist.id}
                  className="bg-zinc-900/40 border border-zinc-800/80 rounded-lg p-4 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-200">Version {hist.calculationVersion}</span>
                      {getStatusBadge(hist.status)}
                    </div>
                    <div className="text-zinc-500 text-[11px]">
                      Calculated: {new Date(hist.calculatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-zinc-400 text-xs">
                    {hist.entries?.length || 0} Entries
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      {approvalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 font-heading">
              Approve Hackathon Results
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Approving these results confirms that judging scores and integrity reviews have been verified. Once approved, the results can be published to the public leaderboard.
            </p>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Approval Notes / Jury Summary (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="e.g. Consensus reached on final scores and ties resolved."
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setApprovalModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => approveMutation.mutate()}
                isLoading={approveMutation.isPending}
              >
                Confirm Approval
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 font-heading">
                  Score Breakdown: {selectedEntry.teamName}
                </h3>
                <p className="text-xs font-mono text-zinc-400">{selectedEntry.submissionTitle}</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-zinc-500 hover:text-zinc-300">
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Final Weighted Percentage:</span>
                <span className="font-bold text-cyan-400">{selectedEntry.score.toFixed(4)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Independent Judges:</span>
                <span className="text-zinc-200">{selectedEntry.judgeCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Eligibility Status:</span>
                <span>{getEligibilityBadge(selectedEntry.eligibilityStatus)}</span>
              </div>

              {selectedEntry.scoreBreakdown?.criteria && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Criterion Averages
                  </span>
                  <div className="space-y-1.5">
                    {selectedEntry.scoreBreakdown.criteria.map((crit) => (
                      <div key={crit.criterionId} className="flex justify-between bg-zinc-950/60 p-2 rounded border border-zinc-800/60">
                        <span className="text-zinc-300">{crit.criterionName} (Weight: {crit.weight})</span>
                        <span className="text-zinc-100 font-bold">
                          {crit.averageScore.toFixed(2)} / {crit.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedEntry(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

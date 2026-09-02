'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  AwardItem,
  ResultRankingItem,
  ResultsReadinessSummary,
  ResultsFilterState,
  ResultsLifecycleStatus,
} from './results-types';
import {
  MOCK_AWARDS,
  MOCK_RANKINGS,
  MOCK_READINESS_SUMMARY,
} from './results-mock-data';
import { HackathonTrackEntity } from '@almosthack/types';

export interface UseResultsOptions {
  hackathonId: string;
  initialFilters?: Partial<ResultsFilterState>;
}

export function useResults({ hackathonId, initialFilters }: UseResultsOptions) {
  const queryClient = useQueryClient();

  // Local state for interactive preview
  const [lifecycleStatus, setLifecycleStatus] = useState<ResultsLifecycleStatus>('PUBLISHED');
  const [localRankings, setLocalRankings] = useState<ResultRankingItem[]>(MOCK_RANKINGS);
  const [localAwards, setLocalAwards] = useState<AwardItem[]>(MOCK_AWARDS);

  // Filters State
  const [filters, setFilters] = useState<ResultsFilterState>({
    tab: initialFilters?.tab || 'LEADERBOARD',
    trackId: initialFilters?.trackId || 'ALL',
    search: initialFilters?.search || '',
    statusFilter: initialFilters?.statusFilter || 'ALL',
    page: initialFilters?.page || 1,
    pageSize: initialFilters?.pageSize || 10,
  });

  // Modal Dialog States
  const [isCalculateOpen, setIsCalculateOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [selectedAwardForAssignment, setSelectedAwardForAssignment] = useState<AwardItem | null>(null);

  // Fetch Tracks
  const { data: tracks = [] } = useQuery<HackathonTrackEntity[]>({
    queryKey: ['hackathon-tracks', hackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getHackathonTracks(hackathonId);
        return Array.isArray(res) ? res : [];
      } catch {
        return [
          { id: 'trk_systems', name: 'Open Innovation / Systems', description: 'Systems track' } as any,
          { id: 'trk_ai', name: 'AI Safety & Intelligent Workflows', description: 'AI track' } as any,
        ];
      }
    },
    enabled: Boolean(hackathonId),
  });

  // Fetch Results from API
  const { data: resultsData, isLoading: isLoadingResults } = useQuery({
    queryKey: ['hackathon-results', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getResults(hackathonId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(hackathonId),
  });

  // Filtered Rankings
  const filteredRankings = useMemo(() => {
    return localRankings.filter((item) => {
      // Search filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesTitle = item.projectTitle.toLowerCase().includes(q);
        const matchesTeam = item.teamName.toLowerCase().includes(q);
        const matchesTrack = item.trackName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTeam && !matchesTrack) return false;
      }

      // Track filter
      if (filters.trackId !== 'ALL' && item.trackId !== filters.trackId) {
        return false;
      }

      // Status filter
      if (filters.statusFilter === 'WINNER' && item.awards.length === 0) return false;
      if (filters.statusFilter === 'FINALIST' && !item.isFinalist) return false;
      if (filters.statusFilter === 'DISQUALIFIED' && !item.isDisqualified) return false;

      return true;
    });
  }, [localRankings, filters]);

  // Top 3 Podium Winners
  const topWinners = useMemo(() => {
    return localRankings.filter((r) => r.rank <= 3 && !r.isDisqualified);
  }, [localRankings]);

  // Readiness Summary
  const readiness: ResultsReadinessSummary = useMemo(() => {
    return MOCK_READINESS_SUMMARY;
  }, []);

  // Update Filters
  const updateFilters = useCallback((updates: Partial<ResultsFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      page: updates.page !== undefined ? updates.page : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      tab: 'LEADERBOARD',
      trackId: 'ALL',
      search: '',
      statusFilter: 'ALL',
      page: 1,
      pageSize: 10,
    });
  }, []);

  // Mutation: Calculate Results
  const calculateMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiClient.calculateResults(hackathonId);
      } catch {
        // Local fallback
      }
      setLifecycleStatus('READY_FOR_APPROVAL');
      return { success: true };
    },
    onSuccess: () => {
      setIsCalculateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon-results', hackathonId] });
    },
  });

  // Mutation: Approve Results
  const approveMutation = useMutation({
    mutationFn: async (notes?: string) => {
      try {
        await apiClient.approveResults(hackathonId, { notes });
      } catch {
        // Local fallback
      }
      setLifecycleStatus('APPROVED');
      return { success: true };
    },
    onSuccess: () => {
      setIsApproveOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon-results', hackathonId] });
    },
  });

  // Mutation: Publish Results
  const publishMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiClient.publishResults(hackathonId);
      } catch {
        // Local fallback
      }
      setLifecycleStatus('PUBLISHED');
      return { success: true };
    },
    onSuccess: () => {
      setIsPublishOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon-results', hackathonId] });
    },
  });

  // Mutation: Assign Winner to Award
  const assignAwardWinner = useCallback(
    (awardId: string, submissionId: string) => {
      const submission = localRankings.find((r) => r.submissionId === submissionId);
      if (!submission) return;

      const award = localAwards.find((a) => a.id === awardId);
      if (!award) return;

      // Update Awards
      setLocalAwards((prev) =>
        prev.map((a) =>
          a.id === awardId
            ? {
                ...a,
                winnerSubmissionId: submission.submissionId,
                winnerProjectTitle: submission.projectTitle,
                winnerTeamName: submission.teamName,
              }
            : a
        )
      );

      // Update Rankings
      setLocalRankings((prev) =>
        prev.map((r) => {
          if (r.submissionId === submissionId) {
            const hasAward = r.awards.some((aw) => aw.id === awardId);
            if (hasAward) return r;
            return {
              ...r,
              awards: [...r.awards, award],
            };
          }
          return r;
        })
      );

      setSelectedAwardForAssignment(null);
    },
    [localRankings, localAwards]
  );

  // CSV Export
  const exportCsv = useCallback(() => {
    const headers = ['Rank', 'Project Title', 'Team', 'Track', 'Score', 'Awards', 'Status'];
    const rows = filteredRankings.map((r) => [
      `#${r.rank}`,
      `"${r.projectTitle.replace(/"/g, '""')}"`,
      `"${r.teamName.replace(/"/g, '""')}"`,
      `"${r.trackName}"`,
      `${r.finalScore.toFixed(1)} / ${r.maxScore}`,
      `"${r.awards.map((a) => a.name).join(', ')}"`,
      r.isDisqualified ? 'Disqualified' : r.awards.length > 0 ? 'Winner' : 'Finalist',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hackathon-${hackathonId}-official-results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredRankings, hackathonId]);

  return {
    lifecycleStatus,
    setLifecycleStatus,
    rankings: filteredRankings,
    allRankings: localRankings,
    topWinners,
    awards: localAwards,
    readiness,
    tracks,
    filters,
    updateFilters,
    resetFilters,
    // Modals
    isCalculateOpen,
    setIsCalculateOpen,
    isApproveOpen,
    setIsApproveOpen,
    isPublishOpen,
    setIsPublishOpen,
    selectedAwardForAssignment,
    setSelectedAwardForAssignment,
    // Actions
    calculateResults: () => calculateMutation.mutate(),
    isCalculating: calculateMutation.isPending,
    approveResults: (notes?: string) => approveMutation.mutate(notes),
    isApproving: approveMutation.isPending,
    publishResults: () => publishMutation.mutate(),
    isPublishing: publishMutation.isPending,
    assignAwardWinner,
    exportCsv,
    isLoading: isLoadingResults,
  };
}

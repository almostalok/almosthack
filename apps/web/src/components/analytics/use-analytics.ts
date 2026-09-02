'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  AnalyticsFilterState,
  AnalyticsTimeframe,
  RegistrationTrendPoint,
  RegistrationFunnelStage,
  TeamFormationDistribution,
  SubmissionVelocityPoint,
  TrackAnalyticsItem,
  JudgingWorkloadItem,
  EventHealthItem,
  OperationalInsightItem,
} from './analytics-types';
import {
  MOCK_REGISTRATION_GROWTH,
  MOCK_REGISTRATION_FUNNEL,
  MOCK_TEAM_SIZE_DISTRIBUTION,
  MOCK_SUBMISSION_VELOCITY,
  MOCK_TRACK_ANALYTICS,
  MOCK_JUDGE_WORKLOAD,
  MOCK_EVENT_HEALTH,
  MOCK_OPERATIONAL_INSIGHTS,
} from './analytics-mock-data';
import { HackathonTrackEntity } from '@almosthack/types';

export interface UseAnalyticsOptions {
  hackathonId: string;
  initialFilters?: Partial<AnalyticsFilterState>;
}

export function useAnalytics({
  hackathonId,
  initialFilters,
}: UseAnalyticsOptions) {
  const [filters, setFilters] = useState<AnalyticsFilterState>({
    timeframe: initialFilters?.timeframe || 'EVENT',
    trackId: initialFilters?.trackId || 'ALL',
    activeSection: initialFilters?.activeSection || 'ALL',
    viewMode: initialFilters?.viewMode || 'CHARTS',
  });

  // Fetch Tracks
  const { data: tracks = [] } = useQuery<HackathonTrackEntity[]>({
    queryKey: ['hackathon-tracks', hackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getHackathonTracks(hackathonId);
        return Array.isArray(res) ? res : [];
      } catch {
        return [
          { id: 'trk_systems', name: 'Open Innovation / Systems' } as any,
          { id: 'trk_ai', name: 'AI Safety & Intelligent Workflows' } as any,
          { id: 'trk_fintech', name: 'DeFi & Programmable Payments' } as any,
        ];
      }
    },
    enabled: Boolean(hackathonId),
  });

  // Filtered registration points based on timeframe
  const registrationGrowth: RegistrationTrendPoint[] = useMemo(() => {
    if (filters.timeframe === '7D') {
      return MOCK_REGISTRATION_GROWTH.slice(-7);
    }
    return MOCK_REGISTRATION_GROWTH;
  }, [filters.timeframe]);

  // Track Analytics Filtered
  const trackAnalytics: TrackAnalyticsItem[] = useMemo(() => {
    if (filters.trackId !== 'ALL') {
      return MOCK_TRACK_ANALYTICS.filter((t) => t.trackId === filters.trackId);
    }
    return MOCK_TRACK_ANALYTICS;
  }, [filters.trackId]);

  const updateFilters = useCallback((updates: Partial<AnalyticsFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      timeframe: 'EVENT',
      trackId: 'ALL',
      activeSection: 'ALL',
      viewMode: 'CHARTS',
    });
  }, []);

  // CSV Export
  const exportCsv = useCallback(() => {
    const lines = [
      'AlmostHack Hackathon Operational Analytics Report',
      `Hackathon ID: ${hackathonId}`,
      `Export Timestamp: ${new Date().toISOString()}`,
      '',
      '--- REGISTRATION FUNNEL ---',
      'Stage,Count,Percentage,Dropoff',
      ...MOCK_REGISTRATION_FUNNEL.map(
        (f) => `"${f.stage}",${f.count},${f.percentage}%,${f.dropoffPercentage}%`
      ),
      '',
      '--- TRACK COMPARISON ---',
      'Track,Teams,Submissions,Completion Rate,Average Score',
      ...MOCK_TRACK_ANALYTICS.map(
        (t) =>
          `"${t.trackName}",${t.teamsCount},${t.submissionsCount},${t.completionRate}%,${t.averageScore}`
      ),
      '',
      '--- JUDGE WORKLOAD ---',
      'Judge Name,Role,Assigned,Completed,Completion %,Avg Score',
      ...MOCK_JUDGE_WORKLOAD.map(
        (j) =>
          `"${j.judgeName}","${j.judgeRole}",${j.assignedCount},${j.completedCount},${j.completionPercentage}%,${j.avgScoreGiven}`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-${hackathonId}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [hackathonId]);

  return {
    filters,
    updateFilters,
    resetFilters,
    tracks,
    registrationGrowth,
    registrationFunnel: MOCK_REGISTRATION_FUNNEL,
    teamSizeDistribution: MOCK_TEAM_SIZE_DISTRIBUTION,
    submissionVelocity: MOCK_SUBMISSION_VELOCITY,
    trackAnalytics,
    judgeWorkload: MOCK_JUDGE_WORKLOAD,
    eventHealth: MOCK_EVENT_HEALTH,
    operationalInsights: MOCK_OPERATIONAL_INSIGHTS,
    exportCsv,
  };
}

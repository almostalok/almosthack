'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  TransparentSubmissionData,
  TransparentJudgingFilterState,
} from './transparent-judging-types';
import { MOCK_TRANSPARENT_SUBMISSIONS } from './transparent-judging-mock-data';

export interface UseTransparentJudgingOptions {
  hackathonId: string;
  initialSubmissionId?: string;
  initialViewMode?: 'PARTICIPANT' | 'ORGANIZER_AUDIT';
}

export function useTransparentJudging({
  hackathonId,
  initialSubmissionId = 'sub_forgezk',
  initialViewMode = 'PARTICIPANT',
}: UseTransparentJudgingOptions) {
  const [viewMode, setViewMode] = useState<'PARTICIPANT' | 'ORGANIZER_AUDIT'>(
    initialViewMode
  );
  const [activeSubmissionId, setActiveSubmissionId] = useState<string>(
    initialSubmissionId || 'sub_forgezk'
  );

  // Fetch all available transparent submissions
  const allSubmissions = useMemo(() => {
    return Object.values(MOCK_TRANSPARENT_SUBMISSIONS);
  }, []);

  // Fetch active submission evaluation data
  const { data: submissionData = MOCK_TRANSPARENT_SUBMISSIONS[activeSubmissionId] || MOCK_TRANSPARENT_SUBMISSIONS['sub_forgezk'], isLoading } =
    useQuery<TransparentSubmissionData>({
      queryKey: ['transparent-judging-submission', hackathonId, activeSubmissionId],
      queryFn: async () => {
        try {
          // Attempt to query real endpoint if available
          const res = await apiClient.getSubmissionDetail(activeSubmissionId);
          if (res && res.id) {
            return (
              MOCK_TRANSPARENT_SUBMISSIONS[activeSubmissionId] ||
              MOCK_TRANSPARENT_SUBMISSIONS['sub_forgezk']
            );
          }
          return (
            MOCK_TRANSPARENT_SUBMISSIONS[activeSubmissionId] ||
            MOCK_TRANSPARENT_SUBMISSIONS['sub_forgezk']
          );
        } catch {
          return (
            MOCK_TRANSPARENT_SUBMISSIONS[activeSubmissionId] ||
            MOCK_TRANSPARENT_SUBMISSIONS['sub_forgezk']
          );
        }
      },
      enabled: Boolean(activeSubmissionId),
    });

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'PARTICIPANT' ? 'ORGANIZER_AUDIT' : 'PARTICIPANT'));
  }, []);

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isParticipantPreview: viewMode === 'PARTICIPANT',
    activeSubmissionId,
    setActiveSubmissionId,
    allSubmissions,
    submission: submissionData,
    isLoading,
  };
}

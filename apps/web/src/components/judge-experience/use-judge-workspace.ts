'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  JudgeAssignmentEntity,
  JudgingCriterionEntity,
} from '@almosthack/types';
import {
  JudgeAssignmentStatus,
  JudgeFilterState,
  JudgeMetrics,
  JudgeScoreState,
} from './judge-types';
import {
  MOCK_JUDGE_ASSIGNMENTS,
  MOCK_JUDGING_CRITERIA,
} from './judge-mock-data';

export interface UseJudgeWorkspaceOptions {
  hackathonId?: string;
  initialAssignmentId?: string;
}

export function useJudgeWorkspace({
  hackathonId,
  initialAssignmentId,
}: UseJudgeWorkspaceOptions = {}) {
  const queryClient = useQueryClient();

  const [activeAssignmentId, setActiveAssignmentId] = useState<string>(
    initialAssignmentId || ''
  );
  const [filters, setFilters] = useState<JudgeFilterState>({
    search: '',
    status: 'ALL',
    trackId: 'ALL',
    sortBy: 'assignedAt',
  });

  // Active evaluation form state
  const [generalFeedback, setGeneralFeedback] = useState<string>('');
  const [scoresMap, setScoresMap] = useState<Record<string, JudgeScoreState>>({});
  const [isConflictModalOpen, setIsConflictModalOpen] = useState<boolean>(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>('');

  // Fetch Judge Assignments
  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useQuery<JudgeAssignmentEntity[]>({
    queryKey: ['judge-assignments'],
    queryFn: async () => {
      try {
        const res = await apiClient.getJudgeAssignments();
        if (Array.isArray(res) && res.length > 0) {
          return res;
        }
        return MOCK_JUDGE_ASSIGNMENTS;
      } catch {
        return MOCK_JUDGE_ASSIGNMENTS;
      }
    },
  });

  // Effective Hackathon ID
  const effectiveHackathonId =
    hackathonId || assignments[0]?.hackathonId || 'htf-2026';

  // Fetch Criteria
  const { data: criteria = [] } = useQuery<JudgingCriterionEntity[]>({
    queryKey: ['judging-criteria', effectiveHackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getJudgingCriteria(effectiveHackathonId);
        if (Array.isArray(res) && res.length > 0) {
          return res;
        }
        return MOCK_JUDGING_CRITERIA;
      } catch {
        return MOCK_JUDGING_CRITERIA;
      }
    },
    enabled: !!effectiveHackathonId,
  });

  // Active assignment
  const activeAssignment = useMemo(() => {
    if (activeAssignmentId) {
      const found = assignments.find((a) => a.id === activeAssignmentId);
      if (found) return found;
    }
    return assignments[0] || null;
  }, [assignments, activeAssignmentId]);

  // Sync form state when active assignment changes
  useEffect(() => {
    if (activeAssignment?.evaluation) {
      setGeneralFeedback(activeAssignment.evaluation.generalFeedback || '');
      const map: Record<string, JudgeScoreState> = {};
      activeAssignment.evaluation.scores?.forEach((s) => {
        map[s.criterionId] = { score: s.score, comment: s.comment || '' };
      });
      setScoresMap(map);
    } else {
      setGeneralFeedback('');
      // Initialize with default 0s
      const initialMap: Record<string, JudgeScoreState> = {};
      criteria.forEach((c) => {
        initialMap[c.id] = { score: 0, comment: '' };
      });
      setScoresMap(initialMap);
    }
    setActionError('');
  }, [activeAssignment?.id, criteria]);

  // Filtered & Sorted Assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        // Status filter
        if (filters.status !== 'ALL') {
          if (filters.status === 'ASSIGNED' && a.status !== 'ASSIGNED') return false;
          if (filters.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS')
            return false;
          if (filters.status === 'COMPLETED' && a.status !== 'COMPLETED')
            return false;
          if (filters.status === 'REVOKED' && a.status !== 'REVOKED') return false;
        }

        // Track filter
        if (
          filters.trackId !== 'ALL' &&
          a.submission?.trackId !== filters.trackId
        ) {
          return false;
        }

        // Search text
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchesTitle =
            a.submission?.title?.toLowerCase().includes(q) ?? false;
          const matchesTeam =
            a.submission?.team?.name?.toLowerCase().includes(q) ?? false;
          const matchesTrack =
            a.submission?.track?.name?.toLowerCase().includes(q) ?? false;

          if (!matchesTitle && !matchesTeam && !matchesTrack) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'title') {
          return (a.submission?.title || '').localeCompare(
            b.submission?.title || ''
          );
        }
        if (filters.sortBy === 'status') {
          return a.status.localeCompare(b.status);
        }
        return (
          new Date(b.assignedAt || 0).getTime() -
          new Date(a.assignedAt || 0).getTime()
        );
      });
  }, [assignments, filters]);

  // Calculate Metrics
  const metrics: JudgeMetrics = useMemo(() => {
    const totalAssigned = assignments.length;
    const completed = assignments.filter((a) => a.status === 'COMPLETED').length;
    const inProgress = assignments.filter(
      (a) => a.status === 'IN_PROGRESS'
    ).length;
    const conflicts = assignments.filter((a) => a.status === 'REVOKED').length;
    const progressPercent =
      totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

    return {
      totalAssigned,
      inProgress,
      completed,
      conflicts,
      progressPercent,
    };
  }, [assignments]);

  // Handle Score Input
  const handleScoreChange = useCallback((criterionId: string, score: number) => {
    setScoresMap((prev) => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score },
    }));
  }, []);

  const handleCommentChange = useCallback(
    (criterionId: string, comment: string) => {
      setScoresMap((prev) => ({
        ...prev,
        [criterionId]: { ...prev[criterionId], comment },
      }));
    },
    []
  );

  // Live Score Calculation Preview
  const calculatedTotalPercent = useMemo(() => {
    if (!criteria.length) return 0;
    let totalWeightedScore = 0;
    let totalWeight = 0;

    criteria.forEach((c) => {
      const currentScore = scoresMap[c.id]?.score ?? 0;
      const weight = c.weight || 1.0;
      const max = c.maxScore || 10.0;
      const normalizedPercent = (currentScore / max) * 100;
      totalWeightedScore += normalizedPercent * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  }, [criteria, scoresMap]);

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!activeAssignment) return;
      const scoresPayload = criteria.map((c) => ({
        criterionId: c.id,
        score: scoresMap[c.id]?.score ?? 0,
        comment: scoresMap[c.id]?.comment || null,
      }));
      return apiClient.saveEvaluationDraft(activeAssignment.id, {
        generalFeedback,
        scores: scoresPayload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judge-assignments'] });
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to save evaluation draft');
    },
  });

  // Submit Final Evaluation Mutation
  const submitEvaluationMutation = useMutation({
    mutationFn: async () => {
      if (!activeAssignment) return;
      const scoresPayload = criteria.map((c) => ({
        criterionId: c.id,
        score: scoresMap[c.id]?.score ?? 0,
        comment: scoresMap[c.id]?.comment || null,
      }));
      return apiClient.submitEvaluation(activeAssignment.id, {
        generalFeedback,
        scores: scoresPayload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judge-assignments'] });
      setIsSubmitConfirmOpen(false);
      setActionError('');

      // Auto advance to next pending assignment
      const nextPending = assignments.find(
        (a) => a.id !== activeAssignment?.id && a.status !== 'COMPLETED'
      );
      if (nextPending) {
        setActiveAssignmentId(nextPending.id);
      }
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to submit final evaluation');
    },
  });

  // Declare Conflict of Interest Mutation
  const declareConflictMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!activeAssignment) return;
      // In a production backend, this re-assigns or marks conflict
      return { success: true, reason };
    },
    onSuccess: () => {
      setIsConflictModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['judge-assignments'] });
      // Move to next pending
      const nextPending = assignments.find(
        (a) => a.id !== activeAssignment?.id && a.status !== 'COMPLETED'
      );
      if (nextPending) {
        setActiveAssignmentId(nextPending.id);
      }
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to declare conflict of interest');
    },
  });

  return {
    assignments,
    filteredAssignments,
    activeAssignment,
    setActiveAssignmentId,
    criteria,
    metrics,
    filters,
    setFilters,
    scoresMap,
    generalFeedback,
    setGeneralFeedback,
    handleScoreChange,
    handleCommentChange,
    calculatedTotalPercent,
    // Modals
    isConflictModalOpen,
    setIsConflictModalOpen,
    isSubmitConfirmOpen,
    setIsSubmitConfirmOpen,
    actionError,
    // Mutations
    saveDraftMutation,
    submitEvaluationMutation,
    declareConflictMutation,
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
  };
}

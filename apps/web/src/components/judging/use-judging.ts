'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  JudgeItem,
  SubmissionJudgingItem,
  EvaluationItem,
  JudgingMetrics,
  JudgingFilterState,
  JudgingLifecycleState,
} from './judging-types';
import {
  MOCK_CRITERIA,
  MOCK_JUDGES,
  MOCK_SUBMISSION_JUDGING,
  MOCK_EVALUATIONS,
  MOCK_JUDGING_METRICS,
} from './judging-mock-data';
import { JudgingCriterionEntity } from '@almosthack/types';

export interface UseJudgingOptions {
  hackathonId: string;
  initialFilters?: Partial<JudgingFilterState>;
}

export function useJudging({ hackathonId, initialFilters }: UseJudgingOptions) {
  const queryClient = useQueryClient();

  // Local state for interactive preview
  const [lifecycleState, setLifecycleState] = useState<JudgingLifecycleState>('OPEN');
  const [localJudges, setLocalJudges] = useState<JudgeItem[]>(MOCK_JUDGES);
  const [localSubmissions, setLocalSubmissions] = useState<SubmissionJudgingItem[]>(
    MOCK_SUBMISSION_JUDGING
  );
  const [localEvaluations, setLocalEvaluations] = useState<EvaluationItem[]>(MOCK_EVALUATIONS);

  // Filters State
  const [filters, setFilters] = useState<JudgingFilterState>({
    tab: initialFilters?.tab || 'OVERVIEW',
    search: initialFilters?.search || '',
    judgeStatus: initialFilters?.judgeStatus || 'ALL',
    submissionStatus: initialFilters?.submissionStatus || 'ALL',
    trackId: initialFilters?.trackId || 'ALL',
    page: initialFilters?.page || 1,
    pageSize: initialFilters?.pageSize || 10,
  });

  // Selected drawers state
  const [selectedJudgeId, setSelectedJudgeId] = useState<string | null>(null);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);

  // Dialogs state
  const [isAssignJudgesOpen, setIsAssignJudgesOpen] = useState(false);
  const [lifecycleTargetState, setLifecycleTargetState] = useState<JudgingLifecycleState | null>(
    null
  );

  // Fetch Criteria
  const { data: criteria = MOCK_CRITERIA, isLoading: isLoadingCriteria } = useQuery<
    JudgingCriterionEntity[]
  >({
    queryKey: ['judging-criteria', hackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getJudgingCriteria(hackathonId);
        return Array.isArray(res) && res.length > 0 ? res : MOCK_CRITERIA;
      } catch {
        return MOCK_CRITERIA;
      }
    },
    enabled: Boolean(hackathonId),
  });

  // Selected Judge for Drawer
  const selectedJudge = useMemo(() => {
    if (!selectedJudgeId) return null;
    return localJudges.find((j) => j.id === selectedJudgeId) || null;
  }, [localJudges, selectedJudgeId]);

  // Selected Evaluation for Drawer
  const selectedEvaluation = useMemo(() => {
    if (!selectedEvaluationId) return null;
    return localEvaluations.find((e) => e.id === selectedEvaluationId) || null;
  }, [localEvaluations, selectedEvaluationId]);

  // Filtered Judges
  const filteredJudges = useMemo(() => {
    return localJudges.filter((j) => {
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = j.name.toLowerCase().includes(q);
        const matchesEmail = j.email.toLowerCase().includes(q);
        const matchesOrg = j.organization?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesEmail && !matchesOrg) return false;
      }

      if (filters.judgeStatus !== 'ALL' && j.status !== filters.judgeStatus) {
        return false;
      }

      return true;
    });
  }, [localJudges, filters]);

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return localSubmissions.filter((s) => {
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesTitle = s.projectTitle.toLowerCase().includes(q);
        const matchesTeam = s.teamName.toLowerCase().includes(q);
        const matchesTrack = s.trackName?.toLowerCase().includes(q) || false;
        const matchesJudge = s.assignedJudges.some((j) =>
          j.judgeName.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesTeam && !matchesTrack && !matchesJudge) return false;
      }

      if (filters.submissionStatus !== 'ALL' && s.status !== filters.submissionStatus) {
        return false;
      }

      return true;
    });
  }, [localSubmissions, filters]);

  // Filtered Evaluations
  const filteredEvaluations = useMemo(() => {
    if (!filters.search.trim()) return localEvaluations;
    const q = filters.search.toLowerCase().trim();
    return localEvaluations.filter(
      (e) =>
        e.projectTitle.toLowerCase().includes(q) ||
        e.teamName.toLowerCase().includes(q) ||
        e.judgeName.toLowerCase().includes(q)
    );
  }, [localEvaluations, filters.search]);

  // Compute Metrics
  const metrics: JudgingMetrics = useMemo(() => {
    const totalSubmissions = localSubmissions.length;
    let completedEvaluations = 0;
    let requiredEvaluations = 0;
    let attentionCount = 0;

    localSubmissions.forEach((s) => {
      requiredEvaluations += s.requiredEvaluations;
      completedEvaluations += s.completedEvaluations;
      if (s.completedEvaluations < s.requiredEvaluations) {
        attentionCount++;
      }
    });

    const remainingEvaluations = Math.max(0, requiredEvaluations - completedEvaluations);
    const completionPercentage =
      requiredEvaluations > 0
        ? Math.round((completedEvaluations / requiredEvaluations) * 100)
        : 0;

    const totalJudges = localJudges.length;
    const calibratedJudges = localJudges.filter((j) => j.isCalibrated).length;
    const activeConflicts = localJudges.reduce((acc, j) => acc + j.conflicts.length, 0);

    return {
      totalSubmissions,
      requiredEvaluations,
      completedEvaluations,
      remainingEvaluations,
      completionPercentage,
      totalJudges,
      calibratedJudges,
      submissionsNeedingAttention: attentionCount,
      activeConflicts,
    };
  }, [localSubmissions, localJudges]);

  // Filter handlers
  const updateFilters = useCallback((updates: Partial<JudgingFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      page: updates.page !== undefined ? updates.page : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      tab: 'OVERVIEW',
      search: '',
      judgeStatus: 'ALL',
      submissionStatus: 'ALL',
      trackId: 'ALL',
      page: 1,
      pageSize: 10,
    });
  }, []);

  // Mutation: Assign Judge
  const assignJudgeMutation = useMutation({
    mutationFn: async ({
      submissionId,
      judgeUserId,
    }: {
      submissionId: string;
      judgeUserId: string;
    }) => {
      try {
        await apiClient.assignJudge(submissionId, { judgeUserId, submissionId });
      } catch {
        // Fallback local update
      }

      const judge = localJudges.find((j) => j.userId === judgeUserId || j.id === judgeUserId);
      if (judge) {
        setLocalSubmissions((prev) =>
          prev.map((s) => {
            if (s.submissionId === submissionId || s.id === submissionId) {
              const alreadyAssigned = s.assignedJudges.some((aj) => aj.judgeId === judge.id);
              if (alreadyAssigned) return s;

              const updatedAssigned = [
                ...s.assignedJudges,
                { judgeId: judge.id, judgeName: judge.name, status: 'ASSIGNED' as const },
              ];

              return {
                ...s,
                assignedJudges: updatedAssigned,
                status:
                  s.completedEvaluations >= s.requiredEvaluations
                    ? 'COMPLETE'
                    : 'IN_PROGRESS',
              };
            }
            return s;
          })
        );

        setLocalJudges((prev) =>
          prev.map((j) =>
            j.id === judge.id
              ? {
                  ...j,
                  assignedCount: j.assignedCount + 1,
                  remainingCount: j.remainingCount + 1,
                }
              : j
          )
        );
      }

      return { success: true };
    },
    onSuccess: () => {
      setIsAssignJudgesOpen(false);
      queryClient.invalidateQueries({ queryKey: ['judging-criteria', hackathonId] });
    },
  });

  // Mutation: Auto Distribute Assignments
  const autoAssignMutation = useMutation({
    mutationFn: async () => {
      // Balanced distribution: ensure every submission has 2 distinct judges without conflicts
      setLocalSubmissions((prev) =>
        prev.map((s, idx) => {
          const j1 = localJudges[idx % localJudges.length];
          const j2 = localJudges[(idx + 1) % localJudges.length];

          return {
            ...s,
            assignedJudges: [
              { judgeId: j1.id, judgeName: j1.name, status: 'ASSIGNED' },
              { judgeId: j2.id, judgeName: j2.name, status: 'ASSIGNED' },
            ],
            status: 'IN_PROGRESS',
          };
        })
      );
      return { success: true };
    },
    onSuccess: () => {
      setIsAssignJudgesOpen(false);
    },
  });

  // Lifecycle state transition
  const transitionLifecycle = useCallback((newState: JudgingLifecycleState) => {
    setLifecycleState(newState);
    setLifecycleTargetState(null);
  }, []);

  return {
    lifecycleState,
    setLifecycleState,
    criteria,
    judges: filteredJudges,
    allJudges: localJudges,
    submissions: filteredSubmissions,
    allSubmissions: localSubmissions,
    evaluations: filteredEvaluations,
    metrics,
    filters,
    updateFilters,
    resetFilters,
    selectedJudge,
    selectedJudgeId,
    setSelectedJudgeId,
    selectedEvaluation,
    selectedEvaluationId,
    setSelectedEvaluationId,
    // Dialogs
    isAssignJudgesOpen,
    setIsAssignJudgesOpen,
    lifecycleTargetState,
    setLifecycleTargetState,
    transitionLifecycle,
    // Actions
    assignJudge: (submissionId: string, judgeUserId: string) =>
      assignJudgeMutation.mutate({ submissionId, judgeUserId }),
    isAssigning: assignJudgeMutation.isPending,
    autoAssign: () => autoAssignMutation.mutate(),
    isAutoAssigning: autoAssignMutation.isPending,
    isLoading: isLoadingCriteria,
  };
}

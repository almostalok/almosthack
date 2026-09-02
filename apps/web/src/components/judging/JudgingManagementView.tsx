'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Button, Breadcrumbs } from '@almosthack/ui';
import {
  Award,
  ArrowLeft,
  RotateCw,
  Sliders,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useJudging } from './use-judging';
import { JudgingProgressBar } from './JudgingProgressBar';
import { JudgingSummaryMetrics } from './JudgingSummaryMetrics';
import { JudgingToolbar } from './JudgingToolbar';
import { JudgesTable } from './JudgesTable';
import { SubmissionJudgingTable } from './SubmissionJudgingTable';
import { EvaluationsTable } from './EvaluationsTable';
import { JudgeDetailDrawer } from './JudgeDetailDrawer';
import { EvaluationDetailDrawer } from './EvaluationDetailDrawer';
import { AssignJudgesDialog } from './AssignJudgesDialog';
import { JudgingLifecycleDialog } from './JudgingLifecycleDialog';

export interface JudgingManagementViewProps {
  hackathonId: string;
}

export const JudgingManagementView: React.FC<JudgingManagementViewProps> = ({
  hackathonId,
}) => {
  const router = useRouter();

  // Fetch hackathon identity
  const { data: hackathon } = useQuery({
    queryKey: ['hackathon', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathon(hackathonId);
      } catch {
        return {
          id: hackathonId,
          name: 'Hack The Future 2026',
          slug: 'hack-the-future-2026',
          status: 'PUBLISHED',
        };
      }
    },
  });

  const {
    lifecycleState,
    criteria,
    judges,
    allJudges,
    submissions,
    allSubmissions,
    evaluations,
    metrics,
    filters,
    updateFilters,
    resetFilters,
    selectedJudge,
    setSelectedJudgeId,
    selectedEvaluation,
    setSelectedEvaluationId,
    isAssignJudgesOpen,
    setIsAssignJudgesOpen,
    lifecycleTargetState,
    setLifecycleTargetState,
    transitionLifecycle,
    assignJudge,
    isAssigning,
    autoAssign,
    isAutoAssigning,
    isLoading,
  } = useJudging({ hackathonId });

  const breadcrumbs = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathon?.name || 'Workspace', href: `/hackathons/${hackathonId}` },
    { label: 'Judging', active: true },
  ];

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Judging Operations Workspace"
    >
      {/* Header & Breadcrumbs */}
      <div className="space-y-3 pb-3 border-b border-[#DCDDD3]">
        <Breadcrumbs items={breadcrumbs} className="text-xs" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                Judging Command Center
              </h1>
              <span className="text-xs font-mono font-bold bg-[#E2EBDD] text-[#274535] px-2.5 py-0.5 rounded-[6px] border border-[#B8CEB0]">
                {metrics.totalJudges} Judges Active
              </span>
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              Monitor reviewer workloads, track evaluation progress, audit scoring rubrics, and calibrate judging fairness.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}/configuration`)}
              leftIcon={<Sliders className="w-3.5 h-3.5 text-[#6D7068]" />}
              className="text-xs font-mono h-8"
            >
              Rubric Config
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}`)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8"
            >
              Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Judging Progress Bar */}
      <JudgingProgressBar metrics={metrics} lifecycleState={lifecycleState} />

      {/* Summary Metrics & Attention Banner */}
      <JudgingSummaryMetrics
        metrics={metrics}
        activeTab={filters.tab}
        onSelectTab={(tb) => updateFilters({ tab: tb })}
      />

      {/* Toolbar & View Switcher */}
      <JudgingToolbar
        filters={filters}
        onFilterChange={updateFilters}
        onResetFilters={resetFilters}
        judgesCount={allJudges.length}
        submissionsCount={allSubmissions.length}
        evaluationsCount={evaluations.length}
        lifecycleState={lifecycleState}
        onOpenAssignDialog={() => setIsAssignJudgesOpen(true)}
        onOpenLifecycleDialog={() => setLifecycleTargetState(lifecycleState)}
      />

      {/* Main Tab Views */}
      {filters.tab === 'OVERVIEW' && (
        <div className="space-y-4">
          {/* Rubric Criteria Grid */}
          <div className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-2.5">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#028051]" />
                <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
                  Active Scoring Rubric ({criteria.length} Criteria)
                </h3>
              </div>
              <span className="text-xs font-mono text-[#028051] font-bold">
                100% Total Weight
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {criteria.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-bold text-[#171914] truncate">
                        {c.name}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#DCDDD3]/70 font-mono text-[11px]">
                    <span className="text-[#6D7068]">Max: <strong>{c.maxScore} pts</strong></span>
                    <span className="font-bold text-[#028051] bg-[#E2EBDD] px-2 py-0.5 rounded">
                      {Math.round(c.weight * 100)}% Weight
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {filters.tab === 'JUDGES' && (
        <JudgesTable
          judges={judges}
          isLoading={isLoading}
          onViewDetails={(j) => setSelectedJudgeId(j.id)}
          onAssignSubmissions={() => setIsAssignJudgesOpen(true)}
        />
      )}

      {filters.tab === 'SUBMISSIONS' && (
        <SubmissionJudgingTable
          submissions={submissions}
          onAssignJudge={() => setIsAssignJudgesOpen(true)}
        />
      )}

      {filters.tab === 'EVALUATIONS' && (
        <EvaluationsTable
          evaluations={evaluations}
          onViewDetails={(e) => setSelectedEvaluationId(e.id)}
        />
      )}

      {/* Drawers */}
      <JudgeDetailDrawer
        judge={selectedJudge}
        isOpen={Boolean(selectedJudge)}
        onClose={() => setSelectedJudgeId(null)}
      />

      <EvaluationDetailDrawer
        evaluation={selectedEvaluation}
        isOpen={Boolean(selectedEvaluation)}
        onClose={() => setSelectedEvaluationId(null)}
      />

      {/* Dialogs */}
      <AssignJudgesDialog
        isOpen={isAssignJudgesOpen}
        onClose={() => setIsAssignJudgesOpen(false)}
        judges={allJudges}
        submissions={allSubmissions}
        onAssign={(sId, jId) => assignJudge(sId, jId)}
        onAutoAssign={() => autoAssign()}
        isAssigning={isAssigning}
        isAutoAssigning={isAutoAssigning}
      />

      <JudgingLifecycleDialog
        isOpen={Boolean(lifecycleTargetState)}
        onClose={() => setLifecycleTargetState(null)}
        currentState={lifecycleState}
        onTransition={(st) => transitionLifecycle(st)}
      />
    </div>
  );
};

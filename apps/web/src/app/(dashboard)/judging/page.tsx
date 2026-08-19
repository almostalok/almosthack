'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Badge, Card, Skeleton } from '@almosthack/ui';
import {
  Award,
  FileText,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Sliders,
  AlertCircle,
  Save,
  Send,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  JudgeAssignmentEntity,
  JudgingCriterionEntity,
} from '@almosthack/types';

export default function JudgePortalPage() {
  const queryClient = useQueryClient();

  const [activeAssignmentId, setActiveAssignmentId] = React.useState<string>('');
  const [generalFeedback, setGeneralFeedback] = React.useState<string>('');
  const [scoresMap, setScoresMap] = React.useState<Record<string, { score: number; comment?: string }>>({});
  const [evalError, setEvalError] = React.useState<string>('');

  // Fetch Judge Assignments
  const { data: assignments = [], isLoading } = useQuery<JudgeAssignmentEntity[]>({
    queryKey: ['judge-assignments'],
    queryFn: () => apiClient.getJudgeAssignments(),
  });

  // Selected Assignment
  const activeAssignment = assignments.find((a) => a.id === activeAssignmentId) || assignments[0];

  // Fetch Criteria for Active Assignment's Hackathon
  const hackathonId = activeAssignment?.hackathonId || '';
  const { data: criteria = [] } = useQuery<JudgingCriterionEntity[]>({
    queryKey: ['judging-criteria', hackathonId],
    queryFn: () => apiClient.getJudgingCriteria(hackathonId),
    enabled: !!hackathonId,
  });

  // Populate initial state if evaluation exists
  React.useEffect(() => {
    if (activeAssignment?.evaluation) {
      setGeneralFeedback(activeAssignment.evaluation.generalFeedback || '');
      const map: Record<string, { score: number; comment?: string }> = {};
      activeAssignment.evaluation.scores?.forEach((s) => {
        map[s.criterionId] = { score: s.score, comment: s.comment || '' };
      });
      setScoresMap(map);
    } else {
      setGeneralFeedback('');
      setScoresMap({});
    }
  }, [activeAssignmentId, activeAssignment]);

  const handleScoreChange = (criterionId: string, val: number) => {
    setScoresMap((prev) => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score: val },
    }));
  };

  const handleCommentChange = (criterionId: string, comment: string) => {
    setScoresMap((prev) => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], comment },
    }));
  };

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: () => {
      const scoresPayload = criteria.map((c) => ({
        criterionId: c.id,
        score: scoresMap[c.id]?.score ?? 0,
        comment: scoresMap[c.id]?.comment || null,
      }));
      return apiClient.saveEvaluationDraft(activeAssignment!.id, {
        generalFeedback,
        scores: scoresPayload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judge-assignments'] });
      setEvalError('');
    },
    onError: (err: any) => setEvalError(err?.message || 'Failed to save evaluation draft'),
  });

  // Submit Evaluation Mutation
  const submitEvalMutation = useMutation({
    mutationFn: () => {
      const scoresPayload = criteria.map((c) => ({
        criterionId: c.id,
        score: scoresMap[c.id]?.score ?? 0,
        comment: scoresMap[c.id]?.comment || null,
      }));
      return apiClient.submitEvaluation(activeAssignment!.id, {
        generalFeedback,
        scores: scoresPayload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judge-assignments'] });
      setEvalError('');
    },
    onError: (err: any) => setEvalError(err?.message || 'Failed to submit final evaluation'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/overview' }, { label: 'Judge Portal' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 flex items-center gap-3">
            <Award className="w-7 h-7 text-amber-400" /> Judge Evaluation Portal
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Evaluate your assigned team submissions using official rubric criteria.
          </p>
        </div>
      </div>

      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Assignment Selector Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Assigned Submissions ({assignments.length})
            </h3>
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => setActiveAssignmentId(assignment.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeAssignment?.id === assignment.id
                      ? 'bg-indigo-950/40 border-indigo-500/60 text-zinc-100'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold truncate">
                      {assignment.submission?.title || 'Submission'}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        assignment.status === 'COMPLETED'
                          ? 'text-emerald-400 border-emerald-500/30'
                          : 'text-amber-400 border-amber-500/30'
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1">
                    Team: {assignment.submission?.team?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Evaluation Workspace */}
          {activeAssignment && (
            <div className="md:col-span-2 space-y-5">
              <Card className="p-6 bg-zinc-950/80 border-zinc-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-mono font-bold text-zinc-100">
                      {activeAssignment.submission?.title}
                    </h2>
                    <span className="text-xs font-mono text-zinc-400">
                      Team: <strong className="text-zinc-200">{activeAssignment.submission?.team?.name}</strong>
                    </span>
                  </div>

                  {/* GitHub Commit Snapshot */}
                  {activeAssignment.submission?.repository && (
                    <div className="flex items-center gap-2 p-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-xs font-mono">
                      <GitBranch className="w-4 h-4 text-indigo-400" />
                      <a
                        href={activeAssignment.submission.repository.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-300 hover:underline flex items-center gap-1"
                      >
                        {activeAssignment.submission.repository.repositoryFullName} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {activeAssignment.submission?.description && (
                  <p className="text-xs font-mono text-zinc-300 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/40">
                    {activeAssignment.submission.description}
                  </p>
                )}

                {/* Rubric Criteria Evaluation Inputs */}
                <div className="space-y-4 pt-2 border-t border-zinc-800/80">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" /> Evaluation Rubric
                  </h3>

                  {criteria.map((criterion) => (
                    <div key={criterion.id} className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-zinc-200">{criterion.name}</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          Score: {scoresMap[criterion.id]?.score ?? 0} / {criterion.maxScore} (weight: {criterion.weight})
                        </span>
                      </div>
                      {criterion.description && (
                        <p className="text-[11px] font-mono text-zinc-400">{criterion.description}</p>
                      )}

                      <input
                        type="range"
                        min={0}
                        max={criterion.maxScore}
                        step={0.5}
                        value={scoresMap[criterion.id]?.score ?? 0}
                        disabled={activeAssignment.evaluation?.status === 'SUBMITTED'}
                        onChange={(e) => handleScoreChange(criterion.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />

                      <input
                        type="text"
                        placeholder="Criterion comment (Optional)"
                        value={scoresMap[criterion.id]?.comment || ''}
                        disabled={activeAssignment.evaluation?.status === 'SUBMITTED'}
                        onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}

                  {/* General Feedback */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-mono font-bold text-zinc-300">General Feedback & Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Constructive feedback for the team..."
                      value={generalFeedback}
                      disabled={activeAssignment.evaluation?.status === 'SUBMITTED'}
                      onChange={(e) => setGeneralFeedback(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {evalError && <div className="text-xs font-mono text-red-400">{evalError}</div>}

                {/* Actions */}
                {activeAssignment.evaluation?.status !== 'SUBMITTED' ? (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={saveDraftMutation.isPending}
                      onClick={() => saveDraftMutation.mutate()}
                    >
                      <Save className="w-4 h-4 mr-1.5" /> Save Draft
                    </Button>
                    <Button
                      size="sm"
                      variant="accent"
                      isLoading={submitEvalMutation.isPending}
                      onClick={() => submitEvalMutation.mutate()}
                    >
                      <Send className="w-4 h-4 mr-1.5" /> Submit Evaluation
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4" /> Evaluation submitted and finalized (Total Score: {activeAssignment.evaluation.totalScore}%)
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center bg-zinc-950/40 border-zinc-800/80">
          <Award className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-mono font-bold text-zinc-300">No Assigned Submissions</h3>
          <p className="text-xs font-mono text-zinc-500 mt-1">
            You do not currently have any submissions assigned for evaluation.
          </p>
        </Card>
      )}
    </div>
  );
}

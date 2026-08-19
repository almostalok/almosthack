'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Badge, Card, Skeleton } from '@almosthack/ui';
import {
  FileText,
  GitBranch,
  ExternalLink,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Sliders,
  UserPlus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  SubmissionEntity,
  JudgingCriterionEntity,
  HackathonEntity,
} from '@almosthack/types';

export default function HackathonSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;

  const [selectedSubmission, setSelectedSubmission] = React.useState<SubmissionEntity | null>(null);
  const [judgeUserId, setJudgeUserId] = React.useState<string>('');
  const [assignError, setAssignError] = React.useState<string>('');

  // Rubric creation state
  const [criterionName, setCriterionName] = React.useState<string>('');
  const [criterionDesc, setCriterionDesc] = React.useState<string>('');
  const [maxScore, setMaxScore] = React.useState<number>(10);
  const [weight, setWeight] = React.useState<number>(1.0);

  // Fetch Hackathon
  const { data: hackathon, isLoading: isLoadingHackathon } = useQuery<HackathonEntity>({
    queryKey: ['hackathon', hackathonId],
    queryFn: () => apiClient.getHackathon(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch Submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery<SubmissionEntity[]>({
    queryKey: ['hackathon-submissions', hackathonId],
    queryFn: () => apiClient.getHackathonSubmissions(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch Judging Criteria
  const { data: criteria = [], isLoading: isLoadingCriteria } = useQuery<JudgingCriterionEntity[]>({
    queryKey: ['judging-criteria', hackathonId],
    queryFn: () => apiClient.getJudgingCriteria(hackathonId),
    enabled: !!hackathonId,
  });

  // Add Criterion Mutation
  const createCriterionMutation = useMutation({
    mutationFn: () =>
      apiClient.createJudgingCriterion(hackathonId, {
        name: criterionName,
        description: criterionDesc,
        maxScore,
        weight,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judging-criteria', hackathonId] });
      setCriterionName('');
      setCriterionDesc('');
    },
  });

  // Assign Judge Mutation
  const assignJudgeMutation = useMutation({
    mutationFn: (subId: string) => apiClient.assignJudge(subId, { judgeUserId, submissionId: subId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-submissions', hackathonId] });
      setJudgeUserId('');
      setAssignError('');
    },
    onError: (err: any) => {
      setAssignError(err?.message || 'Failed to assign judge');
    },
  });

  if (isLoadingHackathon || isLoadingSubmissions) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Hackathons', href: '/hackathons' },
          { label: hackathon?.name || 'Hackathon', href: `/hackathons/${hackathonId}` },
          { label: 'Submissions & Judging' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-400" /> Submissions & Judging
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Review team submissions, verified GitHub commit snapshots, and manage rubric criteria.
          </p>
        </div>
      </div>

      {/* Judging Criteria Rubric Section */}
      <Card className="p-6 bg-zinc-950/60 border-zinc-800/80 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" /> Hackathon Judging Rubric ({criteria.length})
        </h3>

        {criteria.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {criteria.map((c) => (
              <div key={c.id} className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-200">{c.name}</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                    Max: {c.maxScore} (w: {c.weight})
                  </Badge>
                </div>
                {c.description && <p className="text-[11px] font-mono text-zinc-400">{c.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs font-mono text-zinc-500">No judging criteria defined yet for this hackathon.</p>
        )}

        {/* Add Criterion Form */}
        <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Criterion Name (e.g. Innovation)"
            value={criterionName}
            onChange={(e) => setCriterionName(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Description (Optional)"
            value={criterionDesc}
            onChange={(e) => setCriterionDesc(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="Max Score"
            value={maxScore}
            onChange={(e) => setMaxScore(parseFloat(e.target.value) || 10)}
            className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
          <Button
            size="sm"
            variant="outline"
            isLoading={createCriterionMutation.isPending}
            onClick={() => createCriterionMutation.mutate()}
            disabled={!criterionName.trim()}
          >
            Add Criterion
          </Button>
        </div>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" /> Team Submissions ({submissions.length})
        </h3>

        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <Card key={sub.id} className="p-5 bg-zinc-950/80 border-zinc-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-zinc-100">{sub.title}</span>
                      <Badge
                        variant="outline"
                        className={
                          sub.status === 'FINALIZED'
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : sub.status === 'SUBMITTED'
                            ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
                            : 'text-zinc-400 border-zinc-800'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-3">
                      <span>Team: <strong className="text-zinc-200">{sub.team?.name}</strong></span>
                      {sub.track && <span>Track: <strong className="text-zinc-300">{sub.track.name}</strong></span>}
                    </div>
                  </div>

                  {/* GitHub Verified Snapshot */}
                  {sub.repository && (
                    <div className="flex items-center gap-2 p-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-xs font-mono">
                      <GitBranch className="w-4 h-4 text-indigo-400" />
                      <a
                        href={sub.repository.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-300 hover:underline flex items-center gap-1"
                      >
                        {sub.repository.repositoryFullName} <ExternalLink className="w-3 h-3" />
                      </a>
                      {sub.commitSha && (
                        <Badge variant="outline" className="text-[10px] text-zinc-400">
                          SHA: {sub.commitSha.substring(0, 7)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {sub.description && (
                  <p className="text-xs font-mono text-zinc-300 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/40">
                    {sub.description}
                  </p>
                )}

                {/* Judge Assignment controls */}
                <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Award className="w-4 h-4 text-amber-400" /> Assign Judge:
                    <input
                      type="text"
                      placeholder="Judge User UUID"
                      value={selectedSubmission?.id === sub.id ? judgeUserId : ''}
                      onChange={(e) => {
                        setSelectedSubmission(sub);
                        setJudgeUserId(e.target.value);
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={assignJudgeMutation.isPending && selectedSubmission?.id === sub.id}
                      onClick={() => {
                        setSelectedSubmission(sub);
                        assignJudgeMutation.mutate(sub.id);
                      }}
                    >
                      Assign
                    </Button>
                  </div>
                  {assignError && selectedSubmission?.id === sub.id && (
                    <span className="text-xs font-mono text-red-400">{assignError}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-zinc-950/40 border-zinc-800/80">
            <p className="text-xs font-mono text-zinc-500">No submissions created for this hackathon yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

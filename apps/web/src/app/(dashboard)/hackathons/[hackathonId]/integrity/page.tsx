'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Badge, Card, Skeleton } from '@almosthack/ui';
import {
  ShieldAlert,
  ShieldCheck,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  IntegrityAnalysisEntity,
  IntegrityFindingEntity,
  SubmissionEntity,
  HackathonEntity,
} from '@almosthack/types';

export default function HackathonIntegrityPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;

  const [activeTab, setActiveTab] = React.useState<'findings' | 'analyses'>('findings');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [selectedFinding, setSelectedFinding] = React.useState<IntegrityFindingEntity | null>(null);

  // Review action modal state
  const [reviewModalOpen, setReviewModalOpen] = React.useState<boolean>(false);
  const [reviewAction, setReviewAction] = React.useState<'confirm' | 'dismiss' | null>(null);
  const [reviewReason, setReviewReason] = React.useState<string>('');
  const [reviewNotes, setReviewNotes] = React.useState<string>('');
  const [reviewError, setReviewError] = React.useState<string>('');

  // Fetch Hackathon
  const { data: hackathon } = useQuery<HackathonEntity>({
    queryKey: ['hackathon', hackathonId],
    queryFn: () => apiClient.getHackathon(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch Submissions
  const { data: submissions = [] } = useQuery<SubmissionEntity[]>({
    queryKey: ['hackathon-submissions', hackathonId],
    queryFn: () => apiClient.getHackathonSubmissions(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch Integrity Findings
  const { data: findings = [], isLoading: isLoadingFindings } = useQuery<IntegrityFindingEntity[]>({
    queryKey: ['hackathon-integrity-findings', hackathonId, statusFilter],
    queryFn: () =>
      apiClient.getHackathonIntegrityFindings(
        hackathonId,
        statusFilter === 'ALL' ? undefined : { params: { status: statusFilter } }
      ),
    enabled: !!hackathonId,
  });

  // Fetch Integrity Analyses
  const { data: analyses = [], isLoading: isLoadingAnalyses } = useQuery<IntegrityAnalysisEntity[]>({
    queryKey: ['hackathon-integrity-analyses', hackathonId],
    queryFn: () => apiClient.getHackathonIntegrityAnalyses(hackathonId),
    enabled: !!hackathonId,
  });

  // Start Analysis Mutation
  const startAnalysisMutation = useMutation({
    mutationFn: (submissionId: string) => apiClient.startIntegrityAnalysis(submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-integrity-analyses', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-integrity-findings', hackathonId] });
    },
  });

  // Start Review Mutation
  const startReviewMutation = useMutation({
    mutationFn: (findingId: string) => apiClient.reviewIntegrityFinding(findingId),
    onSuccess: (updated) => {
      setSelectedFinding(updated);
      queryClient.invalidateQueries({ queryKey: ['hackathon-integrity-findings', hackathonId] });
    },
  });

  // Confirm Finding Mutation
  const confirmFindingMutation = useMutation({
    mutationFn: ({ findingId, reason, notes }: { findingId: string; reason: string; notes?: string }) =>
      apiClient.confirmIntegrityFinding(findingId, { reason, notes }),
    onSuccess: (updated) => {
      setSelectedFinding(updated);
      setReviewModalOpen(false);
      setReviewReason('');
      setReviewNotes('');
      queryClient.invalidateQueries({ queryKey: ['hackathon-integrity-findings', hackathonId] });
    },
    onError: (err: any) => {
      setReviewError(err?.response?.data?.message || err?.message || 'Failed to confirm finding');
    },
  });

  // Dismiss Finding Mutation
  const dismissFindingMutation = useMutation({
    mutationFn: ({ findingId, reason, notes }: { findingId: string; reason: string; notes?: string }) =>
      apiClient.dismissIntegrityFinding(findingId, { reason, notes }),
    onSuccess: (updated) => {
      setSelectedFinding(updated);
      setReviewModalOpen(false);
      setReviewReason('');
      setReviewNotes('');
      queryClient.invalidateQueries({ queryKey: ['hackathon-integrity-findings', hackathonId] });
    },
    onError: (err: any) => {
      setReviewError(err?.response?.data?.message || err?.message || 'Failed to dismiss finding');
    },
  });

  const handleOpenReviewModal = (action: 'confirm' | 'dismiss') => {
    setReviewAction(action);
    setReviewReason('');
    setReviewNotes('');
    setReviewError('');
    setReviewModalOpen(true);
  };

  const handleExecuteReview = () => {
    if (!selectedFinding || !reviewAction) return;
    if (reviewReason.trim().length < 5) {
      setReviewError('Reason must be at least 5 characters long.');
      return;
    }

    if (reviewAction === 'confirm') {
      confirmFindingMutation.mutate({
        findingId: selectedFinding.id,
        reason: reviewReason,
        notes: reviewNotes,
      });
    } else {
      dismissFindingMutation.mutate({
        findingId: selectedFinding.id,
        reason: reviewReason,
        notes: reviewNotes,
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return <Badge variant="destructive">High Signal ({severity})</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium Signal ({severity})</Badge>;
      default:
        return <Badge variant="default">Low Signal ({severity})</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="destructive">Confirmed Similarity</Badge>;
      case 'DISMISSED':
        return <Badge variant="outline">Dismissed (False Positive)</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="warning">Under Review</Badge>;
      default:
        return <Badge variant="default">Open Signal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Hackathons', href: '/hackathons' },
          { label: hackathon?.name || 'Hackathon', href: `/hackathons/${hackathonId}` },
          { label: 'Integrity & Forensics', href: `/hackathons/${hackathonId}/integrity` },
        ]}
      />

      {/* Header Banner with Principle */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Integrity, Plagiarism & Forensics
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Deterministic code similarity and structural overlap analysis for submissions.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">NON-NEGOTIABLE PRINCIPLE: DETECTION ≠ GUILT.</span> The integrity
            engine produces observational similarity signals and evidence, NEVER disciplinary verdicts. Only
            authorized human organizers may review evidence and take disciplinary action.
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Analyses</span>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{analyses.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Signals</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {findings.filter((f) => f.status === 'OPEN' || f.status === 'UNDER_REVIEW').length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Confirmed Similarities</span>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {findings.filter((f) => f.status === 'CONFIRMED').length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Dismissed (False Positives)</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {findings.filter((f) => f.status === 'DISMISSED').length}
          </p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('findings')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'findings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Similarity Findings ({findings.length})
        </button>
        <button
          onClick={() => setActiveTab('analyses')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'analyses'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Analysis Runs ({analyses.length})
        </button>
      </div>

      {/* Findings Tab */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['ALL', 'OPEN', 'UNDER_REVIEW', 'CONFIRMED', 'DISMISSED'].map((st) => (
                <Button
                  key={st}
                  variant={statusFilter === st ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(st)}
                >
                  {st.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {isLoadingFindings ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : findings.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-sm font-medium">No integrity findings detected.</p>
              <p className="text-xs">Run analysis on eligible submissions to check for potential similarity.</p>
            </Card>
          ) : (
            <div className="rounded-md border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="p-3">Source Submission</th>
                    <th className="p-3">Comparison Target</th>
                    <th className="p-3">Similarity</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {findings.map((finding) => (
                    <tr key={finding.id} className="hover:bg-muted/20">
                      <td className="p-3">
                        <div className="font-medium text-foreground">
                          {finding.submission?.title || finding.submissionId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Team: {finding.submission?.team?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-foreground">
                          {finding.comparisonSubmission?.title || finding.comparisonSubmissionId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Team: {finding.comparisonSubmission?.team?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-foreground">
                          {Math.round(finding.similarity * 100)}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          Conf: {Math.round(finding.confidence * 100)}%
                        </div>
                      </td>
                      <td className="p-3">{getSeverityBadge(finding.severity)}</td>
                      <td className="p-3">{getStatusBadge(finding.status)}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFinding(finding)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Inspect Evidence
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analyses Tab */}
      {activeTab === 'analyses' && (
        <div className="space-y-4">
          <div className="rounded-md border border-border overflow-hidden bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="p-3">Submission</th>
                  <th className="p-3">Commit SHA</th>
                  <th className="p-3">Engine Version</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Started At</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions
                  .filter((s) => s.status === 'SUBMITTED' || s.status === 'FINALIZED')
                  .map((sub) => {
                    const analysis = analyses.find((a) => a.submissionId === sub.id);
                    return (
                      <tr key={sub.id} className="hover:bg-muted/20">
                        <td className="p-3">
                          <div className="font-medium text-foreground">{sub.title}</div>
                          <div className="text-xs text-muted-foreground">Team: {sub.teamId}</div>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">
                          {sub.commitSha ? sub.commitSha.substring(0, 7) : 'None'}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {analysis ? analysis.engineVersion : 'v1.0.0'}
                        </td>
                        <td className="p-3">
                          {analysis ? (
                            <Badge variant={analysis.status === 'COMPLETED' ? 'default' : 'outline'}>
                              {analysis.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Analyzed</Badge>
                          )}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {analysis?.startedAt ? new Date(analysis.startedAt).toLocaleString() : '—'}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={startAnalysisMutation.isPending || !sub.commitSha}
                            onClick={() => startAnalysisMutation.mutate(sub.id)}
                          >
                            <RefreshCw
                              className={`h-3.5 w-3.5 mr-1 ${
                                startAnalysisMutation.isPending ? 'animate-spin' : ''
                              }`}
                            />
                            {analysis ? 'Re-Analyze' : 'Analyze'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evidence Inspection Drawer */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 backdrop-blur-sm">
          <div className="h-full w-full max-w-2xl border-l border-border bg-card p-6 shadow-xl overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Evidence Inspection</h2>
                <p className="text-xs text-muted-foreground">Finding ID: {selectedFinding.id}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFinding(null)}>
                Close
              </Button>
            </div>

            {/* Signal Details */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4 text-xs">
              <div>
                <span className="text-muted-foreground">Source Submission:</span>
                <div className="font-semibold text-foreground">
                  {selectedFinding.submission?.title || selectedFinding.submissionId}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Target Submission:</span>
                <div className="font-semibold text-foreground">
                  {selectedFinding.comparisonSubmission?.title || selectedFinding.comparisonSubmissionId}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Similarity Score:</span>
                <div className="font-semibold text-foreground">
                  {Math.round(selectedFinding.similarity * 100)}%
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Detection Confidence:</span>
                <div className="font-semibold text-foreground">
                  {Math.round(selectedFinding.confidence * 100)}%
                </div>
              </div>
            </div>

            {/* Evidence List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Matched Files & Fragments</h3>
              {selectedFinding.evidence && selectedFinding.evidence.length > 0 ? (
                selectedFinding.evidence.map((ev) => (
                  <div key={ev.id} className="rounded-lg border border-border p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono text-muted-foreground">
                      <span>Source: {ev.sourcePath} (L{ev.sourceStart}-{ev.sourceEnd})</span>
                      <span>Target: {ev.targetPath} (L{ev.targetStart}-{ev.targetEnd})</span>
                    </div>
                    {ev.sourceSnippet && (
                      <div className="rounded bg-muted p-2 font-mono text-[11px] overflow-x-auto">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase font-sans font-semibold">
                          Source Excerpt:
                        </p>
                        <pre>{ev.sourceSnippet}</pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No file excerpts available.</p>
              )}
            </div>

            {/* Review History */}
            {selectedFinding.reviews && selectedFinding.reviews.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground">Review Trail</h3>
                {selectedFinding.reviews.map((rev) => (
                  <div key={rev.id} className="rounded bg-muted/40 p-2 text-xs space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{rev.reviewer?.name || rev.reviewerId}</span>
                      <span>{new Date(rev.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="font-medium text-foreground">
                      Status: {rev.fromStatus} $\rightarrow$ {rev.toStatus}
                    </p>
                    <p className="text-muted-foreground">Reason: {rev.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reviewer Action Buttons */}
            <div className="flex gap-2 border-t border-border pt-4">
              {selectedFinding.status === 'OPEN' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => startReviewMutation.mutate(selectedFinding.id)}
                  disabled={startReviewMutation.isPending}
                >
                  Start Review
                </Button>
              )}
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleOpenReviewModal('confirm')}
              >
                Confirm Similarity
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenReviewModal('dismiss')}
              >
                Dismiss (False Positive)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Confirmation / Dismissal Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              {reviewAction === 'confirm' ? 'Confirm Potential Similarity' : 'Dismiss as False Positive'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {reviewAction === 'confirm'
                ? 'Confirming marks this finding as a verified structural overlap. Note: This does NOT automatically penalize the team.'
                : 'Dismissing marks this finding as a non-actionable false positive (e.g. shared starter boilerplate).'}
            </p>

            {reviewError && (
              <div className="rounded bg-destructive/10 p-2 text-xs text-destructive">
                {reviewError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Reason (Required, min 5 chars):</label>
              <textarea
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder="Enter detailed reason for this determination..."
                className="w-full h-24 rounded border border-border bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Internal Notes (Optional):</label>
              <input
                type="text"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional notes for other reviewers..."
                className="w-full rounded border border-border bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={reviewAction === 'confirm' ? 'destructive' : 'primary'}
                size="sm"
                onClick={handleExecuteReview}
                disabled={confirmFindingMutation.isPending || dismissFindingMutation.isPending}
              >
                Submit Decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Input, Card, Badge, Skeleton } from '@almosthack/ui';
import {
  ArrowLeft,
  Plus,
  Target,
  Edit2,
  Trash2,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Link2,
  FileText,
  HelpCircle,
  Eye,
  Archive,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  HackathonEntity,
  HackathonLifecycleResponse,
  HackathonTrackEntity,
  HackathonChallengeEntity,
  ChallengeStatus,
  ChallengeResource,
} from '@almosthack/types';

export default function HackathonTrackChallengesPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;
  const trackId = params.trackId as string;

  // Modals & form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<HackathonChallengeEntity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    problemStatement: '',
    requirements: '',
    constraints: '',
    expectedOutcome: '',
    status: ChallengeStatus.DRAFT,
    resources: [] as ChallengeResource[],
  });

  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Queries
  const { data: hackathon, isLoading: isLoadingHackathon } = useQuery<HackathonEntity>({
    queryKey: ['hackathon', hackathonId],
    queryFn: async () => {
      const res = await apiClient.getHackathon(hackathonId);
      return res.data;
    },
  });

  const { data: lifecycle } = useQuery<HackathonLifecycleResponse>({
    queryKey: ['hackathon-lifecycle', hackathonId],
    queryFn: async () => {
      const res = await apiClient.getHackathonLifecycle(hackathonId);
      return res.data;
    },
  });

  const { data: track, isLoading: isLoadingTrack } = useQuery<HackathonTrackEntity>({
    queryKey: ['hackathon-track', hackathonId, trackId],
    queryFn: async () => {
      const res = await apiClient.getHackathonTrack(hackathonId, trackId);
      return res.data;
    },
  });

  const { data: challenges = [], isLoading: isLoadingChallenges } = useQuery<HackathonChallengeEntity[]>({
    queryKey: ['track-challenges', trackId],
    queryFn: async () => {
      const res = await apiClient.getTrackChallenges(trackId);
      return res.data;
    },
  });

  const effectiveStatus = lifecycle?.hackathonStatus || hackathon?.status;
  const isLocked =
    effectiveStatus === 'LIVE' ||
    effectiveStatus === 'COMPLETED' ||
    effectiveStatus === 'ARCHIVED';

  // Mutations
  const createChallengeMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const res = await apiClient.createTrackChallenge(trackId, {
        name: payload.name,
        slug: payload.slug.trim() || undefined,
        description: payload.description.trim() || null,
        problemStatement: payload.problemStatement.trim(),
        requirements: payload.requirements.trim() || null,
        constraints: payload.constraints.trim() || null,
        expectedOutcome: payload.expectedOutcome.trim() || null,
        resources: payload.resources.length > 0 ? payload.resources : undefined,
        status: payload.status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-challenges', trackId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-track', hackathonId, trackId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-tracks', hackathonId] });
      setIsCreateModalOpen(false);
      resetForm();
      setSuccessMsg('Challenge created successfully.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create challenge.');
      setSuccessMsg(null);
    },
  });

  const updateChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, payload }: { challengeId: string; payload: typeof formData }) => {
      const res = await apiClient.updateTrackChallenge(trackId, challengeId, {
        name: payload.name,
        slug: payload.slug.trim() || undefined,
        description: payload.description.trim() || null,
        problemStatement: payload.problemStatement.trim(),
        requirements: payload.requirements.trim() || null,
        constraints: payload.constraints.trim() || null,
        expectedOutcome: payload.expectedOutcome.trim() || null,
        resources: payload.resources,
        status: payload.status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-challenges', trackId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-track', hackathonId, trackId] });
      setEditingChallenge(null);
      resetForm();
      setSuccessMsg('Challenge updated successfully.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update challenge.');
      setSuccessMsg(null);
    },
  });

  const deleteChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const res = await apiClient.deleteTrackChallenge(trackId, challengeId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-challenges', trackId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-track', hackathonId, trackId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-tracks', hackathonId] });
      setSuccessMsg('Challenge deleted successfully.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to delete challenge.');
      setSuccessMsg(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; displayOrder: number }[]) => {
      const res = await apiClient.reorderTrackChallenges(trackId, { items });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-challenges', trackId] });
      setSuccessMsg('Challenges reordered.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to reorder challenges.');
    },
  });

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (isLocked) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= challenges.length) return;

    const newChallenges = [...challenges];
    const [moved] = newChallenges.splice(index, 1);
    newChallenges.splice(targetIndex, 0, moved);

    const items = newChallenges.map((c, idx) => ({
      id: c.id,
      displayOrder: idx + 1,
    }));

    reorderMutation.mutate(items);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      problemStatement: '',
      requirements: '',
      constraints: '',
      expectedOutcome: '',
      status: ChallengeStatus.DRAFT,
      resources: [],
    });
    setResourceTitle('');
    setResourceUrl('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (challenge: HackathonChallengeEntity) => {
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name,
      slug: challenge.slug,
      description: challenge.description || '',
      problemStatement: challenge.problemStatement,
      requirements: challenge.requirements || '',
      constraints: challenge.constraints || '',
      expectedOutcome: challenge.expectedOutcome || '',
      status: challenge.status,
      resources: Array.isArray(challenge.resources) ? challenge.resources : [],
    });
  };

  const addResource = () => {
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;
    if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://')) {
      setErrorMsg('Resource URL must start with http:// or https://');
      return;
    }
    setFormData({
      ...formData,
      resources: [...formData.resources, { title: resourceTitle.trim(), url: resourceUrl.trim() }],
    });
    setResourceTitle('');
    setResourceUrl('');
    setErrorMsg(null);
  };

  const removeResource = (index: number) => {
    const updated = [...formData.resources];
    updated.splice(index, 1);
    setFormData({ ...formData, resources: updated });
  };

  if (isLoadingHackathon || isLoadingTrack || isLoadingChallenges) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: 'Hackathons', href: '/hackathons' },
              { label: hackathon?.name || 'Hackathon', href: `/hackathons/${hackathonId}` },
              { label: 'Tracks', href: `/hackathons/${hackathonId}/tracks` },
              { label: track?.name || 'Track', href: `/hackathons/${hackathonId}/tracks/${trackId}` },
            ]}
          />
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Target className="h-8 w-8 text-indigo-400" />
              {track?.name}
            </h1>
            <Badge variant="outline" className="text-neutral-400 font-mono text-xs border-neutral-700">
              /{track?.slug}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/hackathons/${hackathonId}/tracks`)}
            className="border-neutral-700 hover:bg-neutral-800 text-neutral-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tracks
          </Button>

          {!isLocked && (
            <Button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Challenge
            </Button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 flex items-center gap-3 text-sm animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Track Description Banner */}
      {track?.description && (
        <Card className="p-5 border-neutral-800/80 bg-neutral-900/40 rounded-2xl">
          <p className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed">
            {track.description}
          </p>
        </Card>
      )}

      {/* Lifecycle Locking Warning */}
      {isLocked && (
        <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-950/30 flex items-start gap-4">
          <Lock className="h-6 w-6 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-200 text-base">
              Challenge Structure Locked ({effectiveStatus})
            </h4>
            <p className="text-amber-300/80 text-sm mt-1">
              Challenges cannot be added, edited, deleted, or reordered while the hackathon is in{' '}
              <span className="font-semibold text-amber-200">{effectiveStatus}</span> status.
            </p>
          </div>
        </div>
      )}

      {/* Challenges List */}
      <div className="space-y-4">
        {challenges.length === 0 ? (
          <Card className="p-12 text-center border-neutral-800 bg-neutral-900/50 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No challenges added yet</h3>
            <p className="text-neutral-400 max-w-md mx-auto mb-6 text-sm">
              Add explicit challenges with problem statements, requirements, and reference resources to this track.
            </p>
            {!isLocked && (
              <Button
                onClick={openCreateModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Challenge
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-6">
            {challenges.map((challenge, index) => (
              <Card
                key={challenge.id}
                className="p-6 border-neutral-800/80 bg-neutral-900/60 hover:border-neutral-700/80 transition-all rounded-2xl space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center justify-center border border-neutral-700">
                      #{challenge.displayOrder || index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">{challenge.name}</h3>
                    <Badge variant="outline" className="text-neutral-400 font-mono text-xs border-neutral-700">
                      /{challenge.slug}
                    </Badge>
                    <Badge
                      className={
                        challenge.status === ChallengeStatus.PUBLISHED
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                          : challenge.status === ChallengeStatus.ARCHIVED
                          ? 'bg-red-950/60 text-red-400 border-red-800/50'
                          : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                      }
                    >
                      {challenge.status}
                    </Badge>
                  </div>

                  {/* Actions & Reordering */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isLocked && (
                      <div className="flex items-center gap-1 mr-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                        <button
                          type="button"
                          disabled={index === 0 || reorderMutation.isPending}
                          onClick={() => handleMove(index, 'up')}
                          className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-neutral-800 transition"
                          title="Move Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === challenges.length - 1 || reorderMutation.isPending}
                          onClick={() => handleMove(index, 'down')}
                          className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-neutral-800 transition"
                          title="Move Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {!isLocked && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(challenge)}
                          className="border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                          title="Edit Challenge"
                        >
                          <Edit2 className="h-4 w-4 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete challenge "${challenge.name}"?`)) {
                              deleteChallengeMutation.mutate(challenge.id);
                            }
                          }}
                          className="border-red-900/50 hover:bg-red-950/60 text-red-400"
                          title="Delete Challenge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Problem Statement
                  </h4>
                  <p className="text-neutral-200 text-sm whitespace-pre-wrap leading-relaxed bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/80">
                    {challenge.problemStatement}
                  </p>
                </div>

                {/* Requirements & Constraints Grid */}
                {(challenge.requirements || challenge.constraints || challenge.expectedOutcome) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    {challenge.requirements && (
                      <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/60">
                        <span className="font-semibold text-neutral-400 block mb-1">Requirements</span>
                        <p className="text-neutral-300 whitespace-pre-wrap">{challenge.requirements}</p>
                      </div>
                    )}
                    {challenge.constraints && (
                      <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/60">
                        <span className="font-semibold text-neutral-400 block mb-1">Constraints</span>
                        <p className="text-neutral-300 whitespace-pre-wrap">{challenge.constraints}</p>
                      </div>
                    )}
                    {challenge.expectedOutcome && (
                      <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/60">
                        <span className="font-semibold text-neutral-400 block mb-1">Expected Outcome</span>
                        <p className="text-neutral-300 whitespace-pre-wrap">{challenge.expectedOutcome}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Resources */}
                {challenge.resources && challenge.resources.length > 0 && (
                  <div className="pt-2">
                    <h5 className="text-xs font-semibold text-neutral-400 mb-2 flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5 text-indigo-400" />
                      Attached Resources ({challenge.resources.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {challenge.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 text-indigo-300 text-xs transition"
                        >
                          <span>{res.title}</span>
                          <span className="text-neutral-500 font-mono text-[10px]">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Challenge Modal */}
      {(isCreateModalOpen || editingChallenge) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 bg-neutral-900 border-neutral-800 rounded-2xl shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingChallenge(null);
                }}
                className="text-neutral-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingChallenge) {
                  updateChallengeMutation.mutate({ challengeId: editingChallenge.id, payload: formData });
                } else {
                  createChallengeMutation.mutate(formData);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Challenge Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Autonomous Code Reviewer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Slug (Optional)
                  </label>
                  <Input
                    placeholder="e.g. autonomous-code-reviewer"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-neutral-950 border-neutral-800 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Problem Statement *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Define the primary core problem statement for this challenge..."
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Required functionality, architectural deliverables..."
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Constraints
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Performance budgets, latency ceilings, rate limits..."
                    value={formData.constraints}
                    onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Expected Outcome
                </label>
                <Input
                  placeholder="e.g. A functioning CLI, GitHub Action or containerized microservice"
                  value={formData.expectedOutcome}
                  onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Challenge Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: ChallengeStatus.DRAFT, label: 'DRAFT', desc: 'Internal draft' },
                    { value: ChallengeStatus.PUBLISHED, label: 'PUBLISHED', desc: 'Visible when hackathon published' },
                    { value: ChallengeStatus.ARCHIVED, label: 'ARCHIVED', desc: 'Archived challenge' },
                  ].map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: st.value })}
                      className={`p-3 rounded-xl border text-left transition ${
                        formData.status === st.value
                          ? 'border-indigo-500 bg-indigo-950/40 text-white'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="font-bold text-xs block">{st.label}</span>
                      <span className="text-[10px] text-neutral-400">{st.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources Management */}
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Resources & Documentation Links (Max 20)
                </label>

                {formData.resources.map((res, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                    <span className="text-xs font-medium text-white flex-1 truncate">{res.title}</span>
                    <span className="text-xs text-neutral-400 font-mono truncate flex-1">{res.url}</span>
                    <button
                      type="button"
                      onClick={() => removeResource(rIdx)}
                      className="text-red-400 hover:text-red-300 p-1 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Title (e.g. Dataset API)"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white text-xs flex-1"
                  />
                  <Input
                    placeholder="URL (https://...)"
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addResource}
                    className="border-neutral-700 text-neutral-300 text-xs shrink-0"
                  >
                    Add Resource
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingChallenge(null);
                  }}
                  className="border-neutral-700 text-neutral-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createChallengeMutation.isPending || updateChallengeMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {editingChallenge ? 'Save Changes' : 'Create Challenge'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Input, Card, Badge, Skeleton } from '@almosthack/ui';
import {
  ArrowLeft,
  Plus,
  Layers,
  Edit2,
  Trash2,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Target,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  HackathonEntity,
  HackathonLifecycleResponse,
  HackathonTrackEntity,
} from '@almosthack/types';

export default function HackathonTracksPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;

  // Modals & form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<HackathonTrackEntity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    isActive: true,
  });

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

  const { data: tracks = [], isLoading: isLoadingTracks } = useQuery<HackathonTrackEntity[]>({
    queryKey: ['hackathon-tracks', hackathonId],
    queryFn: async () => {
      const res = await apiClient.getHackathonTracks(hackathonId);
      return res.data;
    },
  });

  const effectiveStatus = lifecycle?.hackathonStatus || hackathon?.status;
  const isLocked =
    effectiveStatus === 'LIVE' ||
    effectiveStatus === 'COMPLETED' ||
    effectiveStatus === 'ARCHIVED';

  // Mutations
  const createTrackMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const res = await apiClient.createHackathonTrack(hackathonId, {
        name: payload.name,
        slug: payload.slug.trim() || undefined,
        shortDescription: payload.shortDescription.trim() || null,
        description: payload.description.trim() || null,
        isActive: payload.isActive,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-tracks', hackathonId] });
      setIsCreateModalOpen(false);
      setFormData({ name: '', slug: '', shortDescription: '', description: '', isActive: true });
      setSuccessMsg('Track created successfully.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create track.');
      setSuccessMsg(null);
    },
  });

  const updateTrackMutation = useMutation({
    mutationFn: async ({ trackId, payload }: { trackId: string; payload: typeof formData }) => {
      const res = await apiClient.updateHackathonTrack(hackathonId, trackId, {
        name: payload.name,
        slug: payload.slug.trim() || undefined,
        shortDescription: payload.shortDescription.trim() || null,
        description: payload.description.trim() || null,
        isActive: payload.isActive,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-tracks', hackathonId] });
      setEditingTrack(null);
      setSuccessMsg('Track updated successfully.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update track.');
      setSuccessMsg(null);
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const res = await apiClient.deleteHackathonTrack(hackathonId, trackId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-tracks', hackathonId] });
      setSuccessMsg('Track deleted successfully.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to delete track.');
      setSuccessMsg(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; displayOrder: number }[]) => {
      const res = await apiClient.reorderHackathonTracks(hackathonId, { items });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-tracks', hackathonId] });
      setSuccessMsg('Tracks reordered.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to reorder tracks.');
    },
  });

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (isLocked) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;

    const newTracks = [...tracks];
    const [moved] = newTracks.splice(index, 1);
    newTracks.splice(targetIndex, 0, moved);

    const items = newTracks.map((t, idx) => ({
      id: t.id,
      displayOrder: idx + 1,
    }));

    reorderMutation.mutate(items);
  };

  const openCreateModal = () => {
    setFormData({ name: '', slug: '', shortDescription: '', description: '', isActive: true });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (track: HackathonTrackEntity) => {
    setEditingTrack(track);
    setFormData({
      name: track.name,
      slug: track.slug,
      shortDescription: track.shortDescription || '',
      description: track.description || '',
      isActive: track.isActive,
    });
  };

  if (isLoadingHackathon || isLoadingTracks) {
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
              { label: 'Tracks & Challenges', href: `/hackathons/${hackathonId}/tracks` },
            ]}
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Layers className="h-8 w-8 text-indigo-400" />
            Hackathon Tracks
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/hackathons/${hackathonId}`)}
            className="border-neutral-700 hover:bg-neutral-800 text-neutral-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>

          {!isLocked && (
            <Button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Track
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

      {/* Lifecycle Locking Warning */}
      {isLocked && (
        <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-950/30 flex items-start gap-4">
          <Lock className="h-6 w-6 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-200 text-base">
              Track Structure Locked ({effectiveStatus})
            </h4>
            <p className="text-amber-300/80 text-sm mt-1">
              Tracks and challenges cannot be added, edited, deleted, or reordered while the hackathon is in{' '}
              <span className="font-semibold text-amber-200">{effectiveStatus}</span> status to maintain competition integrity.
            </p>
          </div>
        </div>
      )}

      {/* Tracks List */}
      <div className="space-y-4">
        {tracks.length === 0 ? (
          <Card className="p-12 text-center border-neutral-800 bg-neutral-900/50 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Layers className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No tracks configured yet</h3>
            <p className="text-neutral-400 max-w-md mx-auto mb-6 text-sm">
              Define tracks to group related problem statements and challenges for participants.
            </p>
            {!isLocked && (
              <Button
                onClick={openCreateModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Track
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {tracks.map((track, index) => (
              <Card
                key={track.id}
                className="p-6 border-neutral-800/80 bg-neutral-900/60 hover:border-neutral-700/80 transition-all rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center justify-center border border-neutral-700">
                      #{track.displayOrder || index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">{track.name}</h3>
                    <Badge variant="outline" className="text-neutral-400 font-mono text-xs border-neutral-700">
                      /{track.slug}
                    </Badge>
                    <Badge
                      className={
                        track.isActive
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }
                    >
                      {track.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                    <Badge className="bg-indigo-950/60 text-indigo-300 border-indigo-800/50 flex items-center gap-1.5">
                      <Target className="h-3 w-3" />
                      {track.challengesCount ?? 0} {track.challengesCount === 1 ? 'Challenge' : 'Challenges'}
                    </Badge>
                  </div>

                  {track.shortDescription && (
                    <p className="text-neutral-300 text-sm line-clamp-2">{track.shortDescription}</p>
                  )}
                </div>

                {/* Actions & Reordering */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
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
                        disabled={index === tracks.length - 1 || reorderMutation.isPending}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-neutral-800 transition"
                        title="Move Down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => router.push(`/hackathons/${hackathonId}/tracks/${track.id}`)}
                    className="bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-800/50 text-indigo-200 text-sm font-medium"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Manage Challenges
                  </Button>

                  {!isLocked && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(track)}
                        className="border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                        title="Edit Track"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete track "${track.name}" and all its challenges?`)) {
                            deleteTrackMutation.mutate(track.id);
                          }
                        }}
                        className="border-red-900/50 hover:bg-red-950/60 text-red-400"
                        title="Delete Track"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Track Modal */}
      {(isCreateModalOpen || editingTrack) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-neutral-900 border-neutral-800 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                {editingTrack ? 'Edit Track' : 'Create New Track'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingTrack(null);
                }}
                className="text-neutral-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingTrack) {
                  updateTrackMutation.mutate({ trackId: editingTrack.id, payload: formData });
                } else {
                  createTrackMutation.mutate(formData);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Track Name *
                </label>
                <Input
                  required
                  placeholder="e.g. AI & Machine Learning"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Slug (Optional - auto-generated from name)
                </label>
                <Input
                  placeholder="e.g. ai-machine-learning"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Short Description
                </label>
                <Input
                  placeholder="Brief summary for track cards (max 300 characters)"
                  maxLength={300}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed track description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-neutral-800 bg-neutral-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium text-neutral-300">
                  Track is Active (Visible to participants)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingTrack(null);
                  }}
                  className="border-neutral-700 text-neutral-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTrackMutation.isPending || updateTrackMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {editingTrack ? 'Save Changes' : 'Create Track'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

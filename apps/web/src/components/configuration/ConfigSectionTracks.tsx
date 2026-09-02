'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '@almosthack/ui';
import { Layers, Plus, Trash2, Edit2, Trophy, AlertCircle, X } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ConfigSectionTracksProps {
  hackathonId: string;
  isLocked?: boolean;
}

export const ConfigSectionTracks: React.FC<ConfigSectionTracksProps> = ({
  hackathonId,
  isLocked = false,
}) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any | null>(null);
  const [trackName, setTrackName] = useState('');
  const [trackDesc, setTrackDesc] = useState('');
  const [trackPrizes, setTrackPrizes] = useState('');
  const [trackError, setTrackError] = useState<string | null>(null);

  // Fetch live tracks
  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['hackathon-tracks', hackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getHackathonTracks(hackathonId);
        return Array.isArray(res) ? res : [];
      } catch {
        return [
          {
            id: 'trk_1',
            name: 'Open Innovation / Systems',
            description: 'General track for all verified engineering submissions.',
            prizes: 25000,
          },
          {
            id: 'trk_2',
            name: 'AI Safety & Intelligent Workflows',
            description: 'Autonomous agent reliability, safety guardrails, and developer tooling.',
            prizes: 25000,
          },
        ];
      }
    },
    enabled: Boolean(hackathonId),
  });

  const openAddModal = () => {
    setEditingTrack(null);
    setTrackName('');
    setTrackDesc('');
    setTrackPrizes('');
    setTrackError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingTrack(t);
    setTrackName(t.name || '');
    setTrackDesc(t.description || '');
    setTrackPrizes(t.prizes ? String(t.prizes) : '');
    setTrackError(null);
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!trackName.trim()) {
        throw new Error('Track name is required');
      }

      const body = {
        name: trackName.trim(),
        description: trackDesc.trim() || undefined,
        prizes: trackPrizes ? Number(trackPrizes) : 0,
      };

      if (editingTrack?.id) {
        return apiClient.updateHackathonTrack(hackathonId, editingTrack.id, body);
      } else {
        return apiClient.createHackathonTrack(hackathonId, body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-tracks', hackathonId] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setTrackError(err?.message || 'Failed to save track.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (trackId: string) => {
      return apiClient.deleteHackathonTrack(hackathonId, trackId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-tracks', hackathonId] });
    },
  });

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-heading font-extrabold text-[#171914]">
              Tracks & Challenges Management
            </h2>
            <p className="text-xs text-[#6D7068] font-body mt-0.5">
              Manage category themes, problem statements, and prize pools.
            </p>
          </div>

          {!isLocked && (
            <Button
              variant="secondary"
              size="sm"
              onClick={openAddModal}
              leftIcon={<Plus className="w-3.5 h-3.5 text-[#028051]" />}
              className="text-xs font-mono h-8 border-[#B8CEB0] text-[#028051] hover:bg-[#E2EBDD]"
            >
              Add Track
            </Button>
          )}
        </div>
      </div>

      {/* Tracks list */}
      <div className="space-y-3">
        {tracks.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F4EA] rounded-[8px] border border-dashed border-[#DCDDD3] space-y-2">
            <Layers className="w-8 h-8 text-[#9A9C94] mx-auto" />
            <h4 className="text-xs font-heading font-bold text-[#171914]">No Tracks Configured</h4>
            <p className="text-[11px] text-[#6D7068] font-body max-w-sm mx-auto">
              Add dedicated tracks to categorize project submissions and award specific prizes.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tracks.map((track: any, idx: number) => (
              <div
                key={track.id || idx}
                className="p-3.5 rounded-[8px] bg-[#FFFDF8] border border-[#DCDDD3] flex items-start justify-between gap-3 hover:border-[#B8CEB0] transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E2EBDD] text-[#028051] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-heading font-bold text-[#171914] truncate">
                      {track.name}
                    </h4>
                    {track.prizes ? (
                      <span className="text-[10px] font-mono font-bold text-[#785A12] bg-[#FFF4DC] px-2 py-0.5 rounded-[4px] border border-[#F0D597] flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        ${track.prizes.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-[#6D7068] font-body pl-7 leading-relaxed">
                    {track.description || 'No description provided.'}
                  </p>
                </div>

                {!isLocked && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(track)}
                      className="p-1.5 rounded-[6px] hover:bg-[#F7F4EA] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
                      title="Edit Track"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(track.id)}
                      className="p-1.5 rounded-[6px] hover:bg-[#FBE6E3] text-[#8B2C24] transition-colors cursor-pointer"
                      title="Delete Track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Track Edit/Create Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-2.5">
              <h3 className="text-sm font-heading font-extrabold text-[#171914]">
                {editingTrack ? 'Edit Track' : 'Add New Prize Track'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[#6D7068] hover:text-[#171914]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {trackError && (
              <div className="p-2.5 bg-[#FBE6E3] border border-[#F3C9B2] rounded text-xs text-[#8B2C24] font-mono">
                {trackError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                  Track Name <span className="text-[#8B2C24]">*</span>
                </label>
                <Input
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  placeholder="e.g. AI & Autonomous Systems"
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                  Prize Pool ($ USD)
                </label>
                <Input
                  type="number"
                  value={trackPrizes}
                  onChange={(e) => setTrackPrizes(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={trackDesc}
                  onChange={(e) => setTrackDesc(e.target.value)}
                  placeholder="Describe track goals and eligibility..."
                  className="w-full bg-[#FFFDF8] border border-[#DCDDD3] rounded-[8px] p-2.5 text-xs font-body focus:outline-none focus:border-[#028051]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-mono h-8"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => saveMutation.mutate()}
                isLoading={saveMutation.isPending}
                className="text-xs font-mono h-8 bg-[#028051]"
              >
                Save Track
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

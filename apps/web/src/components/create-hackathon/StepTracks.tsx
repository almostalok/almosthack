'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '@almosthack/ui';
import { Layers, Plus, Trash2, Trophy, Sparkles } from 'lucide-react';

export interface TrackItem {
  id: string;
  name: string;
  description: string;
  prizes?: number;
}

export interface StepTracksProps {
  tracks: TrackItem[];
  onChange: (tracks: TrackItem[]) => void;
  errors: Record<string, string>;
}

export const StepTracks: React.FC<StepTracksProps> = ({ tracks, onChange, errors }) => {
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');
  const [newTrackPrize, setNewTrackPrize] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTrack = () => {
    if (!newTrackName.trim()) return;

    const newTrack: TrackItem = {
      id: `trk_${Date.now()}`,
      name: newTrackName.trim(),
      description: newTrackDesc.trim() || 'General problem statement and track requirements.',
      prizes: newTrackPrize ? Number(newTrackPrize) : 0,
    };

    onChange([...tracks, newTrack]);
    setNewTrackName('');
    setNewTrackDesc('');
    setNewTrackPrize('');
    setIsAdding(false);
  };

  const handleRemoveTrack = (id: string) => {
    onChange(tracks.filter((t) => t.id !== id));
  };

  const handleAddPreset = (name: string, desc: string, prizes: number) => {
    if (tracks.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;
    onChange([
      ...tracks,
      {
        id: `trk_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        name,
        description: desc,
        prizes,
      },
    ]);
  };

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#171914]">
              Step 5: Tracks & Challenge Themes
            </h2>
            <p className="text-xs text-[#6D7068] font-body mt-0.5">
              Organize hackathon submissions into dedicated prize tracks and problem statements.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#028051] bg-[#E2EBDD] px-2.5 py-1 rounded-[6px] border border-[#B8CEB0]">
            {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Track List */}
        {tracks.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F4EA] rounded-[8px] border border-dashed border-[#DCDDD3] space-y-3">
            <Layers className="w-8 h-8 text-[#9A9C94] mx-auto" />
            <div>
              <h4 className="text-xs font-heading font-bold text-[#171914]">No Tracks Added Yet</h4>
              <p className="text-[11px] text-[#6D7068] font-body">
                Add at least one track so builders know what categories they can build for.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tracks.map((track, idx) => (
              <div
                key={track.id}
                className="p-3.5 rounded-[8px] bg-[#FFFDF8] border border-[#DCDDD3] hover:border-[#B8CEB0] transition-colors flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1 min-w-0">
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
                  <p className="text-[11px] text-[#6D7068] font-body leading-relaxed pl-7">
                    {track.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveTrack(track.id)}
                  className="p-1.5 rounded-[6px] hover:bg-[#FBE6E3] text-[#8B2C24] transition-colors shrink-0 cursor-pointer"
                  title="Remove Track"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Track Form/Drawer */}
        {isAdding ? (
          <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#B8CEB0] space-y-3 animate-in fade-in duration-150">
            <h4 className="text-xs font-mono font-bold uppercase text-[#171914]">Add New Track</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                  Track Name <span className="text-[#8B2C24]">*</span>
                </label>
                <Input
                  placeholder="e.g. AI & Autonomous Agents"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                  Prize Pool ($ USD)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 25000"
                  value={newTrackPrize}
                  onChange={(e) => setNewTrackPrize(e.target.value)}
                  className="w-full text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                Description & Criteria
              </label>
              <textarea
                rows={2}
                placeholder="What projects fit into this track?"
                value={newTrackDesc}
                onChange={(e) => setNewTrackDesc(e.target.value)}
                className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-body rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs font-mono h-8"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddTrack}
                disabled={!newTrackName.trim()}
                className="text-xs font-mono h-8 bg-[#028051]"
              >
                Save Track
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAdding(true)}
            leftIcon={<Plus className="w-4 h-4 text-[#028051]" />}
            className="w-full text-xs font-mono border-dashed border-[#B8CEB0] h-9 hover:bg-[#E2EBDD]/40"
          >
            Add Track
          </Button>
        )}

        {/* Preset suggestion chips */}
        <div className="pt-2 border-t border-[#DCDDD3]/70">
          <span className="text-[10px] font-mono uppercase font-bold text-[#6D7068] block mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#028051]" /> Quick Track Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              {
                name: 'Open Innovation / General',
                desc: 'Unrestricted track for open builder creativity.',
                prizes: 10000,
              },
              {
                name: 'Decentralized Infrastructure & Zero Knowledge',
                desc: 'ZK proofs, cryptography, and verifiable state systems.',
                prizes: 25000,
              },
              {
                name: 'AI Safety & Intelligent Workflows',
                desc: 'Autonomous agent reliability, safety guardrails, and developer tooling.',
                prizes: 25000,
              },
            ].map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddPreset(preset.name, preset.desc, preset.prizes)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] hover:border-[#028051] hover:text-[#028051] transition-colors cursor-pointer text-left"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

'use client';

import React, { useState } from 'react';
import { Button, Input } from '@almosthack/ui';
import { Users2, X, Plus } from 'lucide-react';

export interface CreateTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, trackId?: string, captainName?: string) => void;
  isCreating: boolean;
  tracks: { id: string; name: string }[];
}

export const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
  isCreating,
  tracks,
}) => {
  const [teamName, setTeamName] = useState('');
  const [trackId, setTrackId] = useState(tracks[0]?.id || '');
  const [captainName, setCaptainName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError('Team name is required.');
      return;
    }
    onCreate(teamName.trim(), trackId || undefined, captainName.trim() || undefined);
    setTeamName('');
    setCaptainName('');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-team-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="create-team-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Create New Team Squad
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Establish a new participant team inside this hackathon.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6D7068] hover:text-[#171914] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-[#FBE6E3] border border-[#F3C9B2] rounded text-xs text-[#8B2C24] font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
              Team Name <span className="text-[#8B2C24]">*</span>
            </label>
            <Input
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. ByteForge"
              className="w-full text-xs font-heading font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
              Assigned Track
            </label>
            <select
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="w-full bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] p-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
            >
              <option value="">General / Unassigned</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
              Team Captain / Initial Lead Name
            </label>
            <Input
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="text-xs font-mono h-8"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isCreating}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
            >
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

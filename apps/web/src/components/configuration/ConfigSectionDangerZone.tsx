'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '@almosthack/ui';
import { AlertTriangle, Archive, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { useRouter } from 'next/navigation';

export interface ConfigSectionDangerZoneProps {
  hackathonId: string;
  hackathonName: string;
}

export const ConfigSectionDangerZone: React.FC<ConfigSectionDangerZoneProps> = ({
  hackathonId,
  hackathonName,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const archiveMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      if (confirmText.trim() !== hackathonName.trim()) {
        throw new Error(`Type exact name "${hackathonName}" to confirm archiving.`);
      }
      return apiClient.archiveHackathon(hackathonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      router.push(`/hackathons/${hackathonId}`);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to archive hackathon.');
    },
  });

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#F3C9B2] shadow-xs text-left space-y-6">
      <div className="border-b border-[#F3C9B2] pb-3">
        <div className="flex items-center gap-2 text-[#8B2C24]">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-base font-heading font-extrabold">
            Danger Zone & Irreversible Actions
          </h2>
        </div>
        <p className="text-xs text-[#8B2C24]/80 font-body mt-0.5">
          High-impact operations that restrict future participant registration and freeze editing.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#FBE6E3] border border-[#F3C9B2] rounded-[8px] text-xs font-mono text-[#8B2C24]">
          {errorMsg}
        </div>
      )}

      {/* Archive Card */}
      <div className="p-4 rounded-[8px] bg-[#FBE6E3]/40 border border-[#F3C9B2] space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-heading font-bold text-[#171914] flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-[#8B2C24]" />
              Archive Hackathon Workspace
            </h3>
            <p className="text-[11px] text-[#6D7068] font-body max-w-xl">
              Archiving closes registrations, prevents new project commits, and locks all criteria
              weights into read-only immutable mode.
            </p>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <label className="block text-[11px] font-mono text-[#171914]">
            To confirm archiving, type <strong className="select-all text-[#8B2C24]">{hackathonName}</strong> below:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type hackathon name exactly"
              className="text-xs font-mono max-w-sm"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => archiveMutation.mutate()}
              disabled={confirmText.trim() !== hackathonName.trim() || archiveMutation.isPending}
              isLoading={archiveMutation.isPending}
              className="text-xs font-mono h-8 border-[#F3C9B2] text-[#8B2C24] hover:bg-[#FBE6E3]"
            >
              Archive Hackathon
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

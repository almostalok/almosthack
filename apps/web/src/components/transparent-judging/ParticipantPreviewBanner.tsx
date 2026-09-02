'use client';

import React from 'react';
import { Eye, ShieldCheck, ArrowRight, Sliders } from 'lucide-react';
import { Button } from '@almosthack/ui';

export interface ParticipantPreviewBannerProps {
  isParticipantPreview: boolean;
  onToggleViewMode: () => void;
}

export const ParticipantPreviewBanner: React.FC<ParticipantPreviewBannerProps> = ({
  isParticipantPreview,
  onToggleViewMode,
}) => {
  if (!isParticipantPreview) {
    return (
      <div className="p-3.5 bg-[#FFF4DC] border border-[#F0D597] rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 font-mono text-[#785A12]">
          <Sliders className="w-4 h-4 shrink-0 text-[#D97706]" />
          <span>
            <strong>ORGANIZER AUDIT MODE:</strong> Viewing internal reviewer records, unmasked feedback, and consensus audit markers.
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleViewMode}
          leftIcon={<Eye className="w-3.5 h-3.5 text-[#028051]" />}
          className="text-xs font-mono h-7 shrink-0 border-[#F0D597] text-[#785A12] hover:bg-[#F7F4EA]"
        >
          Switch to Participant Preview
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-[#E2EBDD] border border-[#B8CEB0] rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
      <div className="flex items-center gap-2.5 font-mono text-[#274535]">
        <ShieldCheck className="w-4 h-4 shrink-0 text-[#028051]" />
        <span>
          <strong>PARTICIPANT PREVIEW MODE:</strong> This is the verified transparent evaluation ledger displayed to the project team.
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggleViewMode}
        leftIcon={<Sliders className="w-3.5 h-3.5 text-[#6D7068]" />}
        className="text-xs font-mono h-7 shrink-0 border-[#B8CEB0] text-[#274535] hover:bg-[#FFFDF8]"
      >
        Switch to Organizer Audit
      </Button>
    </div>
  );
};

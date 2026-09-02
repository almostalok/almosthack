'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Layers, Clock, ShieldCheck } from 'lucide-react';
import { Card, Badge, Button } from '@almosthack/ui';
import { ActiveHackathonContext } from './dashboard-mock-data';

export interface HackathonStatusCardProps {
  hackathon: ActiveHackathonContext;
  hasMultipleHackathons?: boolean;
}

export const HackathonStatusCard: React.FC<HackathonStatusCardProps> = ({
  hackathon,
  hasMultipleHackathons = true,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            <span className="w-2 h-2 rounded-full bg-[#028051] animate-pulse" />
            LIVE
          </span>
        );
      case 'JUDGING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            JUDGING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E8EDF5] text-[#243F60] border border-[#BACDE2]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F0ECE1] text-[#6D7068] border border-[#DCDDD3]">
            <span className="w-2 h-2 rounded-full bg-[#9A9C94]" />
            DRAFT
          </span>
        );
    }
  };

  return (
    <Card className="p-4 sm:p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Hackathon Identity & Status */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
              {hackathon.name}
            </h2>
            {getStatusBadge(hackathon.status)}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6D7068] font-body">
            <span className="flex items-center gap-1.5 font-mono text-[#171914]">
              <Clock className="w-3.5 h-3.5 text-[#028051]" />
              <span className="font-semibold">{hackathon.timeRemainingLabel}</span>
            </span>
            <span className="hidden sm:inline text-[#DCDDD3]">|</span>
            <span className="text-[#6D7068] truncate">{hackathon.organization}</span>
            {hasMultipleHackathons && (
              <>
                <span className="hidden sm:inline text-[#DCDDD3]">|</span>
                <span className="text-[11px] font-mono text-[#9A9C94]">Active Workspace Context</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Direct Manage CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={hackathon.primaryActionHref}>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 text-xs font-mono font-semibold border-[#DCDDD3] hover:border-[#355C45] hover:bg-[#F7F4EA]"
            >
              <span>{hackathon.primaryActionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#028051]" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

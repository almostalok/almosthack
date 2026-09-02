'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Calendar,
  Users,
  Settings,
  ExternalLink,
  Sliders,
  MoreVertical,
  Copy,
  Archive,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { Button, Badge, Card } from '@almosthack/ui';
import { WorkspaceHackathonData } from './workspace-mock-data';

export interface HackathonWorkspaceHeaderProps {
  hackathon: WorkspaceHackathonData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const HackathonWorkspaceHeader: React.FC<HackathonWorkspaceHeaderProps> = ({
  hackathon,
  onRefresh,
  isRefreshing,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusBadge = (status: WorkspaceHackathonData['status']) => {
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
    <div className="space-y-3 pb-3 border-b border-[#DCDDD3] text-left">
      {/* Top Identity & Action Buttons Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
              {hackathon.name}
            </h1>
            {getStatusBadge(hackathon.status)}
            <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-mono text-[#6D7068] bg-[#F7F4EA] border border-[#DCDDD3]">
              {hackathon.format === 'ONLINE' ? 'Virtual' : 'In-Person'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6D7068] font-body">
            <span className="flex items-center gap-1.5 font-mono text-[#171914]">
              <Calendar className="w-3.5 h-3.5 text-[#028051]" />
              <span className="font-semibold">{hackathon.dateRangeLabel}</span>
            </span>
            <span className="hidden sm:inline text-[#DCDDD3]">|</span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#9A9C94]" />
              <span>{hackathon.location}</span>
            </span>
            <span className="hidden sm:inline text-[#DCDDD3]">|</span>
            <span className="flex items-center gap-1.5 font-mono text-[#028051] font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{hackathon.participantCount} builders enrolled</span>
            </span>
          </div>
        </div>

        {/* Primary & Overflow Actions */}
        <div className="flex items-center gap-2 shrink-0 relative">
          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-1.5 text-xs text-[#6D7068] h-8 px-2.5"
              title="Refresh workspace telemetry"
              aria-label="Refresh workspace telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}

          <Link href={`/hackathons/${hackathon.id}/configuration`}>
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-mono h-8 px-3">
              <Sliders className="w-3.5 h-3.5 text-[#028051]" />
              <span>Configuration</span>
            </Button>
          </Link>

          <Link href={`/hackathons/${hackathon.id}/leaderboard`}>
            <Button variant="primary" size="sm" className="gap-1.5 text-xs font-mono h-8 px-3 shadow-xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </Button>
          </Link>

          {/* More actions dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-[6px] border border-[#DCDDD3] hover:bg-[#F7F4EA] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
              aria-label="More workspace options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-48 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[8px] shadow-lg py-1 z-30 font-body text-xs text-[#171914] animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                <Link
                  href={`/hackathons/${hackathon.id}/settings`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-[#F7F4EA] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#6D7068]" />
                  <span>Workspace Settings</span>
                </Link>
                <Link
                  href={`/hackathons/${hackathon.id}/integrity`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-[#F7F4EA] transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#6D7068]" />
                  <span>Audit Logs & Ledger</span>
                </Link>
                <div className="border-t border-[#DCDDD3] my-1" />
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[#8B2C24] hover:bg-[#FBE6E3] transition-colors text-left"
                >
                  <Archive className="w-3.5 h-3.5 text-[#8B2C24]" />
                  <span>Archive Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

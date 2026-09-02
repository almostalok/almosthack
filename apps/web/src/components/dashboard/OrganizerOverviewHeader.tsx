'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Trophy } from 'lucide-react';
import { Button, Badge } from '@almosthack/ui';
import { ActiveHackathonContext } from './dashboard-mock-data';

export interface OrganizerOverviewHeaderProps {
  userName?: string;
  activeHackathon: ActiveHackathonContext;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const OrganizerOverviewHeader: React.FC<OrganizerOverviewHeaderProps> = ({
  userName = 'Alok',
  activeHackathon,
  onRefresh,
  isRefreshing,
}) => {
  // Derive greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getGreeting();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCDDD3]/80 text-left">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
            {greeting}, {userName}.
          </h1>
          <Badge variant="accent" size="sm" className="hidden sm:inline-flex">
            ORGANIZER
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#6D7068] font-body">
          Here&apos;s what&apos;s happening with your hackathons today.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-1.5 text-xs text-[#6D7068]"
            title="Refresh dashboard data"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}

        <Link href="/organizations/new">
          <Button variant="primary" size="sm" className="gap-1.5 text-xs shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Hackathon</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

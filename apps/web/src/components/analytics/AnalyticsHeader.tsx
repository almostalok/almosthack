'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  ArrowLeft,
  Download,
  Calendar,
  Layers,
  Table as TableIcon,
  PieChart as ChartIcon,
} from 'lucide-react';
import { Button, Breadcrumbs } from '@almosthack/ui';
import { AnalyticsFilterState, AnalyticsTimeframe } from './analytics-types';
import { HackathonTrackEntity } from '@almosthack/types';

export interface AnalyticsHeaderProps {
  hackathonId: string;
  hackathonName?: string;
  filters: AnalyticsFilterState;
  onUpdateFilters: (updates: Partial<AnalyticsFilterState>) => void;
  tracks: HackathonTrackEntity[];
  onExportCsv: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  hackathonId,
  hackathonName,
  filters,
  onUpdateFilters,
  tracks,
  onExportCsv,
}) => {
  const router = useRouter();

  const breadcrumbs = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathonName || 'Workspace', href: `/hackathons/${hackathonId}` },
    { label: 'Analytics & Insights', active: true },
  ];

  return (
    <div className="space-y-4 pb-4 border-b border-[#DCDDD3] text-left">
      <Breadcrumbs items={breadcrumbs} className="text-xs" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#028051]" />
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
              Hackathon Analytics & Insights
            </h1>
          </div>
          <p className="text-xs text-[#6D7068] font-body">
            Operational telemetry, conversion funnels, submission velocities, and reviewer workload metrics.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Timeframe Select */}
          <div className="relative">
            <select
              value={filters.timeframe}
              onChange={(e) =>
                onUpdateFilters({ timeframe: e.target.value as AnalyticsTimeframe })
              }
              aria-label="Filter timeframe"
              className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] py-1.5 px-3 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
            >
              <option value="EVENT">Full Event Lifecycle</option>
              <option value="7D">Past 7 Days</option>
              <option value="30D">Past 30 Days</option>
            </select>
          </div>

          {/* Track Filter */}
          <div className="relative">
            <select
              value={filters.trackId}
              onChange={(e) => onUpdateFilters({ trackId: e.target.value })}
              aria-label="Filter track"
              className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] py-1.5 px-3 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
            >
              <option value="ALL">All Tracks</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] p-0.5">
            <button
              type="button"
              onClick={() => onUpdateFilters({ viewMode: 'CHARTS' })}
              title="Visual Charts View"
              className={`p-1.5 rounded-[4px] text-xs flex items-center gap-1 font-mono font-bold cursor-pointer transition-colors ${
                filters.viewMode === 'CHARTS'
                  ? 'bg-[#FFFDF8] text-[#171914] shadow-2xs'
                  : 'text-[#6D7068] hover:text-[#171914]'
              }`}
            >
              <ChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateFilters({ viewMode: 'TABLES' })}
              title="Data Table / Accessibility View"
              className={`p-1.5 rounded-[4px] text-xs flex items-center gap-1 font-mono font-bold cursor-pointer transition-colors ${
                filters.viewMode === 'TABLES'
                  ? 'bg-[#FFFDF8] text-[#171914] shadow-2xs'
                  : 'text-[#6D7068] hover:text-[#171914]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export CSV */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5 text-[#6D7068]" />}
            className="text-xs font-mono h-8"
          >
            Export CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/hackathons/${hackathonId}`)}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8"
          >
            Workspace
          </Button>
        </div>
      </div>
    </div>
  );
};

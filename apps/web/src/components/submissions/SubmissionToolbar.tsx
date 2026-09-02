'use client';

import React from 'react';
import { Search, X, Download, Filter, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { SubmissionFilterState } from './submissions-types';

export interface SubmissionToolbarProps {
  filters: SubmissionFilterState;
  onFilterChange: (updates: Partial<SubmissionFilterState>) => void;
  onResetFilters: () => void;
  tracks: { id: string; name: string }[];
  totalFilteredCount: number;
  onExportCsv: () => void;
}

export const SubmissionToolbar: React.FC<SubmissionToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  tracks,
  totalFilteredCount,
  onExportCsv,
}) => {
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0) +
    (filters.trackId !== 'ALL' ? 1 : 0) +
    (filters.readiness !== 'ALL' ? 1 : 0) +
    (filters.repoFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="p-3.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
      {/* Left: Search + Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search */}
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="w-3.5 h-3.5 text-[#6D7068] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search project, team, repo, author..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-8 pr-7 py-1.5 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#9A9C94] focus:outline-none focus:border-[#028051] focus:bg-[#FFFDF8]"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6D7068] hover:text-[#171914]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-1">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
          >
            <option value="ALL">All Statuses</option>
            <option value="FINALIZED">Finalized</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="DRAFT">Draft / In Progress</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>

        {/* Readiness Dropdown */}
        <div className="flex items-center gap-1">
          <select
            value={filters.readiness}
            onChange={(e) => onFilterChange({ readiness: e.target.value })}
            className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
          >
            <option value="ALL">All Readiness</option>
            <option value="READY">Ready for Judging</option>
            <option value="NEEDS_ATTENTION">Needs Attention</option>
          </select>
        </div>

        {/* Track Dropdown */}
        {tracks.length > 0 && (
          <div className="flex items-center gap-1">
            <select
              value={filters.trackId}
              onChange={(e) => onFilterChange({ trackId: e.target.value })}
              className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] max-w-[170px] truncate"
            >
              <option value="ALL">All Tracks</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Repo Verification Dropdown */}
        <div className="flex items-center gap-1">
          <select
            value={filters.repoFilter}
            onChange={(e) => onFilterChange({ repoFilter: e.target.value })}
            className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
          >
            <option value="ALL">All Repositories</option>
            <option value="VERIFIED">Verified Repo Only</option>
            <option value="MISSING">Missing Repo</option>
          </select>
        </div>

        {/* Reset */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-mono text-[#8B2C24] hover:underline px-2 py-1 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* Right: Export & Count */}
      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#DCDDD3]">
        <span className="text-xs font-mono text-[#6D7068]">
          Showing <strong className="text-[#171914]">{totalFilteredCount}</strong> submissions
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={onExportCsv}
          leftIcon={<Download className="w-3.5 h-3.5 text-[#028051]" />}
          className="text-xs font-mono h-8 border-[#B8CEB0] text-[#028051] hover:bg-[#E2EBDD]"
        >
          Export CSV
        </Button>
      </div>
    </div>
  );
};

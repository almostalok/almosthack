'use client';

import React from 'react';
import { Search, X, Download, Filter, Users2, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { RegistrationFilterState } from './registrations-types';

export interface RegistrationToolbarProps {
  filters: RegistrationFilterState;
  onFilterChange: (updates: Partial<RegistrationFilterState>) => void;
  onResetFilters: () => void;
  tracks: { id: string; name: string }[];
  selectedCount: number;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onClearSelection: () => void;
  onExport: () => void;
  isExporting: boolean;
  totalFilteredCount: number;
}

export const RegistrationToolbar: React.FC<RegistrationToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  tracks,
  selectedCount,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  onExport,
  isExporting,
  totalFilteredCount,
}) => {
  // Compute number of active non-default filters
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0) +
    (filters.teamStatus !== 'ALL' ? 1 : 0) +
    (filters.trackId !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Contextual Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="p-3 bg-[#E2EBDD] border border-[#B8CEB0] rounded-[10px] flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#028051] text-white text-xs font-mono font-bold flex items-center justify-center">
              {selectedCount}
            </span>
            <span className="text-xs font-heading font-bold text-[#274535]">
              {selectedCount} {selectedCount === 1 ? 'participant' : 'participants'} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={onBulkApprove}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-7 bg-[#028051] hover:bg-[#355C45]"
            >
              Approve ({selectedCount})
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onBulkReject}
              leftIcon={<XCircle className="w-3.5 h-3.5 text-[#8B2C24]" />}
              className="text-xs font-mono h-7 border-[#F3C9B2] text-[#8B2C24] hover:bg-[#FBE6E3]"
            >
              Reject ({selectedCount})
            </Button>

            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs font-mono text-[#274535] hover:underline px-2 py-1 cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Filter Toolbar */}
      <div className="p-3 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
        {/* Left Side: Search + Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-[#6D7068] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, email, college, team..."
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

          {/* Team Filter */}
          <div className="flex items-center gap-1">
            <Users2 className="w-3.5 h-3.5 text-[#6D7068] hidden sm:inline" />
            <select
              value={filters.teamStatus}
              onChange={(e) => onFilterChange({ teamStatus: e.target.value })}
              className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
            >
              <option value="ALL">All Teams</option>
              <option value="HAS_TEAM">In a Team</option>
              <option value="NO_TEAM">Solo / No Team</option>
            </select>
          </div>

          {/* Track Filter */}
          {tracks.length > 0 && (
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#6D7068] hidden sm:inline" />
              <select
                value={filters.trackId}
                onChange={(e) => onFilterChange({ trackId: e.target.value })}
                className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] max-w-[180px] truncate"
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

          {/* Reset button if active filters */}
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

        {/* Right Side: Total Count + Export CSV */}
        <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#DCDDD3]">
          <span className="text-xs font-mono text-[#6D7068]">
            Showing <strong className="text-[#171914]">{totalFilteredCount}</strong> builders
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            isLoading={isExporting}
            leftIcon={<Download className="w-3.5 h-3.5 text-[#6D7068]" />}
            className="text-xs font-mono h-8"
          >
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

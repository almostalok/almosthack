'use client';

import React from 'react';
import { Search, X, Plus, Filter, Users2, UserX, Layers, Shield } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { TeamFilterState } from './teams-types';

export interface TeamToolbarProps {
  filters: TeamFilterState;
  onFilterChange: (updates: Partial<TeamFilterState>) => void;
  onResetFilters: () => void;
  tracks: { id: string; name: string }[];
  teamsCount: number;
  unassignedCount: number;
  onCreateTeam: () => void;
  totalFilteredCount: number;
}

export const TeamToolbar: React.FC<TeamToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  tracks,
  teamsCount,
  unassignedCount,
  onCreateTeam,
  totalFilteredCount,
}) => {
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0) +
    (filters.sizeFilter !== 'ALL' ? 1 : 0) +
    (filters.trackId !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Primary Tab Switcher */}
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'TEAMS', page: 1 })}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filters.tab === 'TEAMS'
                ? 'bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]'
                : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Formed Teams ({teamsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'UNASSIGNED', page: 1 })}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filters.tab === 'UNASSIGNED'
                ? 'bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]'
                : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Unassigned Builders ({unassignedCount})</span>
          </button>
        </div>

        {filters.tab === 'TEAMS' && (
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateTeam}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Create Team
          </Button>
        )}
      </div>

      {/* Main Filter Toolbar */}
      <div className="p-3 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
        {/* Left Side: Search + Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-[#6D7068] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={
                filters.tab === 'TEAMS'
                  ? 'Search team, member, track, college...'
                  : 'Search unassigned builder by name, skills...'
              }
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

          {filters.tab === 'TEAMS' && (
            <>
              {/* Sizing Filter */}
              <div className="flex items-center gap-1">
                <select
                  value={filters.sizeFilter}
                  onChange={(e) => onFilterChange({ sizeFilter: e.target.value })}
                  className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
                >
                  <option value="ALL">All Squad Sizes</option>
                  <option value="FULL">Full Squads</option>
                  <option value="HAS_SLOTS">Has Open Slots</option>
                  <option value="BELOW_MIN">Below Min Size</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1">
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange({ status: e.target.value })}
                  className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active (Open)</option>
                  <option value="LOCKED">Locked</option>
                  <option value="DISSOLVED">Disbanded</option>
                </select>
              </div>

              {/* Track Filter */}
              {tracks.length > 0 && (
                <div className="flex items-center gap-1">
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
            </>
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

        {/* Right Side: Total Count */}
        <div className="text-xs font-mono text-[#6D7068] shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#DCDDD3]">
          Showing <strong className="text-[#171914]">{totalFilteredCount}</strong>{' '}
          {filters.tab === 'TEAMS' ? 'teams' : 'unassigned builders'}
        </div>
      </div>
    </div>
  );
};

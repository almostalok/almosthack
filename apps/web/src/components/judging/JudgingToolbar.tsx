'use client';

import React from 'react';
import {
  Users2,
  FileCode2,
  CheckCircle2,
  Sliders,
  Search,
  X,
  UserPlus,
  Play,
  Pause,
  Lock,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { JudgingFilterState, JudgingLifecycleState } from './judging-types';

export interface JudgingToolbarProps {
  filters: JudgingFilterState;
  onFilterChange: (updates: Partial<JudgingFilterState>) => void;
  onResetFilters: () => void;
  judgesCount: number;
  submissionsCount: number;
  evaluationsCount: number;
  lifecycleState: JudgingLifecycleState;
  onOpenAssignDialog: () => void;
  onOpenLifecycleDialog: () => void;
}

export const JudgingToolbar: React.FC<JudgingToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  judgesCount,
  submissionsCount,
  evaluationsCount,
  lifecycleState,
  onOpenAssignDialog,
  onOpenLifecycleDialog,
}) => {
  return (
    <div className="space-y-3">
      {/* Primary Tab Switcher + Action CTA buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD3] pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'OVERVIEW', page: 1 })}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filters.tab === 'OVERVIEW'
                ? 'bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]'
                : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Overview & Rubric</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'JUDGES', page: 1 })}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filters.tab === 'JUDGES'
                ? 'bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]'
                : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Judges Roster ({judgesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'SUBMISSIONS', page: 1 })}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filters.tab === 'SUBMISSIONS'
                ? 'bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]'
                : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Submissions Progress ({submissionsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'EVALUATIONS', page: 1 })}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filters.tab === 'EVALUATIONS'
                ? 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Evaluations Log ({evaluationsCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenLifecycleDialog}
            leftIcon={
              lifecycleState === 'OPEN' ? (
                <Pause className="w-3.5 h-3.5 text-[#D97706]" />
              ) : (
                <Play className="w-3.5 h-3.5 text-[#028051]" />
              )
            }
            className="text-xs font-mono h-8"
          >
            {lifecycleState === 'OPEN' ? 'Pause / Close Judging' : 'Start Judging'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAssignDialog}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Assign Judges
          </Button>
        </div>
      </div>

      {/* Filter Row (visible when tab is not OVERVIEW) */}
      {filters.tab !== 'OVERVIEW' && (
        <div className="p-3 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[200px] max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-[#6D7068] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  filters.tab === 'JUDGES'
                    ? 'Search judges by name, email, org...'
                    : filters.tab === 'SUBMISSIONS'
                    ? 'Search submissions, team, judge...'
                    : 'Search evaluations...'
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

            {filters.tab === 'JUDGES' && (
              <select
                value={filters.judgeStatus}
                onChange={(e) => onFilterChange({ judgeStatus: e.target.value })}
                className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
              >
                <option value="ALL">All Performance Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_TRACK">On Track</option>
                <option value="BEHIND">Behind / Overdue</option>
              </select>
            )}

            {filters.tab === 'SUBMISSIONS' && (
              <select
                value={filters.submissionStatus}
                onChange={(e) => onFilterChange({ submissionStatus: e.target.value })}
                className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
              >
                <option value="ALL">All Evaluation States</option>
                <option value="COMPLETE">Complete (All Evaluations In)</option>
                <option value="IN_PROGRESS">In Progress / Partial</option>
              </select>
            )}

            {(filters.search || filters.judgeStatus !== 'ALL' || filters.submissionStatus !== 'ALL') && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-mono text-[#8B2C24] hover:underline px-2 py-1 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

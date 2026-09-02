'use client';

import React from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  FileCode2,
  AlertTriangle,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { JudgeAssignmentEntity } from '@almosthack/types';
import { JudgeFilterState, JudgeAssignmentStatus } from './judge-types';

export interface JudgeAssignmentListProps {
  assignments: JudgeAssignmentEntity[];
  activeAssignmentId: string;
  onSelectAssignment: (id: string) => void;
  filters: JudgeFilterState;
  onUpdateFilters: (updates: Partial<JudgeFilterState>) => void;
}

export const JudgeAssignmentList: React.FC<JudgeAssignmentListProps> = ({
  assignments,
  activeAssignmentId,
  onSelectAssignment,
  filters,
  onUpdateFilters,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]">
            <CheckCircle2 className="w-3 h-3" />
            Evaluated
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF4DC] border border-[#F0D597] text-[#785A12]">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'REVOKED':
      case 'CONFLICT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B]">
            <AlertTriangle className="w-3 h-3" />
            Recused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F7F4EA] border border-[#DCDDD3] text-[#6D7068]">
            <FileCode2 className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 text-left">
      {/* Search & Filter Toolbar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6D7068]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            placeholder="Search project title, team, track..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono font-bold">
          {(
            [
              { id: 'ALL', label: 'All' },
              { id: 'ASSIGNED', label: 'Pending' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'COMPLETED', label: 'Evaluated' },
            ] as Array<{ id: JudgeAssignmentStatus; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onUpdateFilters({ status: tab.id })}
              className={`px-2.5 py-1 rounded-[5px] transition-colors shrink-0 cursor-pointer ${
                filters.status === tab.id
                  ? 'bg-[#028051] text-white'
                  : 'bg-[#FFFDF8] border border-[#DCDDD3] text-[#6D7068] hover:text-[#171914]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment List Feed */}
      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {assignments.length === 0 ? (
          <div className="p-8 text-center rounded-[8px] bg-[#FFFDF8] border border-[#DCDDD3] space-y-2">
            <FileCode2 className="w-6 h-6 text-[#6D7068] mx-auto opacity-60" />
            <p className="text-xs font-mono text-[#6D7068]">No assignments found</p>
          </div>
        ) : (
          assignments.map((asgn) => {
            const isActive = asgn.id === activeAssignmentId;

            return (
              <div
                key={asgn.id}
                onClick={() => onSelectAssignment(asgn.id)}
                className={`p-3.5 rounded-[8px] border transition-all cursor-pointer space-y-2 ${
                  isActive
                    ? 'bg-[#FFFDF8] border-[#028051] shadow-xs ring-1 ring-[#028051]'
                    : 'bg-[#FFFDF8] border-[#DCDDD3] hover:border-[#6D7068]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-heading font-extrabold text-xs text-[#171914] leading-snug line-clamp-2">
                    {asgn.submission?.title || 'Untitled Project'}
                  </h4>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                      isActive ? 'text-[#028051]' : 'text-[#6D7068]'
                    }`}
                  />
                </div>

                <div className="text-[11px] font-mono text-[#6D7068] truncate">
                  Team: <span className="text-[#171914] font-bold">{asgn.submission?.team?.name || 'Solo Builder'}</span>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#DCDDD3]/60">
                  <span className="text-[10px] font-mono text-[#6D7068] truncate max-w-[120px]">
                    {asgn.submission?.track?.name || 'General Track'}
                  </span>
                  {getStatusBadge(asgn.status)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

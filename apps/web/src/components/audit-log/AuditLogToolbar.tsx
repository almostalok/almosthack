'use client';

import React from 'react';
import {
  Search,
  Download,
  Filter,
  ShieldCheck,
  Sliders,
  Users,
  Users2,
  FileCode2,
  Scale,
  Award,
  Stamp,
  Megaphone,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import {
  AuditLogFilterState,
  AuditTargetCategory,
  AuditDateRange,
  AuditLogActor,
} from './audit-log-types';

export interface AuditLogToolbarProps {
  filters: AuditLogFilterState;
  onUpdateFilters: (updates: Partial<AuditLogFilterState>) => void;
  actors: AuditLogActor[];
  onExportCsv: () => void;
}

export const AuditLogToolbar: React.FC<AuditLogToolbarProps> = ({
  filters,
  onUpdateFilters,
  actors,
  onExportCsv,
}) => {
  const categories: Array<{ id: AuditTargetCategory; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'ALL', label: 'All Operations', icon: ShieldCheck },
    { id: 'HACKATHON', label: 'Configuration', icon: Sliders },
    { id: 'PARTICIPANT', label: 'Participants', icon: Users },
    { id: 'TEAM', label: 'Teams & Rosters', icon: Users2 },
    { id: 'SUBMISSION', label: 'Submissions', icon: FileCode2 },
    { id: 'EVALUATION', label: 'Judging & Scores', icon: Scale },
    { id: 'RESULT', label: 'Results & Ranks', icon: Award },
    { id: 'CERTIFICATE', label: 'Credentials', icon: Stamp },
    { id: 'ANNOUNCEMENT', label: 'Broadcasts', icon: Megaphone },
  ];

  return (
    <div className="space-y-3 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D7068]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            placeholder="Search actor email, action, resource target, checksum..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051]"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Actor Select */}
          <div className="relative">
            <select
              value={filters.actorId}
              onChange={(e) => onUpdateFilters({ actorId: e.target.value })}
              aria-label="Filter by operational actor"
              className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] py-1.5 px-3 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
            >
              <option value="ALL">All Actors</option>
              {actors.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name} ({act.role || act.email})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Select */}
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onUpdateFilters({ dateRange: e.target.value as AuditDateRange })
              }
              aria-label="Filter date range"
              className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] py-1.5 px-3 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today (24h)</option>
              <option value="7D">Past 7 Days</option>
              <option value="30D">Past 30 Days</option>
            </select>
          </div>

          {/* Export Proof Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5 text-[#6D7068]" />}
            className="text-xs font-mono h-8"
          >
            Export Proof
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#DCDDD3] select-none text-xs font-mono font-bold">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = filters.category === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onUpdateFilters({ category: cat.id })}
              className={`px-3 py-1.5 rounded-[6px] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]'
                  : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

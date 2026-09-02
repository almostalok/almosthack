'use client';

import React from 'react';
import { Search, X, Download, Stamp, Filter } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { CertificateFilterState } from './certificates-types';

export interface CertificateToolbarProps {
  filters: CertificateFilterState;
  onUpdateFilters: (updates: Partial<CertificateFilterState>) => void;
  onOpenBulkIssue: () => void;
  onExportCsv: () => void;
  totalFiltered: number;
}

export const CertificateToolbar: React.FC<CertificateToolbarProps> = ({
  filters,
  onUpdateFilters,
  onOpenBulkIssue,
  onExportCsv,
  totalFiltered,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search */}
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="w-3.5 h-3.5 text-[#6D7068] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search participant, email, ID..."
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            className="w-full pl-8 pr-7 py-1.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#9A9C94] focus:outline-none focus:border-[#028051]"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onUpdateFilters({ search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6D7068] hover:text-[#171914] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onUpdateFilters({ status: e.target.value })}
          className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2.5 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ISSUED">Issued (Live)</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REVOKED">Revoked</option>
        </select>

        {/* Type Filter */}
        <select
          value={filters.type}
          onChange={(e) => onUpdateFilters({ type: e.target.value })}
          className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] py-1.5 px-2.5 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
        >
          <option value="ALL">All Types</option>
          <option value="WINNER">Grand Champions / Podiums</option>
          <option value="TRACK_WINNER">Track Winners</option>
          <option value="FINALIST">Finalists</option>
          <option value="PARTICIPATION">Participation</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
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
          variant="primary"
          size="sm"
          onClick={onOpenBulkIssue}
          leftIcon={<Stamp className="w-3.5 h-3.5" />}
          className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
        >
          Issue Certificates
        </Button>
      </div>
    </div>
  );
};

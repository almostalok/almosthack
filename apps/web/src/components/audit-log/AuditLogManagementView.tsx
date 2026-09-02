'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { Breadcrumbs, Button } from '@almosthack/ui';
import { useAuditLog } from './use-audit-log';
import { AuditLogSummaryCards } from './AuditLogSummaryCards';
import { AuditLogToolbar } from './AuditLogToolbar';
import { AuditLogTable } from './AuditLogTable';
import { AuditLogMobileCard } from './AuditLogMobileCard';
import { AuditLogDetailDrawer } from './AuditLogDetailDrawer';

export interface AuditLogManagementViewProps {
  hackathonId?: string;
  isGlobal?: boolean;
}

export const AuditLogManagementView: React.FC<AuditLogManagementViewProps> = ({
  hackathonId,
  isGlobal = false,
}) => {
  const router = useRouter();

  // Hackathon identity
  const { data: hackathon } = useQuery({
    queryKey: ['hackathon', hackathonId],
    queryFn: async () => {
      if (!hackathonId) return null;
      try {
        return await apiClient.getHackathon(hackathonId);
      } catch {
        return {
          id: hackathonId,
          name: 'Hack The Future 2026',
          slug: 'hack-the-future-2026',
        };
      }
    },
    enabled: !!hackathonId,
  });

  const {
    filters,
    updateFilters,
    actors,
    filteredLogs,
    metrics,
    isLoading,
    refetch,
    selectedLog,
    isDetailOpen,
    openDetail,
    closeDetail,
    exportCsv,
  } = useAuditLog({ hackathonId });

  const breadcrumbs = isGlobal
    ? [
        { label: 'Platform' },
        { label: 'Verifiable Audit Ledger', active: true },
      ]
    : [
        { label: 'Hackathons', href: '/hackathons' },
        {
          label: hackathon?.name || 'Workspace',
          href: `/hackathons/${hackathonId}`,
        },
        { label: 'Audit Log & Activity', active: true },
      ];

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Verifiable Audit Log Workspace"
    >
      {/* Header */}
      <div className="space-y-4 pb-4 border-b border-[#DCDDD3]">
        <Breadcrumbs items={breadcrumbs} className="text-xs" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#028051]" />
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                {isGlobal
                  ? 'Verifiable System Ledger'
                  : 'Audit Log & Activity History'}
              </h1>
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              {isGlobal
                ? 'Immutable, append-only operational audit trail across all organizations and hackathons.'
                : 'Cryptographically verifiable, immutable history of actions, configuration shifts, and scoring events.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              leftIcon={
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
                />
              }
              className="text-xs font-mono h-8"
            >
              Refresh
            </Button>

            {!isGlobal && hackathonId && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/hackathons/${hackathonId}`)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="text-xs font-mono h-8"
              >
                Workspace
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <AuditLogSummaryCards metrics={metrics} />

      {/* Toolbar */}
      <AuditLogToolbar
        filters={filters}
        onUpdateFilters={updateFilters}
        actors={actors}
        onExportCsv={exportCsv}
      />

      {/* Desktop Ledger Table */}
      <div className="hidden md:block">
        <AuditLogTable logs={filteredLogs} onSelect={openDetail} />
      </div>

      {/* Mobile Feed */}
      <div className="md:hidden space-y-3">
        {filteredLogs.map((log) => (
          <AuditLogMobileCard key={log.id} log={log} onSelect={openDetail} />
        ))}
      </div>

      {/* Proof & Diff Drawer */}
      <AuditLogDetailDrawer
        isOpen={isDetailOpen}
        log={selectedLog}
        onClose={closeDetail}
      />
    </div>
  );
};

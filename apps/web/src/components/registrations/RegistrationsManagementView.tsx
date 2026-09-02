'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Button, Breadcrumbs } from '@almosthack/ui';
import {
  Users,
  ArrowLeft,
  RotateCw,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useRegistrations } from './use-registrations';
import { RegistrationSummaryMetrics } from './RegistrationSummaryMetrics';
import { RegistrationToolbar } from './RegistrationToolbar';
import { RegistrationTable } from './RegistrationTable';
import { ParticipantDetailDrawer } from './ParticipantDetailDrawer';
import { ApprovalDialog } from './ApprovalDialog';
import { RejectionDialog } from './RejectionDialog';

export interface RegistrationsManagementViewProps {
  hackathonId: string;
}

export const RegistrationsManagementView: React.FC<RegistrationsManagementViewProps> = ({
  hackathonId,
}) => {
  const router = useRouter();

  // Fetch hackathon details
  const { data: hackathon } = useQuery({
    queryKey: ['hackathon', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathon(hackathonId);
      } catch {
        return {
          id: hackathonId,
          name: 'Hack The Future 2026',
          slug: 'hack-the-future-2026',
          status: 'PUBLISHED',
        };
      }
    },
  });

  const {
    participants,
    allFilteredCount,
    metrics,
    tracks,
    filters,
    updateFilters,
    resetFilters,
    selectedIds,
    toggleSelectAll,
    toggleSelectRow,
    clearSelection,
    selectedParticipant,
    setSelectedParticipantId,
    // Modals
    approvingParticipant,
    setApprovingParticipant,
    rejectingParticipant,
    setRejectingParticipant,
    isBulkApproveOpen,
    setIsBulkApproveOpen,
    isBulkRejectOpen,
    setIsBulkRejectOpen,
    // Mutations
    approveParticipant,
    isApproving,
    rejectParticipant,
    isRejecting,
    waitlistParticipant,
    bulkApprove,
    isBulkApproving,
    bulkReject,
    isBulkRejecting,
    // Export
    exportCSV,
    isExporting,
    // Query
    isLoading,
    refetch,
    totalPages,
  } = useRegistrations({ hackathonId });

  const breadcrumbs = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathon?.name || 'Workspace', href: `/hackathons/${hackathonId}` },
    { label: 'Registrations', active: true },
  ];

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Registrations Workspace"
    >
      {/* Header & Breadcrumb */}
      <div className="space-y-3 pb-3 border-b border-[#DCDDD3]">
        <Breadcrumbs items={breadcrumbs} className="text-xs" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                Registrations & Builders
              </h1>
              <span className="text-xs font-mono font-bold bg-[#E2EBDD] text-[#274535] px-2.5 py-0.5 rounded-[6px] border border-[#B8CEB0]">
                {metrics.total} Registered
              </span>
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              Review builder applications, triage admission statuses, and manage team associations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<RotateCw className="w-3.5 h-3.5 text-[#6D7068]" />}
              className="text-xs font-mono h-8"
            >
              Refresh
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}/configuration`)}
              leftIcon={<Sliders className="w-3.5 h-3.5 text-[#6D7068]" />}
              className="text-xs font-mono h-8"
            >
              Config
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

      {/* Summary Metric Cards */}
      <RegistrationSummaryMetrics
        metrics={metrics}
        activeStatus={filters.status}
        onSelectStatus={(st) => updateFilters({ status: st })}
      />

      {/* Filter and Search Toolbar */}
      <RegistrationToolbar
        filters={filters}
        onFilterChange={updateFilters}
        onResetFilters={resetFilters}
        tracks={tracks}
        selectedCount={selectedIds.length}
        onBulkApprove={() => setIsBulkApproveOpen(true)}
        onBulkReject={() => setIsBulkRejectOpen(true)}
        onClearSelection={clearSelection}
        onExport={exportCSV}
        isExporting={isExporting}
        totalFilteredCount={allFilteredCount}
      />

      {/* Primary Table & Mobile Cards */}
      <RegistrationTable
        participants={participants}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectRow={toggleSelectRow}
        onViewDetails={(p) => setSelectedParticipantId(p.id)}
        onApprove={(p) => setApprovingParticipant(p)}
        onReject={(p) => setRejectingParticipant(p)}
        onWaitlist={(p) => waitlistParticipant(p.id)}
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={(pg) => updateFilters({ page: pg })}
        totalCount={allFilteredCount}
        onResetFilters={resetFilters}
      />

      {/* Slide-over Participant Drawer */}
      <ParticipantDetailDrawer
        participant={selectedParticipant}
        isOpen={Boolean(selectedParticipant)}
        onClose={() => setSelectedParticipantId(null)}
        onApprove={(p) => setApprovingParticipant(p)}
        onReject={(p) => setRejectingParticipant(p)}
        onWaitlist={(p) => waitlistParticipant(p.id)}
      />

      {/* Single Approve Modal */}
      <ApprovalDialog
        isOpen={Boolean(approvingParticipant)}
        onClose={() => setApprovingParticipant(null)}
        onConfirm={() => {
          if (approvingParticipant) {
            approveParticipant(approvingParticipant.id);
          }
        }}
        isApproving={isApproving}
        participant={approvingParticipant}
      />

      {/* Single Reject Modal */}
      <RejectionDialog
        isOpen={Boolean(rejectingParticipant)}
        onClose={() => setRejectingParticipant(null)}
        onConfirm={(reason) => {
          if (rejectingParticipant) {
            rejectParticipant(rejectingParticipant.id, reason);
          }
        }}
        isRejecting={isRejecting}
        participant={rejectingParticipant}
      />

      {/* Bulk Approve Modal */}
      <ApprovalDialog
        isOpen={isBulkApproveOpen}
        onClose={() => setIsBulkApproveOpen(false)}
        onConfirm={() => bulkApprove(selectedIds)}
        isApproving={isBulkApproving}
        bulkCount={selectedIds.length}
      />

      {/* Bulk Reject Modal */}
      <RejectionDialog
        isOpen={isBulkRejectOpen}
        onClose={() => setIsBulkRejectOpen(false)}
        onConfirm={(reason) => bulkReject(selectedIds, reason)}
        isRejecting={isBulkRejecting}
        bulkCount={selectedIds.length}
      />
    </div>
  );
};

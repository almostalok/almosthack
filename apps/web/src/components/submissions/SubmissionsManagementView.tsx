'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Button, Breadcrumbs } from '@almosthack/ui';
import {
  FileCode2,
  ArrowLeft,
  RotateCw,
  Sliders,
} from 'lucide-react';
import { useSubmissions } from './use-submissions';
import { SubmissionSummaryMetrics } from './SubmissionSummaryMetrics';
import { SubmissionToolbar } from './SubmissionToolbar';
import { SubmissionTable } from './SubmissionTable';
import { SubmissionDetailDrawer } from './SubmissionDetailDrawer';
import { FinalizeSubmissionDialog } from './FinalizeSubmissionDialog';
import { WithdrawSubmissionDialog } from './WithdrawSubmissionDialog';
import { IntegrityAnalysisDialog } from './IntegrityAnalysisDialog';

export interface SubmissionsManagementViewProps {
  hackathonId: string;
}

export const SubmissionsManagementView: React.FC<SubmissionsManagementViewProps> = ({
  hackathonId,
}) => {
  const router = useRouter();

  // Fetch hackathon identity
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
    submissions,
    totalFilteredCount,
    metrics,
    tracks,
    filters,
    updateFilters,
    resetFilters,
    selectedSubmission,
    selectedSubmissionId,
    setSelectedSubmissionId,
    // Dialogs
    finalizingSubmission,
    setFinalizingSubmission,
    withdrawingSubmission,
    setWithdrawingSubmission,
    integrityTargetSubmission,
    setIntegrityTargetSubmission,
    // Actions
    finalizeSubmission,
    isFinalizing,
    withdrawSubmission,
    isWithdrawing,
    startIntegrityCheck,
    isCheckingIntegrity,
    exportCsv,
    // Query
    isLoading,
    refetch,
    totalPages,
  } = useSubmissions({ hackathonId });

  const breadcrumbs = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathon?.name || 'Workspace', href: `/hackathons/${hackathonId}` },
    { label: 'Submissions', active: true },
  ];

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Submissions Review Workspace"
    >
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 pb-3 border-b border-[#DCDDD3]">
        <Breadcrumbs items={breadcrumbs} className="text-xs" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                Submissions Review
              </h1>
              <span className="text-xs font-mono font-bold bg-[#E2EBDD] text-[#274535] px-2.5 py-0.5 rounded-[6px] border border-[#B8CEB0]">
                {metrics.total} Projects
              </span>
              <span className="text-xs font-mono text-[#028051] font-bold">
                ({metrics.readyForJudging} Ready for Judging)
              </span>
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              Audit code repositories, review project artifacts, verify checklists, and prepare entries for judging.
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

      {/* Summary Metrics & Attention Banner */}
      <SubmissionSummaryMetrics
        metrics={metrics}
        activeStatus={filters.status}
        activeReadiness={filters.readiness}
        onSelectMetric={(st, rd) => updateFilters({ status: st, readiness: rd })}
      />

      {/* Search & Filter Toolbar */}
      <SubmissionToolbar
        filters={filters}
        onFilterChange={updateFilters}
        onResetFilters={resetFilters}
        tracks={tracks}
        totalFilteredCount={totalFilteredCount}
        onExportCsv={exportCsv}
      />

      {/* Submissions Table / Mobile Cards */}
      <SubmissionTable
        submissions={submissions}
        isLoading={isLoading}
        onViewDetails={(sub) => setSelectedSubmissionId(sub.id)}
        onFinalize={(sub) => setFinalizingSubmission(sub)}
        onWithdraw={(sub) => setWithdrawingSubmission(sub)}
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={(pg) => updateFilters({ page: pg })}
        totalCount={totalFilteredCount}
        onResetFilters={resetFilters}
      />

      {/* Slide-over Detail Drawer */}
      <SubmissionDetailDrawer
        submission={selectedSubmission}
        isOpen={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmissionId(null)}
        onFinalize={(s) => setFinalizingSubmission(s)}
        onWithdraw={(s) => setWithdrawingSubmission(s)}
        onRunIntegrity={(s) => setIntegrityTargetSubmission(s)}
        isFinalizing={isFinalizing}
        isWithdrawing={isWithdrawing}
        isCheckingIntegrity={isCheckingIntegrity}
      />

      {/* Finalize Modal */}
      <FinalizeSubmissionDialog
        isOpen={Boolean(finalizingSubmission)}
        onClose={() => setFinalizingSubmission(null)}
        submission={finalizingSubmission}
        onConfirm={() => {
          if (finalizingSubmission) {
            finalizeSubmission(finalizingSubmission.id);
          }
        }}
        isFinalizing={isFinalizing}
      />

      {/* Withdraw Modal */}
      <WithdrawSubmissionDialog
        isOpen={Boolean(withdrawingSubmission)}
        onClose={() => setWithdrawingSubmission(null)}
        submission={withdrawingSubmission}
        onConfirm={() => {
          if (withdrawingSubmission) {
            withdrawSubmission(withdrawingSubmission.id);
          }
        }}
        isWithdrawing={isWithdrawing}
      />

      {/* Integrity Trigger Modal */}
      <IntegrityAnalysisDialog
        isOpen={Boolean(integrityTargetSubmission)}
        onClose={() => setIntegrityTargetSubmission(null)}
        submission={integrityTargetSubmission}
        onConfirm={() => {
          if (integrityTargetSubmission) {
            startIntegrityCheck(integrityTargetSubmission.id);
          }
        }}
        isAnalyzing={isCheckingIntegrity}
      />
    </div>
  );
};

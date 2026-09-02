'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Button, Breadcrumbs } from '@almosthack/ui';
import {
  Award,
  ArrowLeft,
  Stamp,
  FileCheck,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { useCertificates } from './use-certificates';
import { CertificateSummaryCards } from './CertificateSummaryCards';
import { CertificateToolbar } from './CertificateToolbar';
import { CertificateTable } from './CertificateTable';
import { CertificatePreviewModal } from './CertificatePreviewModal';
import { BulkIssueCertificatesDialog } from './BulkIssueCertificatesDialog';
import { RevokeCertificateDialog } from './RevokeCertificateDialog';
import { RegenerateCertificateDialog } from './RegenerateCertificateDialog';
import { CertificateItem } from './certificates-types';

export interface CertificateManagementViewProps {
  hackathonId: string;
}

export const CertificateManagementView: React.FC<CertificateManagementViewProps> = ({
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
    certificates,
    allCertificates,
    summary,
    filters,
    updateFilters,
    resetFilters,
    selectedCertificate,
    setSelectedCertificate,
    isBulkIssueOpen,
    setIsBulkIssueOpen,
    isRevokeOpen,
    setIsRevokeOpen,
    isRegenerateOpen,
    setIsRegenerateOpen,
    bulkIssueCertificates,
    isBulkIssuing,
    revokeCertificate,
    isRevoking,
    regenerateCertificate,
    isRegenerating,
    exportCsv,
  } = useCertificates({ hackathonId });

  const [activeRevokeTarget, setActiveRevokeTarget] = React.useState<CertificateItem | null>(null);
  const [activeRegenerateTarget, setActiveRegenerateTarget] = React.useState<CertificateItem | null>(null);

  const breadcrumbs = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathon?.name || 'Workspace', href: `/hackathons/${hackathonId}` },
    { label: 'Certificates & Credentials', active: true },
  ];

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Certificate Management Command Center"
    >
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 pb-3 border-b border-[#DCDDD3]">
        <Breadcrumbs items={breadcrumbs} className="text-xs" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                Certificates & Verified Credentials
              </h1>
              <span className="text-xs font-mono font-bold bg-[#E2EBDD] text-[#028051] px-2.5 py-0.5 rounded-[6px] border border-[#B8CEB0]">
                SHA-256 Verified
              </span>
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              Issue, manage, and verify official participant and winner credentials with cryptographic proof.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}/results`)}
              leftIcon={<Award className="w-3.5 h-3.5 text-[#6D7068]" />}
              className="text-xs font-mono h-8"
            >
              Results Workspace
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

      {/* KPI Metric Counters */}
      <CertificateSummaryCards summary={summary} />

      {/* Toolbar (Search, Filter, Export, Bulk Issue) */}
      <CertificateToolbar
        filters={filters}
        onUpdateFilters={updateFilters}
        onOpenBulkIssue={() => setIsBulkIssueOpen(true)}
        onExportCsv={exportCsv}
        totalFiltered={certificates.length}
      />

      {/* Certificate Table */}
      <CertificateTable
        certificates={certificates}
        onSelect={(cert) => setSelectedCertificate(cert)}
        onOpenRevoke={(cert) => {
          setActiveRevokeTarget(cert);
          setIsRevokeOpen(true);
        }}
        onOpenRegenerate={(cert) => {
          setActiveRegenerateTarget(cert);
          setIsRegenerateOpen(true);
        }}
      />

      {/* Modals & Dialogs */}
      <CertificatePreviewModal
        certificate={selectedCertificate}
        isOpen={Boolean(selectedCertificate)}
        onClose={() => setSelectedCertificate(null)}
        onOpenRevoke={(cert) => {
          setActiveRevokeTarget(cert);
          setIsRevokeOpen(true);
        }}
        onOpenRegenerate={(cert) => {
          setActiveRegenerateTarget(cert);
          setIsRegenerateOpen(true);
        }}
      />

      <BulkIssueCertificatesDialog
        isOpen={isBulkIssueOpen}
        onClose={() => setIsBulkIssueOpen(false)}
        onConfirm={bulkIssueCertificates}
        isIssuing={isBulkIssuing}
        totalEligible={summary.totalEligible}
      />

      <RevokeCertificateDialog
        certificate={activeRevokeTarget}
        isOpen={isRevokeOpen}
        onClose={() => {
          setIsRevokeOpen(false);
          setActiveRevokeTarget(null);
        }}
        onConfirm={revokeCertificate}
        isRevoking={isRevoking}
      />

      <RegenerateCertificateDialog
        certificate={activeRegenerateTarget}
        isOpen={isRegenerateOpen}
        onClose={() => {
          setIsRegenerateOpen(false);
          setActiveRegenerateTarget(null);
        }}
        onConfirm={regenerateCertificate}
        isRegenerating={isRegenerating}
      />
    </div>
  );
};

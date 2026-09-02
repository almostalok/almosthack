'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  CertificateItem,
  CertificateSummaryMetrics,
  CertificateFilterState,
  CertificateType,
} from './certificates-types';
import {
  MOCK_CERTIFICATES,
  MOCK_CERTIFICATE_SUMMARY,
} from './certificates-mock-data';

export interface UseCertificatesOptions {
  hackathonId: string;
  initialFilters?: Partial<CertificateFilterState>;
}

export function useCertificates({
  hackathonId,
  initialFilters,
}: UseCertificatesOptions) {
  const queryClient = useQueryClient();

  const [certificates, setCertificates] = useState<CertificateItem[]>(MOCK_CERTIFICATES);
  const [summary, setSummary] = useState<CertificateSummaryMetrics>(MOCK_CERTIFICATE_SUMMARY);

  const [filters, setFilters] = useState<CertificateFilterState>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || 'ALL',
    type: initialFilters?.type || 'ALL',
    trackId: initialFilters?.trackId || 'ALL',
    page: initialFilters?.page || 1,
    pageSize: initialFilters?.pageSize || 10,
  });

  // Modal Dialog States
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [isBulkIssueOpen, setIsBulkIssueOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filtered Certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      // Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = c.participantName.toLowerCase().includes(q);
        const matchesEmail = c.participantEmail.toLowerCase().includes(q);
        const matchesVerId = c.verificationId.toLowerCase().includes(q);
        const matchesTeam = c.teamName ? c.teamName.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesEmail && !matchesVerId && !matchesTeam) return false;
      }

      // Status
      if (filters.status !== 'ALL' && c.status !== filters.status) {
        return false;
      }

      // Type
      if (filters.type !== 'ALL' && c.type !== filters.type) {
        return false;
      }

      return true;
    });
  }, [certificates, filters]);

  // Update Filters
  const updateFilters = useCallback((updates: Partial<CertificateFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      page: updates.page !== undefined ? updates.page : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'ALL',
      type: 'ALL',
      trackId: 'ALL',
      page: 1,
      pageSize: 10,
    });
  }, []);

  // Mutation: Bulk Issue Certificates
  const bulkIssueMutation = useMutation({
    mutationFn: async (type: CertificateType | 'ALL') => {
      // Simulate API call
      setCertificates((prev) =>
        prev.map((c) =>
          c.status === 'PENDING'
            ? {
                ...c,
                status: 'ISSUED',
                issuedAt: new Date().toISOString(),
                signatureHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
              }
            : c
        )
      );
      setSummary((prev) => ({
        ...prev,
        totalIssued: prev.totalEligible - prev.totalFailed - prev.totalRevoked,
        totalPending: 0,
        totalGenerating: 0,
      }));
      return { success: true };
    },
    onSuccess: () => {
      setIsBulkIssueOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon-certificates', hackathonId] });
    },
  });

  // Mutation: Revoke Certificate
  const revokeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      setCertificates((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'REVOKED',
                revokedAt: new Date().toISOString(),
                revocationReason: reason,
              }
            : c
        )
      );
      setSummary((prev) => ({
        ...prev,
        totalIssued: Math.max(0, prev.totalIssued - 1),
        totalRevoked: prev.totalRevoked + 1,
      }));
      return { success: true };
    },
    onSuccess: () => {
      setIsRevokeOpen(false);
      setSelectedCertificate(null);
    },
  });

  // Mutation: Regenerate Certificate
  const regenerateMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      setCertificates((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'ISSUED',
                issuedAt: new Date().toISOString(),
                signatureHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
              }
            : c
        )
      );
      return { success: true };
    },
    onSuccess: () => {
      setIsRegenerateOpen(false);
      setSelectedCertificate(null);
    },
  });

  // Export CSV
  const exportCsv = useCallback(() => {
    const headers = [
      'Participant Name',
      'Email',
      'Team',
      'Certificate Type',
      'Verification ID',
      'Status',
      'Issued Date',
    ];
    const rows = filteredCertificates.map((c) => [
      `"${c.participantName.replace(/"/g, '""')}"`,
      `"${c.participantEmail.replace(/"/g, '""')}"`,
      `"${(c.teamName || '—').replace(/"/g, '""')}"`,
      c.type,
      c.verificationId,
      c.status,
      c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-US') : '—',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `certificates-${hackathonId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredCertificates, hackathonId]);

  return {
    certificates: filteredCertificates,
    allCertificates: certificates,
    summary,
    filters,
    updateFilters,
    resetFilters,
    selectedCertificate,
    setSelectedCertificate,
    // Modals
    isBulkIssueOpen,
    setIsBulkIssueOpen,
    isRevokeOpen,
    setIsRevokeOpen,
    isRegenerateOpen,
    setIsRegenerateOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    // Actions
    bulkIssueCertificates: (type: CertificateType | 'ALL') =>
      bulkIssueMutation.mutate(type),
    isBulkIssuing: bulkIssueMutation.isPending,
    revokeCertificate: (id: string, reason: string) =>
      revokeMutation.mutate({ id, reason }),
    isRevoking: revokeMutation.isPending,
    regenerateCertificate: (id: string, reason?: string) =>
      regenerateMutation.mutate({ id, reason }),
    isRegenerating: regenerateMutation.isPending,
    exportCsv,
  };
}

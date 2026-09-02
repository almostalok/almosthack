'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  ParticipantItem,
  RegistrationMetrics,
  RegistrationFilterState,
  RegistrationStatus,
} from './registrations-types';
import { MOCK_PARTICIPANTS, MOCK_REGISTRATION_METRICS } from './registrations-mock-data';

export interface UseRegistrationsOptions {
  hackathonId: string;
  initialFilters?: Partial<RegistrationFilterState>;
}

export function useRegistrations({ hackathonId, initialFilters }: UseRegistrationsOptions) {
  const queryClient = useQueryClient();

  // Filter State
  const [filters, setFilters] = useState<RegistrationFilterState>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || 'ALL',
    teamStatus: initialFilters?.teamStatus || 'ALL',
    trackId: initialFilters?.trackId || 'ALL',
    page: initialFilters?.page || 1,
    pageSize: initialFilters?.pageSize || 10,
  });

  // Selected row IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Selected participant for detail drawer
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  // Modals state
  const [approvingParticipant, setApprovingParticipant] = useState<ParticipantItem | null>(null);
  const [rejectingParticipant, setRejectingParticipant] = useState<ParticipantItem | null>(null);
  const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false);
  const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Local state for mutations in preview mode
  const [localParticipants, setLocalParticipants] = useState<ParticipantItem[]>(MOCK_PARTICIPANTS);

  // Fetch hackathon tracks for track filter
  const { data: rawTracks = [] } = useQuery({
    queryKey: ['hackathon-tracks', hackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getHackathonTracks(hackathonId);
        return Array.isArray(res) ? res : [];
      } catch {
        return [
          { id: 'trk_1', name: 'Open Innovation / Systems' },
          { id: 'trk_2', name: 'AI Safety & Intelligent Workflows' },
        ];
      }
    },
    enabled: Boolean(hackathonId),
  });

  const tracks = useMemo(() => {
    return rawTracks.length > 0
      ? rawTracks.map((t: any) => ({ id: t.id, name: t.name }))
      : [
          { id: 'trk_1', name: 'Open Innovation / Systems' },
          { id: 'trk_2', name: 'AI Safety & Intelligent Workflows' },
        ];
  }, [rawTracks]);

  // Fetch participants
  const {
    data: serverParticipants,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hackathon-registrations', hackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getHackathonRegistration(hackathonId);
        if (Array.isArray(res) && res.length > 0) {
          return res as ParticipantItem[];
        }
        return localParticipants;
      } catch {
        return localParticipants;
      }
    },
    enabled: Boolean(hackathonId),
  });

  const allParticipants = serverParticipants || localParticipants;

  // Filtered participants calculation
  const filteredParticipants = useMemo(() => {
    return allParticipants.filter((p) => {
      // 1. Search query
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesEmail = p.email.toLowerCase().includes(q);
        const matchesUsername = p.username.toLowerCase().includes(q);
        const matchesCollege = p.college.toLowerCase().includes(q);
        const matchesTeam = p.teamName?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesEmail && !matchesUsername && !matchesCollege && !matchesTeam) {
          return false;
        }
      }

      // 2. Status filter
      if (filters.status !== 'ALL' && p.status !== filters.status) {
        return false;
      }

      // 3. Team status
      if (filters.teamStatus === 'HAS_TEAM' && !p.teamId) {
        return false;
      }
      if (filters.teamStatus === 'NO_TEAM' && Boolean(p.teamId)) {
        return false;
      }

      // 4. Track filter
      if (filters.trackId !== 'ALL' && p.trackId !== filters.trackId) {
        return false;
      }

      return true;
    });
  }, [allParticipants, filters]);

  // Paginated participants
  const paginatedParticipants = useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize;
    return filteredParticipants.slice(start, start + filters.pageSize);
  }, [filteredParticipants, filters.page, filters.pageSize]);

  const totalPages = Math.ceil(filteredParticipants.length / filters.pageSize) || 1;

  // Compute Metrics
  const metrics: RegistrationMetrics = useMemo(() => {
    const counts = {
      total: allParticipants.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      waitlisted: 0,
      checkedIn: 0,
    };

    allParticipants.forEach((p) => {
      if (p.status === 'PENDING') counts.pending++;
      if (p.status === 'APPROVED') counts.approved++;
      if (p.status === 'REJECTED') counts.rejected++;
      if (p.status === 'WAITLISTED') counts.waitlisted++;
      if (p.checkInStatus) counts.checkedIn++;
    });

    return counts;
  }, [allParticipants]);

  // Selected participant for drawer
  const selectedParticipant = useMemo(() => {
    if (!selectedParticipantId) return null;
    return allParticipants.find((p) => p.id === selectedParticipantId) || null;
  }, [allParticipants, selectedParticipantId]);

  // Filter setters
  const updateFilters = useCallback((updates: Partial<RegistrationFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      page: updates.page !== undefined ? updates.page : 1, // Reset page on filter changes unless page explicitly given
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'ALL',
      teamStatus: 'ALL',
      trackId: 'ALL',
      page: 1,
      pageSize: 10,
    });
  }, []);

  // Selection handlers
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === paginatedParticipants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedParticipants.map((p) => p.id));
    }
  }, [selectedIds, paginatedParticipants]);

  const toggleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (participantId: string) => {
      setLocalParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, status: 'APPROVED' as RegistrationStatus } : p))
      );
      return { success: true, participantId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-registrations', hackathonId] });
      setApprovingParticipant(null);
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ participantId, reason }: { participantId: string; reason?: string }) => {
      setLocalParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId
            ? { ...p, status: 'REJECTED' as RegistrationStatus, rejectionReason: reason }
            : p
        )
      );
      return { success: true, participantId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-registrations', hackathonId] });
      setRejectingParticipant(null);
    },
  });

  // Waitlist Mutation
  const waitlistMutation = useMutation({
    mutationFn: async (participantId: string) => {
      setLocalParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, status: 'WAITLISTED' as RegistrationStatus } : p))
      );
      return { success: true, participantId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-registrations', hackathonId] });
    },
  });

  // Bulk Approve Mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      setLocalParticipants((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, status: 'APPROVED' as RegistrationStatus } : p))
      );
      return { count: ids.length };
    },
    onSuccess: () => {
      setSelectedIds([]);
      setIsBulkApproveOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon-registrations', hackathonId] });
    },
  });

  // Bulk Reject Mutation
  const bulkRejectMutation = useMutation({
    mutationFn: async ({ ids, reason }: { ids: string[]; reason?: string }) => {
      setLocalParticipants((prev) =>
        prev.map((p) =>
          ids.includes(p.id)
            ? { ...p, status: 'REJECTED' as RegistrationStatus, rejectionReason: reason }
            : p
        )
      );
      return { count: ids.length };
    },
    onSuccess: () => {
      setSelectedIds([]);
      setIsBulkRejectOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon-registrations', hackathonId] });
    },
  });

  // CSV Export
  const exportCSV = useCallback(() => {
    setIsExporting(true);
    try {
      const headers = [
        'ID',
        'Name',
        'Username',
        'Email',
        'Status',
        'College',
        'Branch',
        'Graduation Year',
        'Track',
        'Team Name',
        'Team Role',
        'Registered At',
      ];

      const rows = filteredParticipants.map((p) => [
        `"${p.id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.username}"`,
        `"${p.email}"`,
        `"${p.status}"`,
        `"${p.college.replace(/"/g, '""')}"`,
        `"${p.branch.replace(/"/g, '""')}"`,
        p.gradYear,
        `"${p.trackName || 'Unassigned'}"`,
        `"${p.teamName || 'No Team'}"`,
        `"${p.teamRole || ''}"`,
        `"${new Date(p.registeredAt).toISOString()}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `registrations-${hackathonId}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  }, [filteredParticipants, hackathonId]);

  return {
    participants: paginatedParticipants,
    allFilteredCount: filteredParticipants.length,
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
    selectedParticipantId,
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
    approveParticipant: (id: string) => approveMutation.mutate(id),
    isApproving: approveMutation.isPending,
    rejectParticipant: (id: string, reason?: string) => rejectMutation.mutate({ participantId: id, reason }),
    isRejecting: rejectMutation.isPending,
    waitlistParticipant: (id: string) => waitlistMutation.mutate(id),
    isWaitlisting: waitlistMutation.isPending,
    bulkApprove: (ids: string[]) => bulkApproveMutation.mutate(ids),
    isBulkApproving: bulkApproveMutation.isPending,
    bulkReject: (ids: string[], reason?: string) => bulkRejectMutation.mutate({ ids, reason }),
    isBulkRejecting: bulkRejectMutation.isPending,
    // Export
    exportCSV,
    isExporting,
    // Query State
    isLoading,
    isError,
    error,
    refetch,
    totalPages,
  };
}

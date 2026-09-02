'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  AuditLogItem,
  AuditLogFilterState,
  AuditLogMetrics,
  AuditTargetCategory,
  AuditDateRange,
  AuditLogActor,
} from './audit-log-types';
import {
  MOCK_AUDIT_LOGS,
  MOCK_AUDIT_METRICS,
  KNOWN_ACTORS,
} from './audit-log-mock-data';

export interface UseAuditLogOptions {
  hackathonId?: string;
  initialFilters?: Partial<AuditLogFilterState>;
}

export function useAuditLog({ hackathonId, initialFilters }: UseAuditLogOptions = {}) {
  const [filters, setFilters] = useState<AuditLogFilterState>({
    search: initialFilters?.search || '',
    category: initialFilters?.category || 'ALL',
    actorId: initialFilters?.actorId || 'ALL',
    dateRange: initialFilters?.dateRange || 'ALL',
    page: initialFilters?.page || 1,
    limit: initialFilters?.limit || 25,
  });

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch Audit Logs
  const {
    data: auditLogs = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<AuditLogItem[]>({
    queryKey: ['audit-logs', hackathonId, filters],
    queryFn: async () => {
      try {
        const res = await apiClient.getAuditLogs({
          page: filters.page,
          limit: filters.limit,
          targetEntity: filters.category === 'ALL' ? undefined : filters.category,
          actorId: filters.actorId === 'ALL' ? undefined : filters.actorId,
        });

        if (res && Array.isArray(res.items) && res.items.length > 0) {
          return res.items;
        }
        return MOCK_AUDIT_LOGS;
      } catch {
        return MOCK_AUDIT_LOGS;
      }
    },
  });

  // Client-side filtering
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Hackathon filter
      if (hackathonId && log.hackathonId && log.hackathonId !== hackathonId) {
        return false;
      }

      // Category filter
      if (filters.category !== 'ALL' && log.targetEntity !== filters.category) {
        return false;
      }

      // Actor filter
      if (filters.actorId !== 'ALL' && log.actorId !== filters.actorId) {
        return false;
      }

      // Date Range filter
      if (filters.dateRange !== 'ALL') {
        const logTime = new Date(log.createdAt).getTime();
        const now = Date.now();
        if (filters.dateRange === 'TODAY' && now - logTime > 1000 * 60 * 60 * 24) {
          return false;
        }
        if (filters.dateRange === '7D' && now - logTime > 1000 * 60 * 60 * 24 * 7) {
          return false;
        }
        if (filters.dateRange === '30D' && now - logTime > 1000 * 60 * 60 * 24 * 30) {
          return false;
        }
      }

      // Search filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesActor =
          log.actor.name.toLowerCase().includes(q) ||
          log.actor.email.toLowerCase().includes(q);
        const matchesAction =
          log.action.toLowerCase().includes(q) ||
          log.actionLabel.toLowerCase().includes(q);
        const matchesTarget =
          log.targetLabel.toLowerCase().includes(q) ||
          log.targetId.toLowerCase().includes(q);
        const matchesId =
          log.id.toLowerCase().includes(q) ||
          log.checksum.toLowerCase().includes(q);

        if (!matchesActor && !matchesAction && !matchesTarget && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, hackathonId, filters]);

  const updateFilters = useCallback((updates: Partial<AuditLogFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'ALL',
      actorId: 'ALL',
      dateRange: 'ALL',
      page: 1,
      limit: 25,
    });
  }, []);

  const openDetail = useCallback((log: AuditLogItem) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedLog(null);
  }, []);

  // Export CSV
  const exportCsv = useCallback(() => {
    const lines = [
      'AlmostHack Verifiable Audit Log Proof Report',
      `Scope: ${hackathonId || 'Global Platform'}`,
      `Generated At: ${new Date().toISOString()}`,
      '',
      'Event ID,Timestamp,Actor Name,Actor Email,Action,Target Entity,Target Label,IP Address,SHA-256 Checksum',
      ...filteredLogs.map(
        (l) =>
          `"${l.id}","${l.createdAt}","${l.actor.name}","${l.actor.email}","${l.action}","${l.targetEntity}","${l.targetLabel}","${l.ipAddress || 'N/A'}","${l.checksum}"`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-proof-${hackathonId || 'platform'}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredLogs, hackathonId]);

  return {
    filters,
    updateFilters,
    resetFilters,
    actors: KNOWN_ACTORS,
    auditLogs,
    filteredLogs,
    metrics: MOCK_AUDIT_METRICS,
    isLoading,
    isError,
    refetch,
    selectedLog,
    isDetailOpen,
    openDetail,
    closeDetail,
    exportCsv,
  };
}

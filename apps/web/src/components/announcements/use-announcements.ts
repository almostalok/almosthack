'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  AnnouncementEntity,
  AnnouncementStatus,
  AnnouncementRecipientScope,
  AnnouncementFilterState,
  AnnouncementMetrics,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  ScheduleAnnouncementDto,
} from './announcements-types';
import { MOCK_ANNOUNCEMENTS } from './announcements-mock-data';
import { HackathonTrackEntity } from '@almosthack/types';

export interface UseAnnouncementsOptions {
  hackathonId: string;
  initialFilters?: Partial<AnnouncementFilterState>;
}

export function useAnnouncements({
  hackathonId,
  initialFilters,
}: UseAnnouncementsOptions) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AnnouncementFilterState>({
    status: initialFilters?.status || 'ALL',
    scope: initialFilters?.scope || 'ALL',
    trackId: initialFilters?.trackId || 'ALL',
    search: initialFilters?.search || '',
  });

  // Selected item states
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementEntity | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch Tracks
  const { data: tracks = [] } = useQuery<HackathonTrackEntity[]>({
    queryKey: ['hackathon-tracks', hackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getHackathonTracks(hackathonId);
        return Array.isArray(res) ? res : [];
      } catch {
        return [
          { id: 'trk_systems', name: 'Open Innovation / Systems' } as any,
          { id: 'trk_ai', name: 'AI Safety & Intelligent Workflows' } as any,
          { id: 'trk_fintech', name: 'DeFi & Programmable Payments' } as any,
        ];
      }
    },
    enabled: Boolean(hackathonId),
  });

  // Fetch Announcements
  const {
    data: announcements = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<AnnouncementEntity[]>({
    queryKey: ['hackathon-announcements', hackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getAnnouncements(hackathonId);
        if (Array.isArray(res) && res.length > 0) {
          return res;
        }
        return MOCK_ANNOUNCEMENTS;
      } catch {
        return MOCK_ANNOUNCEMENTS;
      }
    },
    enabled: Boolean(hackathonId),
  });

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      if (filters.status !== 'ALL' && a.status !== filters.status) {
        return false;
      }
      if (filters.scope !== 'ALL' && a.recipientScope !== filters.scope) {
        return false;
      }
      if (filters.trackId !== 'ALL' && a.targetTrackId !== filters.trackId) {
        return false;
      }
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesBody = a.body.toLowerCase().includes(query);
        const matchesAuthor =
          a.author?.name?.toLowerCase().includes(query) ||
          a.author?.email?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBody && !matchesAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [announcements, filters]);

  // Metrics
  const metrics: AnnouncementMetrics = useMemo(() => {
    const published = announcements.filter(
      (a) => a.status === AnnouncementStatus.PUBLISHED
    ).length;
    const scheduled = announcements.filter(
      (a) => a.status === AnnouncementStatus.SCHEDULED
    ).length;
    const drafts = announcements.filter(
      (a) => a.status === AnnouncementStatus.DRAFT
    ).length;

    return {
      total: announcements.length,
      published,
      scheduled,
      drafts,
      recipientsReached: published * 730,
    };
  }, [announcements]);

  // Mutation: Create Announcement
  const createMutation = useMutation({
    mutationFn: async (dto: CreateAnnouncementDto) => {
      setActionError(null);
      return await apiClient.createAnnouncement(hackathonId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['hackathon-announcements', hackathonId],
      });
      setIsCreateOpen(false);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to create announcement');
    },
  });

  // Mutation: Publish Announcement
  const publishMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      setActionError(null);
      return await apiClient.publishAnnouncement(hackathonId, announcementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['hackathon-announcements', hackathonId],
      });
      setIsPublishOpen(false);
      setSelectedAnnouncement(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to publish announcement');
    },
  });

  // Mutation: Schedule Announcement
  const scheduleMutation = useMutation({
    mutationFn: async ({
      announcementId,
      dto,
    }: {
      announcementId: string;
      dto: ScheduleAnnouncementDto;
    }) => {
      setActionError(null);
      return await apiClient.scheduleAnnouncement(hackathonId, announcementId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['hackathon-announcements', hackathonId],
      });
      setIsScheduleOpen(false);
      setSelectedAnnouncement(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to schedule announcement');
    },
  });

  // Mutation: Cancel Scheduled Announcement
  const cancelMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      setActionError(null);
      return await apiClient.cancelAnnouncement(hackathonId, announcementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['hackathon-announcements', hackathonId],
      });
      setSelectedAnnouncement(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to cancel scheduled announcement');
    },
  });

  const updateFilters = useCallback(
    (updates: Partial<AnnouncementFilterState>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      status: 'ALL',
      scope: 'ALL',
      trackId: 'ALL',
      search: '',
    });
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters,
    tracks,
    announcements,
    filteredAnnouncements,
    metrics,
    isLoading,
    isError,
    refetch,
    // Modals
    selectedAnnouncement,
    setSelectedAnnouncement,
    isCreateOpen,
    setIsCreateOpen,
    isPublishOpen,
    setIsPublishOpen,
    isScheduleOpen,
    setIsScheduleOpen,
    isDetailOpen,
    setIsDetailOpen,
    actionError,
    setActionError,
    // Mutations
    createMutation,
    publishMutation,
    scheduleMutation,
    cancelMutation,
  };
}

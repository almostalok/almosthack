'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  SingleHackathonWorkspaceData,
  DETERMINISTIC_WORKSPACE_DATA,
} from './workspace-mock-data';

export interface UseHackathonWorkspaceOptions {
  hackathonId: string;
}

export function useHackathonWorkspace({ hackathonId }: UseHackathonWorkspaceOptions) {
  // Fetch hackathon details
  const {
    data: hackathon,
    isLoading: isLoadingHackathon,
    isError: isHackathonError,
    error: hackathonError,
    refetch: refetchHackathon,
  } = useQuery({
    queryKey: ['workspace-hackathon', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathon(hackathonId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(hackathonId),
    staleTime: 1000 * 60 * 2,
  });

  // Fetch lifecycle
  const {
    data: lifecycle,
    isLoading: isLoadingLifecycle,
    refetch: refetchLifecycle,
  } = useQuery({
    queryKey: ['workspace-lifecycle', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathonLifecycle(hackathonId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(hackathonId),
    staleTime: 1000 * 60 * 2,
  });

  // Fetch tracks
  const {
    data: tracks = [],
    isLoading: isLoadingTracks,
    refetch: refetchTracks,
  } = useQuery({
    queryKey: ['workspace-tracks', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathonTracks(hackathonId);
      } catch {
        return [];
      }
    },
    enabled: Boolean(hackathonId),
    staleTime: 1000 * 60 * 2,
  });

  const isLoading = isLoadingHackathon && isLoadingLifecycle;

  // Format date range string
  const formatDateRange = (startsAt?: string, endsAt?: string) => {
    if (!startsAt || !endsAt) return DETERMINISTIC_WORKSPACE_DATA.hackathon.dateRangeLabel;
    try {
      const s = new Date(startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const e = new Date(endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${s} — ${e}`;
    } catch {
      return DETERMINISTIC_WORKSPACE_DATA.hackathon.dateRangeLabel;
    }
  };

  // Construct consolidated workspace data
  const workspaceData: SingleHackathonWorkspaceData = {
    ...DETERMINISTIC_WORKSPACE_DATA,
    hackathon: {
      ...DETERMINISTIC_WORKSPACE_DATA.hackathon,
      id: hackathon?.id || hackathonId || DETERMINISTIC_WORKSPACE_DATA.hackathon.id,
      name: hackathon?.name || DETERMINISTIC_WORKSPACE_DATA.hackathon.name,
      slug: hackathon?.slug || DETERMINISTIC_WORKSPACE_DATA.hackathon.slug,
      organization: hackathon?.organization?.name || DETERMINISTIC_WORKSPACE_DATA.hackathon.organization,
      description: hackathon?.description || DETERMINISTIC_WORKSPACE_DATA.hackathon.description,
      status: (hackathon?.status as any) || DETERMINISTIC_WORKSPACE_DATA.hackathon.status,
      startsAt: hackathon?.startsAt || DETERMINISTIC_WORKSPACE_DATA.hackathon.startsAt,
      endsAt: hackathon?.endsAt || DETERMINISTIC_WORKSPACE_DATA.hackathon.endsAt,
      dateRangeLabel: formatDateRange(hackathon?.startsAt, hackathon?.endsAt),
      tracksCount: tracks.length > 0 ? tracks.length : DETERMINISTIC_WORKSPACE_DATA.hackathon.tracksCount,
    },
  };

  const refetch = async () => {
    await Promise.all([refetchHackathon(), refetchLifecycle(), refetchTracks()]);
  };

  return {
    data: workspaceData,
    isLoading,
    isError: isHackathonError && !hackathon,
    error: hackathonError,
    refetch,
  };
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  OrganizerDashboardData,
  DETERMINISTIC_DASHBOARD_DATA,
} from './dashboard-mock-data';

export interface UseOrganizerDashboardOptions {
  hackathonId?: string;
}

export function useOrganizerDashboard(options?: UseOrganizerDashboardOptions) {
  // Query organizations & active hackathons
  const {
    data: organizations,
    isLoading: isLoadingOrgs,
    isError: isOrgsError,
    error: orgsError,
    refetch: refetchOrgs,
  } = useQuery({
    queryKey: ['user-organizations-dashboard'],
    queryFn: async () => {
      try {
        return await apiClient.getUserOrganizations();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Query hackathon details if hackathonId is provided
  const activeHackathonId = options?.hackathonId || DETERMINISTIC_DASHBOARD_DATA.activeHackathon.id;

  const {
    data: hackathonDetail,
    isLoading: isLoadingHackathon,
    isError: isHackathonError,
    refetch: refetchHackathon,
  } = useQuery({
    queryKey: ['dashboard-hackathon-detail', activeHackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathon(activeHackathonId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(activeHackathonId),
    staleTime: 1000 * 60 * 2,
  });

  const isLoading = isLoadingOrgs && isLoadingHackathon;
  const isError = isOrgsError && !organizations;

  // Derive consolidated dashboard data
  const dashboardData: OrganizerDashboardData = {
    ...DETERMINISTIC_DASHBOARD_DATA,
    activeHackathon: hackathonDetail
      ? {
          ...DETERMINISTIC_DASHBOARD_DATA.activeHackathon,
          id: hackathonDetail.id || activeHackathonId,
          name: hackathonDetail.name || DETERMINISTIC_DASHBOARD_DATA.activeHackathon.name,
          slug: hackathonDetail.slug || DETERMINISTIC_DASHBOARD_DATA.activeHackathon.slug,
          status: (hackathonDetail.status as any) || 'LIVE',
          startsAt: hackathonDetail.startsAt || DETERMINISTIC_DASHBOARD_DATA.activeHackathon.startsAt,
          endsAt: hackathonDetail.endsAt || DETERMINISTIC_DASHBOARD_DATA.activeHackathon.endsAt,
        }
      : DETERMINISTIC_DASHBOARD_DATA.activeHackathon,
  };

  const isEmpty = organizations && Array.isArray(organizations) && organizations.length === 0;

  const refetch = async () => {
    await Promise.all([refetchOrgs(), refetchHackathon()]);
  };

  return {
    data: dashboardData,
    isLoading,
    isError,
    error: orgsError,
    isEmpty: false, // Default to operational dashboard view
    refetch,
  };
}

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PageContainer } from '@/components/application';
import { SubmissionsManagementView } from '@/components/submissions';
import { Skeleton } from '@almosthack/ui';

export default function GlobalSubmissionsPage() {
  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['user-organizations'],
    queryFn: async () => {
      try {
        const res = await apiClient.getUserOrganizations();
        return Array.isArray(res) ? res : [];
      } catch {
        return [{ id: 'org_default', name: 'AlmostHack' }];
      }
    },
  });

  const activeHackathonId = 'htf-2026';

  if (isLoading) {
    return (
      <PageContainer maxWidth="7xl" className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-[8px]" />
        <Skeleton className="h-96 rounded-[12px]" />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="7xl" className="space-y-6">
      <SubmissionsManagementView hackathonId={activeHackathonId} />
    </PageContainer>
  );
}

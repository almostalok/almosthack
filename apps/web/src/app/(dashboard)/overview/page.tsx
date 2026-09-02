'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageContainer } from '@/components/application';
import { OrganizerOverview } from '@/components/dashboard';
import { HackerDashboardView } from '@/components/hacker-experience';
import { useAuth } from '@/providers/auth-provider';

export default function OverviewPage() {
  const { user } = useAuth();
  const isParticipant =
    user?.roles?.includes('PARTICIPANT') || user?.roles?.includes('HACKER');
  const isOrganizer =
    user?.roles?.includes('ORGANIZER') || user?.roles?.includes('ADMIN');

  if (isParticipant && !isOrganizer) {
    return (
      <PageContainer maxWidth="7xl" className="space-y-6">
        <HackerDashboardView />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="7xl" className="space-y-6">
      <OrganizerOverview />
    </PageContainer>
  );
}

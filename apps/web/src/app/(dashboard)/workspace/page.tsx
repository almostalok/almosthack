'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageContainer } from '@/components/application';
import { HackerDashboardView } from '@/components/hacker-experience';

export default function HackerWorkspacePage() {
  return (
    <PageContainer maxWidth="7xl" className="space-y-6">
      <HackerDashboardView />
    </PageContainer>
  );
}

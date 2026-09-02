'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageContainer } from '@/components/application';
import { AnalyticsManagementView } from '@/components/analytics';

export default function GlobalAnalyticsPage() {
  return (
    <PageContainer maxWidth="7xl" className="space-y-6">
      <AnalyticsManagementView hackathonId="htf-2026" />
    </PageContainer>
  );
}

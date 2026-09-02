'use client';

import React from 'react';
import { PageContainer } from '../../../components/application';
import { OrganizerOverview } from '../../../components/dashboard';

export default function OverviewPage() {
  return (
    <PageContainer maxWidth="7xl" className="space-y-6">
      <OrganizerOverview />
    </PageContainer>
  );
}

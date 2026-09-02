'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/application';
import { RegistrationsManagementView } from '@/components/registrations';

export default function HackathonRegistrationsPage() {
  const params = useParams();
  const hackathonId = (params.hackathonId as string) || 'htf-2026';

  return (
    <PageContainer maxWidth="7xl" className="space-y-6">
      <RegistrationsManagementView hackathonId={hackathonId} />
    </PageContainer>
  );
}

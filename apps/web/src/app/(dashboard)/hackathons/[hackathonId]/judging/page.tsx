'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/application';
import { JudgingManagementView } from '@/components/judging';

export default function HackathonJudgingPage() {
  const params = useParams();
  const hackathonId = (params.hackathonId as string) || 'htf-2026';

  return (
    <PageContainer maxWidth="7xl" className="space-y-6">
      <JudgingManagementView hackathonId={hackathonId} />
    </PageContainer>
  );
}

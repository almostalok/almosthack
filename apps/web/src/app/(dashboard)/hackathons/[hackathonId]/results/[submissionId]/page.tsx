'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/application';
import { TransparentJudgingView } from '@/components/transparent-judging';

export default function SubmissionTransparentJudgingPage() {
  const params = useParams();
  const hackathonId = (params.hackathonId as string) || 'htf-2026';
  const submissionId = (params.submissionId as string) || 'sub_forgezk';

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <TransparentJudgingView
        hackathonId={hackathonId}
        submissionId={submissionId}
      />
    </PageContainer>
  );
}

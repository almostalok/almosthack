'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageContainer } from '@/components/application';
import { CreateHackathonWizard } from '@/components/create-hackathon';

export default function CreateHackathonPage() {
  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <CreateHackathonWizard />
    </PageContainer>
  );
}

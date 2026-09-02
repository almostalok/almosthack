'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageContainer } from '@/components/application';
import { ParticipantCertificatesView } from '@/components/certificates';

export default function ParticipantCertificatesPage() {
  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <ParticipantCertificatesView />
    </PageContainer>
  );
}

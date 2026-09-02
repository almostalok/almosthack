'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/application';
import { PublicCertificateVerificationView } from '@/components/certificates';

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = (params.certificateId as string) || 'AH-2026-ZK914A';

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <PublicCertificateVerificationView certificateId={certificateId} />
    </PageContainer>
  );
}

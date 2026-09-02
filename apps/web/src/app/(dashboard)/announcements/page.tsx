'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageContainer } from '@/components/application';
import { ParticipantAnnouncementsView } from '@/components/announcements';

export default function GlobalAnnouncementsPage() {
  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <ParticipantAnnouncementsView />
    </PageContainer>
  );
}

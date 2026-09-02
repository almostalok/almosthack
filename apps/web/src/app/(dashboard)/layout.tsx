'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../components/application';
import { useAuth } from '../../providers/auth-provider';
import { RoleName } from '@almosthack/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F7F4EA] text-[#6D7068] font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#DCDDD3] border-t-[#028051] animate-spin" />
          <span>Hydrating AlmostHack application shell...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const primaryRole = (user.roles?.[0] as RoleName) || RoleName.ORGANIZER;

  return (
    <AppShell initialRole={primaryRole}>
      {children}
    </AppShell>
  );
}

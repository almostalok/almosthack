'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardShell, CommandPalette, Badge, Button } from '@almosthack/ui';
import { useKeyboardShortcuts } from '@almosthack/hooks';
import { useAuth } from '../../providers/auth-provider';
import { NotificationBell } from '../../components/notifications/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useKeyboardShortcuts({
    'meta+k': () => setIsCommandPaletteOpen(true),
    'ctrl+k': () => setIsCommandPaletteOpen(true),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F7F4EA] text-[#6D7068] font-mono text-sm">
        Hydrating session context...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const headerActions = (
    <div className="flex items-center gap-3">
      <NotificationBell />
      <div className="hidden sm:flex flex-col text-right">
        <span className="text-xs font-bold text-[#171914] font-body">{user.name}</span>
        <span className="text-[10px] font-mono text-[#6D7068]">{user.email}</span>
      </div>
      <Badge variant="accent" size="sm">
        {user.roles?.[0] || 'PARTICIPANT'}
      </Badge>
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          await logout();
          router.push('/login');
        }}
        className="text-xs"
      >
        Logout
      </Button>
    </div>
  );

  return (
    <>
      <DashboardShell
        currentPath={pathname}
        onNavigate={(href) => router.push(href)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        userName={user.name}
        userEmail={user.email}
        role={user.roles?.[0] || 'PARTICIPANT'}
        headerActions={headerActions}
      >
        {children}
      </DashboardShell>

      {/* Raycast/Linear-style Command Palette Overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={(href) => router.push(href)}
      />
    </>
  );
}

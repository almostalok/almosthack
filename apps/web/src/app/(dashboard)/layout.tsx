'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarNav, TopHeader, CommandPalette } from '@almosthack/ui';
import { useKeyboardShortcuts, useThemeStore } from '@almosthack/hooks';
import { useAuth } from '../../providers/auth-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { mode, toggleTheme } = useThemeStore();
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
      <div className="flex h-screen w-screen items-center justify-center bg-black text-zinc-400 font-mono text-sm">
        Hydrating session context...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-zinc-100 font-sans">
      {/* Fixed Sidebar Navigation */}
      <SidebarNav
        currentPath={pathname}
        onNavigate={(href) => router.push(href)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header with User Status & Logout */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 py-3 backdrop-blur">
          <TopHeader
            isDarkMode={mode === 'dark'}
            onToggleTheme={toggleTheme}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs font-mono font-semibold text-zinc-200">{user.name}</div>
              <div className="text-[10px] font-mono text-zinc-400">{user.email}</div>
            </div>
            <div className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
              {user.roles.join(', ') || 'PARTICIPANT'}
            </div>
            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </main>
      </div>

      {/* Raycast-style Command Palette Overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={(href) => router.push(href)}
      />
    </div>
  );
}

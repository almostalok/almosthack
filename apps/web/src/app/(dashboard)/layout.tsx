'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarNav, TopHeader, CommandPalette } from '@almosthack/ui';
import { useKeyboardShortcuts, useThemeStore } from '@almosthack/hooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { mode, toggleTheme } = useThemeStore();

  useKeyboardShortcuts({
    'meta+k': () => setIsCommandPaletteOpen(true),
    'ctrl+k': () => setIsCommandPaletteOpen(true),
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-zinc-100 font-sans">
      {/* Fixed Sidebar Navigation */}
      <SidebarNav
        currentPath={pathname}
        onNavigate={(href) => router.push(href)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header */}
        <TopHeader
          isDarkMode={mode === 'dark'}
          onToggleTheme={toggleTheme}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

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

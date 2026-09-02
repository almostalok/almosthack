'use client';

import React from 'react';
import { cn } from '@almosthack/utils';
import { RoleName } from '@almosthack/types';
import { useKeyboardShortcuts } from '@almosthack/hooks';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { MobileNavigation } from './MobileNavigation';
import { GlobalSearch } from './GlobalSearch';
import { useShellState, WorkspaceItem } from '../../hooks/use-shell-state';

export interface AppShellProps {
  initialRole?: RoleName;
  workspaces?: WorkspaceItem[];
  children: React.ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  initialRole = RoleName.ORGANIZER,
  workspaces: customWorkspaces,
  children,
  className,
}) => {
  const {
    isCollapsed,
    toggleCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    isSearchOpen,
    setIsSearchOpen,
    activeRole,
    setActiveRole,
    workspaces,
    activeWorkspace,
    selectWorkspace,
  } = useShellState(initialRole);

  const effectiveWorkspaces = customWorkspaces || workspaces;

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    'meta+k': () => setIsSearchOpen(true),
    'ctrl+k': () => setIsSearchOpen(true),
    'meta+b': () => toggleCollapsed(),
    'ctrl+b': () => toggleCollapsed(),
  });

  return (
    <div
      className={cn(
        'flex h-screen w-screen overflow-hidden bg-[#F7F4EA] text-[#171914] font-body text-left antialiased',
        className
      )}
    >
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <AppSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapsed}
          activeRole={activeRole}
          workspaces={effectiveWorkspaces}
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={selectWorkspace}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNavigation
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        activeRole={activeRole}
        workspaces={effectiveWorkspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={selectWorkspace}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <AppTopbar
          onToggleMobileMenu={() => setIsMobileOpen(true)}
          onToggleSidebarCollapse={toggleCollapsed}
          isSidebarCollapsed={isCollapsed}
          onOpenSearch={() => setIsSearchOpen(true)}
          activeRole={activeRole}
          onSwitchRole={setActiveRole}
          activeWorkspace={activeWorkspace}
        />

        {/* Dynamic Main Content Viewport */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F7F4EA] focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Global Search Command Dialog (⌘K / Ctrl+K) */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

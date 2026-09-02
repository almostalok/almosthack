'use client';

import React from 'react';
import { Menu, Search, HelpCircle, ShieldCheck, PanelLeft, PanelLeftClose } from 'lucide-react';
import { cn } from '@almosthack/utils';
import { RoleName } from '@almosthack/types';
import { WorkspaceItem } from '../../hooks/use-shell-state';
import { NotificationCenter } from './NotificationCenter';
import { UserMenu } from './UserMenu';

export interface AppTopbarProps {
  onToggleMobileMenu: () => void;
  onToggleSidebarCollapse: () => void;
  isSidebarCollapsed: boolean;
  onOpenSearch: () => void;
  activeRole: RoleName;
  onSwitchRole: (role: RoleName) => void;
  activeWorkspace: WorkspaceItem;
  className?: string;
}

export const AppTopbar: React.FC<AppTopbarProps> = ({
  onToggleMobileMenu,
  onToggleSidebarCollapse,
  isSidebarCollapsed,
  onOpenSearch,
  activeRole,
  onSwitchRole,
  activeWorkspace,
  className,
}) => {
  return (
    <header
      className={cn(
        'h-16 bg-[#FFFDF8] border-b border-[#DCDDD3] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 font-body select-none shadow-2xs text-left',
        className
      )}
      aria-label="Application Topbar"
    >
      {/* Left Tools: Mobile Menu, Sidebar Toggle, Workspace Context */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          type="button"
          onClick={onToggleSidebarCollapse}
          className="hidden lg:flex p-2 text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-4 h-4 text-[#028051]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Active Workspace Status Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#DCDDD3]">
          <span className="w-2 h-2 rounded-full bg-[#028051] animate-pulse" />
          <span className="text-xs font-mono font-bold text-[#171914] truncate max-w-[180px] lg:max-w-[240px]">
            {activeWorkspace.name}
          </span>
          <span className="text-[10px] font-mono text-[#028051] bg-[#E2EBDD] px-2 py-0.5 rounded-[4px] border border-[#B8CEB0] font-bold">
            {activeWorkspace.status}
          </span>
        </div>
      </div>

      {/* Center: Global Search Trigger Button */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between gap-2.5 px-3 py-2 bg-[#F7F4EA] border border-[#DCDDD3] hover:border-[#355C45]/50 rounded-[10px] text-[#6D7068] hover:text-[#171914] text-xs transition-colors shadow-2xs cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051]"
          aria-label="Open global search (⌘K)"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 text-[#9A9C94] group-hover:text-[#171914] shrink-0" />
            <span className="truncate">Search hackathons, teams, rubrics, audit...</span>
          </div>
          <kbd className="hidden sm:inline-flex text-[10px] font-mono bg-[#FFFDF8] border border-[#DCDDD3] px-1.5 py-0.5 rounded-[4px] text-[#6D7068] shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Tools: Notifications, Help, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Center */}
        <NotificationCenter />

        {/* User Account Menu */}
        <UserMenu
          activeRole={activeRole}
          onSwitchRole={onSwitchRole}
        />
      </div>
    </header>
  );
};

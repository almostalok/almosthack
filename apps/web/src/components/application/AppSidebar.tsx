'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@almosthack/utils';
import { RoleName } from '@almosthack/types';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { WorkspaceItem } from '../../hooks/use-shell-state';
import { getNavSectionsForRole } from './navigation-config';

export interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeRole: RoleName;
  workspaces: WorkspaceItem[];
  activeWorkspace: WorkspaceItem;
  onSelectWorkspace: (workspace: WorkspaceItem) => void;
  onNavigate?: () => void;
  className?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeRole,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onNavigate,
  className,
}) => {
  const pathname = usePathname();
  const navSections = getNavSectionsForRole(activeRole);

  const isItemActive = (href: string, matchExact?: boolean) => {
    if (matchExact) {
      return pathname === href;
    }
    if (href === '/overview') {
      return pathname === '/overview';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={cn(
        'h-screen bg-[#FFFDF8] border-r border-[#DCDDD3] flex flex-col justify-between font-body select-none shrink-0 text-left transition-all duration-200 z-30',
        isCollapsed ? 'w-[72px] p-2' : 'w-64 p-3.5',
        className
      )}
      aria-label="Application Navigation Sidebar"
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col gap-4">
        {/* Brand Header */}
        <Link
          href="/overview"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-2.5 rounded-[10px] p-1.5 hover:bg-[#F7F4EA] transition-colors group',
            isCollapsed ? 'justify-center' : 'px-2'
          )}
          title={isCollapsed ? 'AlmostHack Platform' : undefined}
        >
          <div className="w-8 h-8 rounded-[8px] bg-[#028051] flex items-center justify-center text-white font-heading font-extrabold text-sm shadow-xs group-hover:bg-[#03A066] transition-colors border border-[#03A066]/50 shrink-0">
            AH
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-extrabold text-base text-[#171914] tracking-tight leading-none">
                almosthack
              </span>
              <span className="text-[10px] font-mono text-[#6D7068] tracking-wider uppercase mt-0.5">
                Operating System
              </span>
            </div>
          )}
        </Link>

        {/* Workspace Switcher */}
        <div className="pt-1">
          <WorkspaceSwitcher
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onSelectWorkspace={onSelectWorkspace}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* Navigation Sections */}
        <nav className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-220px)] pt-2 pr-0.5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-1">
              {!isCollapsed && section.sectionTitle && (
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#9A9C94] font-bold">
                  {section.sectionTitle}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.href, item.matchExact);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-[9px] text-xs transition-colors font-medium cursor-pointer relative group',
                      isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 justify-between',
                      isActive
                        ? 'bg-[#E2EBDD] text-[#274535] font-semibold border border-[#B8CEB0]'
                        : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#028051]' : 'text-[#6D7068]')} />
                      {!isCollapsed && (
                        <span className="truncate font-body">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] bg-[#028051] text-white shrink-0">
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip on collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 rounded-[6px] bg-[#171914] text-white text-xs font-mono font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Status & Collapse Toggle */}
      <div className="flex flex-col gap-2 pt-3 border-t border-[#DCDDD3]">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 text-[11px] font-mono text-[#6D7068]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#028051] animate-pulse" />
              <span>Verifiable Ledger</span>
            </span>
            <span className="text-[10px] text-[#9A9C94]">v1.4</span>
          </div>
        )}

        {/* Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'flex items-center gap-2 rounded-[8px] p-2 text-xs font-mono text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] transition-colors cursor-pointer',
            isCollapsed ? 'justify-center' : 'justify-between px-2.5'
          )}
          title={isCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!isCollapsed && <span>Collapse Sidebar</span>}
          {isCollapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] bg-[#F7F4EA] border border-[#DCDDD3] px-1 rounded">⌘B</kbd>
              <ChevronsLeft className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

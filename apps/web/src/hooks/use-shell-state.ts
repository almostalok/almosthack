'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { RoleName } from '@almosthack/types';

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  status: 'LIVE' | 'DRAFT' | 'JUDGING' | 'COMPLETED' | 'ARCHIVED';
  role: string;
  participantCount?: number;
}

export const DEFAULT_WORKSPACES: WorkspaceItem[] = [
  {
    id: 'htf-2026',
    name: 'Hack The Future 2026',
    slug: 'hack-the-future-2026',
    status: 'LIVE',
    role: 'ORGANIZER',
    participantCount: 847,
  },
  {
    id: 'codesprint-2026',
    name: 'CodeSprint 2026',
    slug: 'codesprint-2026',
    status: 'DRAFT',
    role: 'ORGANIZER',
    participantCount: 124,
  },
  {
    id: 'buildfest-2025',
    name: 'BuildFest Global 2025',
    slug: 'buildfest-global-2025',
    status: 'COMPLETED',
    role: 'ORGANIZER',
    participantCount: 1420,
  },
];

const SIDEBAR_COLLAPSE_STORAGE_KEY = 'almosthack_sidebar_collapsed';

export function useShellState(initialRole: RoleName = RoleName.ORGANIZER) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<RoleName>(initialRole);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(DEFAULT_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceItem>(DEFAULT_WORKSPACES[0]);

  // Load saved sidebar collapse preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // localStorage may be disabled or restricted in private browsing
    }
  }, []);

  // Sync role if initialRole updates from auth
  useEffect(() => {
    if (initialRole) {
      setActiveRole(initialRole);
    }
  }, [initialRole]);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, String(next));
      } catch {
        // Ignored
      }
      return next;
    });
  }, []);

  const selectWorkspace = useCallback((workspace: WorkspaceItem) => {
    setActiveWorkspace(workspace);
  }, []);

  return {
    isCollapsed,
    setIsCollapsed,
    toggleCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    isSearchOpen,
    setIsSearchOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    activeRole,
    setActiveRole,
    workspaces,
    setWorkspaces,
    activeWorkspace,
    selectWorkspace,
    currentPath: pathname,
  };
}

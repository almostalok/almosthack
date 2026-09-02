'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@almosthack/utils';
import { RoleName } from '@almosthack/types';
import { AppSidebar } from './AppSidebar';
import { WorkspaceItem } from '../../hooks/use-shell-state';

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: RoleName;
  workspaces: WorkspaceItem[];
  activeWorkspace: WorkspaceItem;
  onSelectWorkspace: (workspace: WorkspaceItem) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  activeRole,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus management and escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0B0C0B]/60 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 left-0 max-w-[calc(100vw-3rem)] w-[280px] bg-[#FFFDF8] border-r border-[#DCDDD3] shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200"
      >
        <div className="absolute top-3 right-3 z-20">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[8px] text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer"
            aria-label="Close mobile navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <AppSidebar
          isCollapsed={false}
          onToggleCollapse={() => {}}
          activeRole={activeRole}
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={(ws) => {
            onSelectWorkspace(ws);
            onClose();
          }}
          onNavigate={onClose}
          className="w-full border-r-0"
        />
      </div>
    </div>
  );
};

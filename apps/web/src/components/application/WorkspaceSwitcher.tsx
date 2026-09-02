'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Check, Plus, Search, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@almosthack/utils';
import { WorkspaceItem } from '../../hooks/use-shell-state';

export interface WorkspaceSwitcherProps {
  workspaces: WorkspaceItem[];
  activeWorkspace: WorkspaceItem;
  onSelectWorkspace: (workspace: WorkspaceItem) => void;
  isCollapsed?: boolean;
  className?: string;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  isCollapsed = false,
  className,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownId = useId();

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside and Escape key dismissal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: WorkspaceItem['status']) => {
    switch (status) {
      case 'LIVE':
        return <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#028051]"><span className="w-1.5 h-1.5 rounded-full bg-[#028051] animate-pulse" /> LIVE</span>;
      case 'DRAFT':
        return <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#785A12]"><span className="w-1.5 h-1.5 rounded-full bg-[#785A12]" /> DRAFT</span>;
      case 'JUDGING':
        return <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#453860]"><span className="w-1.5 h-1.5 rounded-full bg-[#453860]" /> JUDGING</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#6D7068]"><span className="w-1.5 h-1.5 rounded-full bg-[#9A9C94]" /> DONE</span>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-2.5 rounded-[10px] border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051]',
          isCollapsed ? 'p-2 justify-center bg-[#F7F4EA] border-[#DCDDD3] hover:border-[#355C45]/50' : 'p-2.5 bg-[#FFFDF8] border-[#DCDDD3] hover:border-[#355C45]/50 shadow-2xs'
        )}
        title={isCollapsed ? `${activeWorkspace.name} (${activeWorkspace.status})` : undefined}
      >
        {/* Workspace Monogram Avatar */}
        <div className="w-7 h-7 rounded-[7px] bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center font-heading font-extrabold text-xs text-[#274535] shrink-0">
          {getInitials(activeWorkspace.name)}
        </div>

        {!isCollapsed && (
          <div className="min-w-0 flex-1 flex flex-col">
            <span className="text-xs font-heading font-bold text-[#171914] truncate leading-tight">
              {activeWorkspace.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {getStatusBadge(activeWorkspace.status)}
              {activeWorkspace.participantCount && (
                <span className="text-[10px] font-mono text-[#6D7068]">
                  • {activeWorkspace.participantCount} builders
                </span>
              )}
            </div>
          </div>
        )}

        {!isCollapsed && (
          <ChevronsUpDown className="w-4 h-4 text-[#9A9C94] shrink-0 ml-auto" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={dropdownId}
          role="listbox"
          className={cn(
            'absolute z-50 mt-1.5 w-72 rounded-[14px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-2 font-body select-none',
            isCollapsed ? 'left-full ml-2 top-0' : 'left-0 right-0 w-full'
          )}
        >
          {/* Search Filter Header */}
          <div className="relative mb-2 px-1">
            <Search className="w-3.5 h-3.5 text-[#9A9C94] absolute left-3 top-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons..."
              className="w-full pl-8 pr-3 py-1.5 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] text-xs font-mono text-[#171914] placeholder-[#9A9C94] focus:outline-none focus:border-[#028051]"
            />
          </div>

          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#9A9C94] font-semibold">
            Your Hackathons ({filteredWorkspaces.length})
          </div>

          {/* List of Workspaces */}
          <div className="max-h-56 overflow-y-auto space-y-1 py-1">
            {filteredWorkspaces.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-[#6D7068]">
                No matching hackathons.
              </div>
            ) : (
              filteredWorkspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspace.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectWorkspace(ws);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 p-2 rounded-[8px] text-left transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#E2EBDD] text-[#274535]'
                        : 'text-[#171914] hover:bg-[#F7F4EA]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-[6px] flex items-center justify-center font-heading font-bold text-[10px] shrink-0',
                        isSelected
                          ? 'bg-[#274535] text-white'
                          : 'bg-[#F0ECE1] text-[#6D7068]'
                      )}
                    >
                      {getInitials(ws.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-heading font-bold truncate text-[#171914]">
                        {ws.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {getStatusBadge(ws.status)}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#028051] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Create Hackathon Action */}
          <div className="pt-2 mt-1 border-t border-[#DCDDD3]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/hackathons');
              }}
              className="w-full flex items-center gap-2 p-2 rounded-[8px] text-xs font-mono font-bold text-[#028051] hover:bg-[#E2EBDD] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Hackathon</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Trophy,
  Users,
  FileCode2,
  Gavel,
  ShieldCheck,
  Settings,
  ArrowRight,
  Plus,
  Terminal,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: 'Pages' | 'Hackathons' | 'Teams & Builders' | 'Submissions' | 'Quick Actions';
  title: string;
  description?: string;
  href?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Pages
  { id: 'p-overview', category: 'Pages', title: 'Platform Overview', description: 'Command center telemetry & summary', href: '/overview', icon: Terminal },
  { id: 'p-hackathons', category: 'Pages', title: 'Hackathons Directory', description: 'Manage active, draft and past hackathons', href: '/hackathons', icon: Trophy, badge: 'LIVE' },
  { id: 'p-judging', category: 'Pages', title: 'Judge Calibration & Scoring', description: 'Double-blind evaluations and rubrics', href: '/judging', icon: Gavel },
  { id: 'p-audit', category: 'Pages', title: 'Immutable Audit Logs', description: 'Cryptographic ledger and event history', href: '/audit-logs', icon: ShieldCheck },
  { id: 'p-organizations', category: 'Pages', title: 'Organizations', description: 'Manage enterprise orgs & workspaces', href: '/organizations', icon: Users },
  { id: 'p-settings', category: 'Pages', title: 'System Settings', description: 'Account, notifications and API keys', href: '/settings', icon: Settings },

  // Hackathons
  { id: 'h-htf', category: 'Hackathons', title: 'Hack The Future 2026', description: 'Active • 847 builders • 4 tracks', href: '/hackathons/htf-2026', icon: Trophy, badge: '● LIVE' },
  { id: 'h-eth', category: 'Hackathons', title: "EthGlobal Transparency Sprint '26", description: 'Active • $150,000 prize pool', href: '/hackathons', icon: Trophy },
  { id: 'h-vercel', category: 'Hackathons', title: 'Vercel AI Infrastructure Hack', description: 'Judging • 940 participants', href: '/hackathons', icon: Trophy },

  // Teams & Builders
  { id: 't-qq', category: 'Teams & Builders', title: 'QuantumQuest (Team)', description: 'AI Track • 3 members • Verified Repo', href: '/overview', icon: Users },
  { id: 't-zt', category: 'Teams & Builders', title: 'ZeroTrust Security (Team)', description: 'Security Track • 4 members', href: '/overview', icon: Users },
  { id: 'b-sarah', category: 'Teams & Builders', title: 'Dr. Sarah Lin (Judge)', description: 'AI & Neural Systems • 12/12 reviews completed', href: '/judging', icon: Users },

  // Submissions
  { id: 's-8492', category: 'Submissions', title: 'Sub-8492: QuantumQuest Protocol', description: 'Score: 85.3/100 • 42 commits audited', href: '/overview', icon: FileCode2, badge: '85.3' },
  { id: 's-1042', category: 'Submissions', title: 'Sub-1042: Neural Health Assistant', description: 'Score: 91.8/100 • Health Track', href: '/overview', icon: FileCode2, badge: '91.8' },

  // Quick Actions
  { id: 'qa-create-hackathon', category: 'Quick Actions', title: 'Create New Hackathon', description: 'Launch a new hackathon workspace', href: '/hackathons', icon: Plus },
  { id: 'qa-api-keys', category: 'Quick Actions', title: 'Manage API Keys & Webhooks', description: 'Configure developer access', href: '/settings', icon: Terminal },
];

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = query.trim() === ''
    ? SEARCH_DATABASE
    : SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );

  // Group items by category
  const categories = Array.from(new Set(filteredItems.map((item) => item.category)));

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        if (selected.action) selected.action();
        if (selected.href) router.push(selected.href);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  let flatIndexCounter = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Global Search Command Palette"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0B0C0B]/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-2xl rounded-[16px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden z-10 text-left font-body flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#DCDDD3] gap-3 bg-[#FFFDF8]">
          <Search className="w-5 h-5 text-[#9A9C94] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search hackathons, participants, submissions, audit logs... (Type to filter)"
            className="w-full bg-transparent text-sm font-body text-[#171914] placeholder-[#9A9C94] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#9A9C94] hover:text-[#171914]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] font-mono bg-[#F7F4EA] border border-[#DCDDD3] px-2 py-0.5 rounded-[5px] text-[#6D7068]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 max-h-[60vh]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#6D7068]">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            categories.map((category) => {
              const categoryItems = filteredItems.filter((i) => i.category === category);
              return (
                <div key={category} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#9A9C94] font-bold">
                    {category}
                  </div>
                  {categoryItems.map((item) => {
                    flatIndexCounter += 1;
                    const currentIndex = flatIndexCounter;
                    const isSelected = selectedIndex === currentIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.action) item.action();
                          if (item.href) router.push(item.href);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors cursor-pointer text-xs',
                          isSelected
                            ? 'bg-[#E2EBDD] text-[#274535]'
                            : 'text-[#171914] hover:bg-[#F7F4EA]'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={cn(
                              'w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0',
                              isSelected ? 'bg-[#274535] text-white' : 'bg-[#F0ECE1] text-[#6D7068]'
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-heading font-bold text-xs truncate block text-[#171914]">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="text-[11px] font-body text-[#6D7068] truncate block">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.badge && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] bg-[#355C45] text-[#FFFDF8]">
                              {item.badge}
                            </span>
                          )}
                          {isSelected && (
                            <CornerDownLeft className="w-3.5 h-3.5 text-[#028051]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="p-3 bg-[#F7F4EA] border-t border-[#DCDDD3] flex items-center justify-between text-[11px] font-mono text-[#6D7068]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-[#FFFDF8] border border-[#DCDDD3] px-1.5 py-0.5 rounded">↑</kbd>
              <kbd className="bg-[#FFFDF8] border border-[#DCDDD3] px-1.5 py-0.5 rounded">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-[#FFFDF8] border border-[#DCDDD3] px-1.5 py-0.5 rounded">↵</kbd> to select
            </span>
          </div>
          <span>Navigation & Actions</span>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  Shield,
  Gavel,
  Code2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@almosthack/utils';
import { RoleName } from '@almosthack/types';
import { useAuth } from '../../providers/auth-provider';

export interface UserMenuProps {
  activeRole: RoleName;
  onSwitchRole: (role: RoleName) => void;
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  activeRole,
  onSwitchRole,
  className,
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const userName = user?.name || 'Hackathon Architect';
  const userEmail = user?.email || 'architect@almosthack.io';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Click outside and Escape key dismissal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
    } catch {
      // Offline fallback
    }
    router.push('/login');
  };

  const roleList = [
    { role: RoleName.ORGANIZER, label: 'Organizer Console', icon: Shield, desc: 'Full event management & audit controls' },
    { role: RoleName.JUDGE, label: 'Judge Portal', icon: Gavel, desc: 'Double-blind evaluation & rubric scoring' },
    { role: RoleName.PARTICIPANT, label: 'Hacker Portal', icon: Code2, desc: 'Team workspace & project submissions' },
  ];

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        aria-label="User account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-[10px] hover:bg-[#F7F4EA] border border-transparent hover:border-[#DCDDD3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer text-left"
      >
        <div className="w-8 h-8 rounded-[8px] bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center font-heading font-extrabold text-xs text-[#274535] shrink-0">
          {getInitials(userName)}
        </div>

        <div className="hidden md:flex flex-col min-w-0 max-w-[140px]">
          <span className="text-xs font-heading font-bold text-[#171914] truncate leading-none">
            {userName}
          </span>
          <span className="text-[10px] font-mono text-[#6D7068] truncate mt-0.5">
            {activeRole}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-[#9A9C94] hidden md:block" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="User settings and role actions"
          className="absolute right-0 mt-2 w-72 rounded-[16px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-50 p-2 font-body select-none text-left"
        >
          {/* User Details Header */}
          <div className="p-3 bg-[#F7F4EA] rounded-[10px] border border-[#DCDDD3] mb-2">
            <div className="text-xs font-heading font-extrabold text-[#171914] truncate">
              {userName}
            </div>
            <div className="text-[11px] font-mono text-[#6D7068] truncate mt-0.5">
              {userEmail}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] border border-[#B8CEB0] text-[10px] font-mono font-bold text-[#274535]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#028051]" />
              <span>ROLE: {activeRole}</span>
            </div>
          </div>

          {/* Switch Role Section (Previewer) */}
          <div className="py-1">
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#9A9C94] font-bold">
              Switch Shell Role View
            </div>
            <div className="space-y-0.5">
              {roleList.map((item) => {
                const isSelected = activeRole === item.role;
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onSwitchRole(item.role);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-[8px] text-xs transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#E2EBDD] text-[#274535] font-bold'
                        : 'text-[#171914] hover:bg-[#F7F4EA]'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-[#6D7068]" />
                      <span>{item.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#028051]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-[#DCDDD3] my-1" />

          {/* Navigation Items */}
          <div className="space-y-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                router.push('/profile');
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-[8px] text-xs text-[#171914] hover:bg-[#F7F4EA] transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#6D7068]" />
              <span>Your Profile</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                router.push('/settings');
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-[8px] text-xs text-[#171914] hover:bg-[#F7F4EA] transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#6D7068]" />
              <span>Settings & Preferences</span>
            </button>
          </div>

          <div className="h-px bg-[#DCDDD3] my-1" />

          {/* Logout Action */}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 p-2 rounded-[8px] text-xs font-mono font-bold text-[#8B2C24] hover:bg-[#FBE6E3] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { cn } from '@almosthack/utils';
import {
  LayoutDashboard,
  Trophy,
  GitBranch,
  ShieldCheck,
  Award,
  Settings,
  User,
  Building2,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface SidebarNavProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentPath = '/overview',
  onNavigate,
  className,
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', href: '/overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', href: '/profile', icon: <User className="w-4 h-4" /> },
    { id: 'organizations', label: 'Organizations', href: '/organizations', icon: <Building2 className="w-4 h-4" /> },
    { id: 'hackathons', label: 'Hackathons', href: '/hackathons', icon: <Trophy className="w-4 h-4" />, badge: 'LIVE' },
    { id: 'repositories', label: 'Repositories', href: '/repositories', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'judges', label: 'Judge Calibration', href: '/judges', icon: <Award className="w-4 h-4" /> },
    { id: 'audit-logs', label: 'Audit Logs', href: '/audit-logs', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={cn(
        'w-64 h-full min-h-screen bg-[#FFFDF8] border-r border-[#DCDDD3] flex flex-col justify-between p-4 font-body select-none shrink-0 text-left',
        className
      )}
    >
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div
          onClick={() => onNavigate && onNavigate('/overview')}
          className="flex items-center gap-2.5 px-2 py-1 group cursor-pointer"
        >
          <div className="w-8 h-8 bg-[#355C45] rounded-[8px] flex items-center justify-center text-[#FFFDF8] font-extrabold font-heading text-base shadow-xs group-hover:bg-[#274535] transition-colors">
            AH
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-[#171914] font-heading tracking-tight leading-none">
              almosthack
            </span>
            <span className="text-[10px] text-[#6D7068] font-mono tracking-wider uppercase mt-0.5">
              Operating System
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#9A9C94] px-2 mb-1">
            Platform
          </span>
          {navItems.map((item) => {
            const isActive = currentPath === item.href || (item.href !== '/overview' && currentPath.startsWith(item.href));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate && onNavigate(item.href)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-[10px] text-xs transition-colors w-full text-left font-medium cursor-pointer',
                  isActive
                    ? 'bg-[#E2EBDD] text-[#274535] font-semibold border border-[#B8CEB0]'
                    : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#274535]' : 'text-[#6D7068]'}>{item.icon}</span>
                  <span className="font-body text-xs">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] bg-[#355C45] text-[#FFFDF8]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Environment Status */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[#DCDDD3]">
        <div className="flex items-center justify-between px-2 text-[11px] font-mono text-[#6D7068]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#355C45] animate-pulse" /> Verifiable OS
          </span>
          <span className="text-[10px] text-[#9A9C94]">v1.0</span>
        </div>
      </div>
    </aside>
  );
};

export const Sidebar = SidebarNav;

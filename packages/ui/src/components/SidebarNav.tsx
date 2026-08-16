import React from 'react';
import { cn } from '@almosthack/utils';
import {
  LayoutDashboard,
  Trophy,
  GitBranch,
  ShieldCheck,
  Award,
  Settings,
  Terminal,
  Activity,
  LogOut,
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
    <aside className={cn('w-64 h-screen bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between p-4 font-mono select-none shrink-0', className)}>
      <div className="flex flex-col gap-6">
        {/* Logo / Brand Header */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center text-black font-extrabold font-heading text-sm">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-zinc-100 font-heading tracking-tight">almosthack</span>
            <span className="text-[10px] text-zinc-500 tracking-wider uppercase">Operating System</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-semibold text-zinc-600 px-2 mb-1">Platform</span>
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate && onNavigate(item.href)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors w-full text-left font-medium',
                  isActive
                    ? 'bg-zinc-800/90 text-emerald-400 font-semibold border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                )}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Environment Status */}
      <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/80">
        <div className="flex items-center justify-between px-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Mainnet v1.0.0</span>
          <span className="font-mono text-[10px] text-zinc-600">CMD+K</span>
        </div>
      </div>
    </aside>
  );
};

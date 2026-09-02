'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sliders,
  Users,
  Users2,
  FileCode2,
  Scale,
  Award,
  Trophy,
  Megaphone,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface WorkspaceNavigationProps {
  hackathonId: string;
  className?: string;
}

export const WorkspaceNavigation: React.FC<WorkspaceNavigationProps> = ({
  hackathonId,
  className,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/hackathons/${hackathonId}`,
      matchExact: true,
      icon: LayoutDashboard,
    },
    {
      id: 'configuration',
      label: 'Configuration',
      href: `/hackathons/${hackathonId}/configuration`,
      icon: Sliders,
    },
    {
      id: 'registrations',
      label: 'Registrations',
      href: `/hackathons/${hackathonId}/registrations`,
      icon: Users,
    },
    {
      id: 'teams',
      label: 'Teams',
      href: `/hackathons/${hackathonId}/teams`,
      icon: Users2,
    },
    {
      id: 'submissions',
      label: 'Submissions',
      href: `/hackathons/${hackathonId}/submissions`,
      icon: FileCode2,
    },
    {
      id: 'judging',
      label: 'Judging',
      href: `/hackathons/${hackathonId}/judging`,
      icon: Scale,
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      href: `/hackathons/${hackathonId}/leaderboard`,
      icon: Trophy,
    },
    {
      id: 'results',
      label: 'Results',
      href: `/hackathons/${hackathonId}/results`,
      icon: Award,
    },
    {
      id: 'announcements',
      label: 'Announcements',
      href: `/hackathons/${hackathonId}/announcements`,
      icon: Megaphone,
    },
    {
      id: 'integrity',
      label: 'Audit & Integrity',
      href: `/hackathons/${hackathonId}/integrity`,
      icon: ShieldCheck,
    },
    {
      id: 'settings',
      label: 'Settings',
      href: `/hackathons/${hackathonId}/settings`,
      icon: Settings,
    },
  ];

  const isItemActive = (href: string, matchExact?: boolean) => {
    if (matchExact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav
      className={cn(
        'flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[#DCDDD3] select-none text-left',
        className
      )}
      role="tablist"
      aria-label="Hackathon Workspace Sections"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item.href, item.matchExact);

        return (
          <Link
            key={item.id}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer shrink-0',
              isActive
                ? 'bg-[#E2EBDD] text-[#274535] font-bold border border-[#B8CEB0]'
                : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#028051]' : 'text-[#6D7068]')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

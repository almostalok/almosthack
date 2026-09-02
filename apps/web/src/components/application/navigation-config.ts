import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Users2,
  FileCode2,
  Gavel,
  Award,
  FileCheck,
  BarChart3,
  Megaphone,
  ShieldCheck,
  Settings,
  HelpCircle,
  Scale,
  MessageSquare,
  History,
  User,
  Compass,
  Layers,
  Terminal,
} from 'lucide-react';
import { RoleName } from '@almosthack/types';

export interface ShellNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'default' | 'accent' | 'warning' | 'neutral';
  matchExact?: boolean;
}

export interface ShellNavSection {
  sectionTitle?: string;
  items: ShellNavItem[];
}

export const ORGANIZER_NAV_SECTIONS: ShellNavSection[] = [
  {
    sectionTitle: 'Core',
    items: [
      { id: 'overview', label: 'Overview', href: '/overview', icon: LayoutDashboard, matchExact: true },
      { id: 'hackathons', label: 'Hackathons', href: '/hackathons', icon: Trophy, badge: 'LIVE', badgeVariant: 'accent' },
      { id: 'registrations', label: 'Registrations', href: '/registrations', icon: Users },
      { id: 'teams', label: 'Teams', href: '/teams', icon: Users2 },
      { id: 'submissions', label: 'Submissions', href: '/submissions', icon: FileCode2 },
    ],
  },
  {
    sectionTitle: 'Evaluation & Outcomes',
    items: [
      { id: 'judging', label: 'Judging', href: '/judging', icon: Gavel },
      { id: 'results', label: 'Results', href: '/results', icon: Award },
      { id: 'certificates', label: 'Certificates', href: '/certificates', icon: FileCheck },
      { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    sectionTitle: 'Operations & System',
    items: [
      { id: 'announcements', label: 'Announcements', href: '/announcements', icon: Megaphone },
      { id: 'audit-logs', label: 'Audit Log', href: '/audit-logs', icon: ShieldCheck },
      { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
      { id: 'help', label: 'Help & Docs', href: '/help', icon: HelpCircle },
    ],
  },
];

export const JUDGE_NAV_SECTIONS: ShellNavSection[] = [
  {
    sectionTitle: 'Evaluation Portal',
    items: [
      { id: 'my-judging', label: 'My Judging', href: '/judging', icon: Gavel, matchExact: true },
      { id: 'assigned-submissions', label: 'Assigned Submissions', href: '/submissions', icon: FileCode2 },
      { id: 'evaluations', label: 'Evaluations', href: '/judging/evaluations', icon: Award },
      { id: 'rubrics', label: 'Rubrics', href: '/judging/rubrics', icon: Scale },
      { id: 'feedback', label: 'Feedback', href: '/judging/feedback', icon: MessageSquare },
      { id: 'history', label: 'History', href: '/judging/history', icon: History },
    ],
  },
  {
    sectionTitle: 'Account',
    items: [
      { id: 'profile', label: 'Profile', href: '/profile', icon: User },
      { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
      { id: 'help', label: 'Help & Rubric Guide', href: '/help', icon: HelpCircle },
    ],
  },
];

export const HACKER_NAV_SECTIONS: ShellNavSection[] = [
  {
    sectionTitle: 'Builder Portal',
    items: [
      { id: 'discover', label: 'Discover', href: '/hackathons', icon: Compass },
      { id: 'my-hackathons', label: 'My Hackathons', href: '/overview', icon: Layers, matchExact: true },
      { id: 'my-team', label: 'My Team', href: '/teams', icon: Users },
      { id: 'workspace', label: 'Workspace', href: '/workspace', icon: Terminal },
      { id: 'submissions', label: 'Submissions', href: '/submissions', icon: FileCode2 },
      { id: 'judging-status', label: 'Judging Status', href: '/judging', icon: Gavel },
      { id: 'results', label: 'Results', href: '/results', icon: Award },
      { id: 'certificates', label: 'Certificates', href: '/certificates', icon: FileCheck },
    ],
  },
  {
    sectionTitle: 'Account',
    items: [
      { id: 'profile', label: 'Profile', href: '/profile', icon: User },
      { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
      { id: 'help', label: 'Hacker Guide', href: '/help', icon: HelpCircle },
    ],
  },
];

export function getNavSectionsForRole(role: RoleName | string = RoleName.ORGANIZER): ShellNavSection[] {
  const normalized = String(role).toUpperCase();
  if (normalized === RoleName.JUDGE) {
    return JUDGE_NAV_SECTIONS;
  }
  if (normalized === RoleName.PARTICIPANT || normalized === 'HACKER') {
    return HACKER_NAV_SECTIONS;
  }
  return ORGANIZER_NAV_SECTIONS;
}

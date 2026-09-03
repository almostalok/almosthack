'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  FileCode2,
  Scale,
  Trophy,
  Award,
  Megaphone,
  History,
  Settings,
  Search,
  Bell,
  ChevronDown,
} from 'lucide-react';

interface OrganizerDashboardPreviewProps {
  className?: string;
  interactive?: boolean;
}

export const OrganizerDashboardPreview: React.FC<OrganizerDashboardPreviewProps> = ({
  className = '',
  interactive = true,
}) => {
  const [activeNav, setActiveNav] = useState('Overview');

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Hackathons', icon: Calendar },
    { label: 'Registrations', icon: UserCheck },
    { label: 'Teams', icon: Users },
    { label: 'Submissions', icon: FileCode2 },
    { label: 'Judging', icon: Scale },
    { label: 'Results', icon: Trophy },
    { label: 'Certificates', icon: Award },
    { label: 'Announcements', icon: Megaphone },
    { label: 'Audit Log', icon: History },
  ];

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#0F1210]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-[#F5F7F4] select-none transition-all duration-300 hover:border-white/20 ${className}`}
    >
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#141815]/90">
        <div className="flex items-center gap-3">
          {/* AlmostHack Logo Emblem */}
          <div className="w-7 h-7 rounded-lg bg-[#028051] flex items-center justify-center shadow-[0_0_12px_rgba(2,128,81,0.5)]">
            <div className="w-3.5 h-3.5 border-2 border-[#A8E63B] rounded-sm transform rotate-45" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-white">Build India 2026</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#A8E63B]/10 text-[#A8E63B] border border-[#A8E63B]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8E63B] animate-pulse" />
              LIVE
            </span>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-[#737A73]">
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white/[0.06] rounded text-[#A7AEA7] border border-white/[0.08]">
              ⌘K
            </kbd>
          </div>

          <button className="relative p-1.5 rounded-lg text-[#A7AEA7] hover:text-white hover:bg-white/[0.06] transition-colors" aria-label="Notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#A8E63B] ring-2 ring-[#0F1210]" />
          </button>

          <div className="flex items-center gap-2 pl-1 border-l border-white/[0.08]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#028051] to-[#A8E63B] flex items-center justify-center text-[10px] font-bold text-black ring-1 ring-white/20">
              AS
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="flex flex-col md:flex-row min-h-[380px]">
        {/* Left Mini Sidebar */}
        <div className="hidden md:flex flex-col justify-between w-44 lg:w-48 p-2.5 border-r border-white/[0.08] bg-[#0B0D0C]/80">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => interactive && setActiveNav(item.label)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#151917] text-[#A8E63B] font-semibold border border-white/[0.08] shadow-sm'
                      : 'text-[#A7AEA7] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A8E63B]' : 'text-[#737A73]'}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <div className="ml-auto w-1 h-3 rounded-full bg-[#A8E63B]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => interactive && setActiveNav('Settings')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#737A73] hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Right Dashboard Content */}
        <div className="flex-1 p-3.5 sm:p-4 space-y-3.5 bg-[#0B0D0C]/40">
          {/* Top 4 Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Metric 1: Participants */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#141815]/90 border border-white/[0.08] hover:border-white/15 transition-all">
              <div className="text-[11px] text-[#A7AEA7] font-medium">Participants</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight mt-0.5">
                1,248
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#A8E63B] font-mono mt-1">
                <span>↑ 128 today</span>
              </div>
            </div>

            {/* Metric 2: Teams */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#141815]/90 border border-white/[0.08] hover:border-white/15 transition-all">
              <div className="text-[11px] text-[#A7AEA7] font-medium">Teams</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight mt-0.5">
                312
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#A8E63B] font-mono mt-1">
                <span>↑ 32 today</span>
              </div>
            </div>

            {/* Metric 3: Submissions */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#141815]/90 border border-white/[0.08] hover:border-white/15 transition-all">
              <div className="text-[11px] text-[#A7AEA7] font-medium">Submissions</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight mt-0.5">
                218
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#A8E63B] font-mono mt-1">
                <span>↑ 18 today</span>
              </div>
            </div>

            {/* Metric 4: Judging Complete */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#141815]/90 border border-white/[0.08] hover:border-white/15 transition-all">
              <div className="text-[11px] text-[#A7AEA7] font-medium">Judging Complete</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight mt-0.5">
                64%
              </div>
              <div className="text-[10px] text-[#737A73] font-mono mt-1 truncate">
                156 / 244 evaluations
              </div>
            </div>
          </div>

          {/* Lower 2 Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left: Submission Activity Area Chart */}
            <div className="lg:col-span-7 p-3 sm:p-3.5 rounded-xl bg-[#141815]/90 border border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div>
                  <div className="text-xs font-semibold text-white">Submission Activity</div>
                  <div className="text-[11px] font-mono text-[#A7AEA7]">218 submissions received</div>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] text-[#A7AEA7]">
                  <span>Last 7 days</span>
                  <ChevronDown className="w-3 h-3 text-[#737A73]" />
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="relative h-28 sm:h-32 mt-2 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="heroChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A8E63B" stopOpacity="0.35" />
                      <stop offset="70%" stopColor="#028051" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#028051" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="320" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="320" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                  {/* Area Fill */}
                  <path
                    d="M 0 85 Q 50 80, 100 70 T 200 45 T 260 25 T 320 8 L 320 100 L 0 100 Z"
                    fill="url(#heroChartGradient)"
                  />

                  {/* Glowing Stroke Curve */}
                  <path
                    d="M 0 85 Q 50 80, 100 70 T 200 45 T 260 25 T 320 8"
                    fill="none"
                    stroke="#A8E63B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Key Interactive Point on final day */}
                  <circle cx="320" cy="8" r="4" fill="#A8E63B" stroke="#0F1210" strokeWidth="2" />
                </svg>

                {/* Day Labels */}
                <div className="flex items-center justify-between text-[9px] font-mono text-[#737A73] pt-1">
                  <span>24 Jun</span>
                  <span>25 Jun</span>
                  <span>26 Jun</span>
                  <span>27 Jun</span>
                  <span>28 Jun</span>
                  <span>29 Jun</span>
                  <span className="text-[#A8E63B] font-semibold">30 Jun</span>
                </div>
              </div>
            </div>

            {/* Right: Needs Attention Panel */}
            <div className="lg:col-span-5 p-3 sm:p-3.5 rounded-xl bg-[#141815]/90 border border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="text-xs font-semibold text-white">Needs Attention</div>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>

              <div className="space-y-2 my-1 text-xs">
                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[#A8E63B] mt-0.5">ⓘ</div>
                  <div className="text-[11px] text-[#A7AEA7] leading-tight">
                    <span className="font-semibold text-white">12 teams</span> haven&apos;t connected a repository
                  </div>
                </div>

                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[#A8E63B] mt-0.5">ⓘ</div>
                  <div className="text-[11px] text-[#A7AEA7] leading-tight">
                    <span className="font-semibold text-white">37 submissions</span> awaiting review
                  </div>
                </div>

                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[#A8E63B] mt-0.5">ⓘ</div>
                  <div className="text-[11px] text-[#A7AEA7] leading-tight">
                    <span className="font-semibold text-white">8 judges</span> haven&apos;t started
                  </div>
                </div>

                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="text-amber-400 mt-0.5">⚠</div>
                  <div className="text-[11px] text-amber-200 leading-tight font-medium">
                    Submission deadline in <span className="font-mono font-bold text-amber-300">18h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

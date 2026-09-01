'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileCode2,
  GitPullRequest,
  Gavel,
  Trophy,
  Award,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@almosthack/utils';

// ==========================================
// 1. DASHBOARD SIDEBAR SUBCOMPONENT
// ==========================================
export interface DashboardSidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  className?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  className,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: null },
    { id: 'registrations', label: 'Registrations', icon: UserCheck, count: '847' },
    { id: 'teams', label: 'Teams', icon: Users, count: '132' },
    { id: 'submissions', label: 'Submissions', icon: FileCode2, count: '76' },
    { id: 'tracks', label: 'Tracks', icon: GitPullRequest, count: '4' },
    { id: 'judging', label: 'Judging', icon: Gavel, count: '72%' },
    { id: 'results', label: 'Results', icon: Trophy, count: null },
    { id: 'certificates', label: 'Certificates', icon: Award, count: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
  ];

  return (
    <aside
      className={cn(
        'w-48 bg-[#141614] border-r border-[#242824] flex flex-col justify-between py-3.5 px-2 select-none shrink-0 font-body',
        className
      )}
    >
      <div className="space-y-4">
        {/* Workspace pill */}
        <div className="px-2.5 py-1.5 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-[#EDEDED] truncate">
              prod-instance
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#737373] bg-[#222622] px-1 py-0.5 rounded">
            v1.4
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-0.5" aria-label="Dashboard Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-[7px] text-xs font-medium transition-all text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#028051]',
                  isActive
                    ? 'bg-[#028051]/15 text-[#03A066] font-semibold border border-[#028051]/30 shadow-xs'
                    : 'text-[#A3A3A3] hover:text-[#EDEDED] hover:bg-[#1A1C1A] border border-transparent'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#03A066]' : 'text-[#737373]')} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.2 rounded',
                      isActive
                        ? 'bg-[#028051]/30 text-[#5EEAD4]'
                        : 'bg-[#222622] text-[#737373]'
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator tag */}
      <div className="px-2 pt-2 border-t border-[#242824] flex items-center justify-between text-[10px] font-mono text-[#737373]">
        <span>ORGANIZER MODE</span>
        <span className="text-[#03A066]">ONLINE</span>
      </div>
    </aside>
  );
};

// ==========================================
// 2. DASHBOARD HEADER SUBCOMPONENT
// ==========================================
export interface DashboardHeaderProps {
  title?: string;
  status?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = 'Hack The Future 2026',
  status = 'LIVE',
}) => {
  return (
    <div className="px-4 py-3 bg-[#161816] border-b border-[#242824] flex flex-wrap items-center justify-between gap-3 text-left">
      <div className="flex items-center gap-3">
        <h2 className="text-base sm:text-lg font-heading font-extrabold text-white tracking-tight">
          {title}
        </h2>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#028051]/20 border border-[#028051]/50 text-[#03A066] text-[10px] font-mono font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#03A066] animate-pulse" />
          {status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1C1A] border border-[#282C28] rounded-[6px] text-[#737373] font-mono text-[11px]">
          <Search className="w-3 h-3 text-[#737373]" />
          <span>cmd + k to query</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1A1C1A] border border-[#282C28] rounded-[6px] text-[#A3A3A3] text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#03A066]" />
          <span className="hidden xs:inline">Audit Verifier:</span>
          <span className="text-[#03A066] font-bold">Pass</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. METRIC GRID SUBCOMPONENT
// ==========================================
export interface MetricGridProps {
  metrics?: Array<{
    label: string;
    value: string | number;
    sub: string;
    trend: string;
  }>;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  metrics = [
    { label: 'Registered', value: '847', sub: '+42 in last 2h', trend: '+18%' },
    { label: 'Teams', value: '132', sub: '94% formed', trend: '+12%' },
    { label: 'Submissions', value: '76', sub: '38 repos synced', trend: '+24%' },
    { label: 'Judges', value: '24', sub: 'Calibrated consensus', trend: '100%' },
  ],
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5">
      {metrics.map((item, idx) => (
        <div
          key={item.label}
          className="p-3 bg-[#1A1D1A] hover:bg-[#1E221E] border border-[#282C28] rounded-[10px] text-left transition-all duration-150 group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8C908C]">
            <span className="uppercase tracking-wider">{item.label}</span>
            <span className="text-[10px] text-[#03A066] font-semibold bg-[#028051]/10 px-1 py-0.2 rounded border border-[#028051]/20">
              {item.trend}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold text-white mt-1 group-hover:text-[#5EEAD4] transition-colors">
            {item.value}
          </div>
          <div className="text-[10px] font-mono text-[#737373] mt-0.5 truncate">
            {item.sub}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 4. SUBMISSION CHART SUBCOMPONENT
// ==========================================
export const SubmissionChart: React.FC = () => {
  const chartData = [
    { time: '00h', count: 4, height: '14%' },
    { time: '06h', count: 12, height: '28%' },
    { time: '12h', count: 26, height: '48%' },
    { time: '18h', count: 45, height: '68%' },
    { time: '24h', count: 62, height: '82%' },
    { time: '36h', count: 76, height: '100%' },
  ];

  return (
    <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px] text-left">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] font-bold">
            Submissions Over Time
          </h3>
          <p className="text-[10px] font-mono text-[#737373] mt-0.5">
            Real-time GitHub commit & repo integrity validation stream
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#03A066] bg-[#028051]/15 px-2 py-0.5 rounded border border-[#028051]/30">
            <Radio className="w-2.5 h-2.5 animate-pulse text-[#03A066]" /> Live Sync
          </span>
        </div>
      </div>

      {/* SVG / CSS Bar Chart */}
      <div className="h-24 sm:h-28 w-full flex items-end justify-between gap-2 pt-4 px-1">
        {chartData.map((d, index) => (
          <div key={d.time} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
            {/* Hover tooltip value */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-[#EDEDED] bg-[#222622] px-1 py-0.2 rounded border border-[#303630]">
              {d.count}
            </div>
            {/* Bar */}
            <div className="w-full max-w-[32px] bg-[#1F231F] group-hover:bg-[#283028] rounded-t-[4px] relative overflow-hidden flex items-end h-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: d.height }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                className="w-full bg-gradient-to-t from-[#028051] to-[#03A066] rounded-t-[4px] group-hover:brightness-110 transition-all"
              />
            </div>
            <span className="text-[9px] font-mono text-[#737373] group-hover:text-[#A3A3A3]">
              {d.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 5. RECENT SUBMISSIONS SUBCOMPONENT
// ==========================================
export const RecentSubmissions: React.FC = () => {
  const submissions = [
    {
      name: 'QuantumQuest',
      track: 'AI',
      status: 'APPROVED',
      lead: 'alex.eth',
      score: '9.4/10',
    },
    {
      name: 'GreenChain',
      track: 'Blockchain',
      status: 'PENDING',
      lead: 'dev_maya',
      score: 'In Review',
    },
    {
      name: 'MedAI Assist',
      track: 'Health',
      status: 'APPROVED',
      lead: 'chen_lab',
      score: '9.1/10',
    },
    {
      name: 'ByteBuddy',
      track: 'Web',
      status: 'APPROVED',
      lead: 'sarah_k',
      score: '8.8/10',
    },
  ];

  return (
    <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px] text-left">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] font-bold">
          Recent Submissions
        </h3>
        <span className="text-[10px] font-mono text-[#737373] flex items-center gap-1 hover:text-[#EDEDED] cursor-pointer">
          View all 76 <ChevronRight className="w-3 h-3" />
        </span>
      </div>

      <div className="space-y-1.5">
        {submissions.map((sub) => (
          <div
            key={sub.name}
            className="flex items-center justify-between p-2 rounded-[7px] bg-[#1A1D1A] hover:bg-[#202520] border border-[#282C28] transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-[5px] bg-[#222822] border border-[#2D362D] flex items-center justify-center text-[10px] font-mono font-bold text-[#03A066]">
                {sub.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-white truncate">{sub.name}</div>
                <div className="text-[10px] font-mono text-[#737373] truncate">
                  {sub.lead}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#222622] text-[#A3A3A3] border border-[#2C302C]">
                {sub.track}
              </span>
              <span
                className={cn(
                  'text-[9px] font-mono font-bold px-2 py-0.5 rounded border',
                  sub.status === 'APPROVED'
                    ? 'bg-[#028051]/15 text-[#03A066] border-[#028051]/40'
                    : 'bg-[#3A331A]/30 text-[#D4B144] border-[#5E4E20]'
                )}
              >
                {sub.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 6. JUDGING PROGRESS SUBCOMPONENT
// ==========================================
export const JudgingProgress: React.FC = () => {
  return (
    <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px] text-left">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] font-bold">
          Judging Progress
        </h3>
        <span className="text-sm font-heading font-extrabold text-[#03A066]">
          72%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-[#1F231F] rounded-full overflow-hidden border border-[#282C28] p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '72%' }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-[#028051] to-[#03A066]"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#737373] mt-2">
        <span>55 of 76 submissions scored</span>
        <span className="text-[#A3A3A3]">24/24 Judges Active</span>
      </div>
    </div>
  );
};

// ==========================================
// 7. ACTIVITY FEED SUBCOMPONENT
// ==========================================
export const DashboardActivityFeed: React.FC = () => {
  const activities = [
    { text: 'New team registered (NeuralSync, 4 builders)', time: '1m ago', icon: Users, color: 'text-[#03A066]' },
    { text: 'Submission received for QuantumQuest (v1.2 tagged)', time: '4m ago', icon: FileCode2, color: 'text-[#03A066]' },
    { text: 'Judge assigned (Dr. Marcus to AI track)', time: '9m ago', icon: Gavel, color: 'text-[#5EEAD4]' },
    { text: 'Review completed for ByteBuddy (Rubric locked)', time: '14m ago', icon: CheckCircle2, color: 'text-[#03A066]' },
  ];

  return (
    <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px] text-left">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] font-bold">
          Recent Activity
        </h3>
        <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
      </div>

      <div className="space-y-2 font-mono text-[11px]">
        {activities.map((act, index) => {
          const Icon = act.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between gap-2 p-1.5 rounded-[6px] hover:bg-[#1A1D1A] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={cn('w-3.5 h-3.5 shrink-0', act.color)} />
                <span className="text-[#C2C6C2] truncate">{act.text}</span>
              </div>
              <span className="text-[10px] text-[#737373] shrink-0">{act.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 8. MASTER ORGANIZER DASHBOARD DEMO
// ==========================================
export interface OrganizerDashboardDemoProps {
  className?: string;
}

export const OrganizerDashboardDemo: React.FC<OrganizerDashboardDemoProps> = ({
  className,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'w-full rounded-[16px] bg-[#141614] border border-[#282C28] shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden font-body text-left relative group',
        className
      )}
    >
      {/* Top Window Chrome / Bar */}
      <div className="h-9 bg-[#111311] border-b border-[#242824] px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2C302C]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2C302C]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2C302C]" />
          <span className="ml-2 text-[10px] font-mono text-[#737373]">
            app.almosthack.io/organizer/htf-2026
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#03A066] flex items-center gap-1 bg-[#028051]/15 px-2 py-0.5 rounded border border-[#028051]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#03A066] animate-pulse" />
            25,480 ops/sec
          </span>
        </div>
      </div>

      {/* Main Container: Sidebar + Dashboard Content */}
      <div className="flex flex-col md:flex-row min-h-[460px]">
        {/* Sidebar - Collapsible tab bar on mobile, full sidebar on desktop */}
        <div className="hidden md:block">
          <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto p-2 bg-[#141614] border-b border-[#242824] no-scrollbar">
          {['overview', 'registrations', 'teams', 'submissions', 'judging'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-2.5 py-1 rounded-[6px] text-xs font-mono capitalize whitespace-nowrap transition-colors',
                activeTab === tab
                  ? 'bg-[#028051] text-white font-semibold'
                  : 'bg-[#1A1D1A] text-[#8C908C]'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Dashboard Body */}
        <div className="flex-1 flex flex-col bg-[#131413]">
          {/* Header */}
          <DashboardHeader title="Hack The Future 2026" status="LIVE" />

          {/* Metrics */}
          <MetricGrid />

          {/* Dual-column demo body */}
          <div className="p-3.5 pt-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left Col (Chart + Recent Submissions) */}
            <div className="lg:col-span-7 space-y-3">
              <SubmissionChart />
              <RecentSubmissions />
            </div>

            {/* Right Col (Judging Progress + Activity Feed) */}
            <div className="lg:col-span-5 space-y-3">
              <JudgingProgress />
              <DashboardActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

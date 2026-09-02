'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  Users,
  ExternalLink,
  ShieldCheck,
  Trophy,
  FileCode2,
  Gavel,
  ArrowUpRight,
  Layers,
  Sparkles,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { cn } from '@almosthack/utils';

// ==========================================
// 1. HACKER HEADER SUBCOMPONENT
// ==========================================
export interface HackerHeaderProps {
  hackathonTitle?: string;
  status?: string;
  activeTab: 'overview' | 'submission' | 'judging' | 'results';
  onTabChange: (tab: 'overview' | 'submission' | 'judging' | 'results') => void;
}

export const HackerHeader: React.FC<HackerHeaderProps> = ({
  hackathonTitle = 'Hack The Future 2026',
  status = 'Registered',
  activeTab,
  onTabChange,
}) => {
  const tabs: Array<{ id: 'overview' | 'submission' | 'judging' | 'results'; label: string; icon: any }> = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'submission', label: 'Submission', icon: FileCode2 },
    { id: 'judging', label: 'Judging', icon: Gavel },
    { id: 'results', label: 'Results', icon: Trophy },
  ];

  return (
    <div className="bg-[#161816] border-b border-[#242824] px-4 py-3 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[6px] bg-[#028051] flex items-center justify-center font-heading font-extrabold text-xs text-white">
            AH
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block leading-none">
              Contestant Portal
            </span>
            <h3 className="text-sm font-heading font-bold text-white leading-tight">
              {hackathonTitle}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] bg-[#028051]/15 border border-[#028051]/40 text-[#03A066] text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#03A066] animate-pulse" />
            {status}
          </span>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-mono transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#028051] cursor-pointer',
                isActive
                  ? 'bg-[#028051] text-white font-bold shadow-xs'
                  : 'bg-[#1A1D1A] text-[#A3A3A3] hover:text-[#EDEDED] hover:bg-[#222622] border border-[#282C28]'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-white' : 'text-[#737373]')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. OVERVIEW & TEAM SUBCOMPONENT
// ==========================================
export interface TeamOverviewProps {
  onViewSubmission?: () => void;
  onEditTeam?: () => void;
}

export const TeamOverview: React.FC<TeamOverviewProps> = ({
  onViewSubmission,
  onEditTeam,
}) => {
  const members = [
    { name: 'Aarav Sharma', role: 'Team Lead / ML', isLead: true, avatar: 'A' },
    { name: 'Maya Lin', role: 'Full-stack Engineer', isLead: false, avatar: 'M' },
    { name: 'Kabir Mehta', role: 'Systems & Backend', isLead: false, avatar: 'K' },
  ];

  return (
    <div className="space-y-3.5 p-4 text-left">
      {/* Top Hackathon & Track Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-[#1A1D1A] border border-[#282C28] rounded-[10px]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
            Selected Track
          </span>
          <div className="text-sm font-heading font-bold text-white mt-1 flex items-center justify-between">
            <span>Artificial Intelligence</span>
            <span className="text-[10px] font-mono text-[#03A066] bg-[#028051]/15 px-2 py-0.5 rounded border border-[#028051]/30">
              Verified
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#8C908C] mt-1">
            Challenge: Climate data optimization algorithms
          </p>
        </div>

        <div className="p-3 bg-[#1A1D1A] border border-[#282C28] rounded-[10px]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
            Submission Deadline
          </span>
          <div className="text-sm font-heading font-extrabold text-[#5EEAD4] mt-1 flex items-center gap-1.5 font-mono">
            <Clock className="w-4 h-4 text-[#03A066]" />
            <span>36h 42m 18s remaining</span>
          </div>
          <p className="text-[11px] font-mono text-[#8C908C] mt-1">
            Hard freeze: Sunday 18:00 UTC (No grace period)
          </p>
        </div>
      </div>

      {/* Team Card */}
      <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#03A066]" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#EDEDED] font-bold">
              Team: QuantumQuest
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#737373] bg-[#222622] px-2 py-0.5 rounded border border-[#282C28]">
            3 / 4 Members
          </span>
        </div>

        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between p-2 rounded-[7px] bg-[#1A1D1A] hover:bg-[#202520] border border-[#282C28] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#222822] border border-[#2D362D] flex items-center justify-center text-[10px] font-mono font-bold text-[#03A066]">
                  {member.avatar}
                </div>
                <div>
                  <div className="text-xs font-medium text-white flex items-center gap-1.5">
                    {member.name}
                    {member.isLead && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#028051]/20 text-[#03A066] border border-[#028051]/30">
                        Lead
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-[#737373]">{member.role}</div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-[#03A066] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#03A066]" /> Synced
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Status Banner & Actions */}
      <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
            <span className="text-xs font-mono font-bold text-white">Status: Submitted</span>
          </div>
          <span className="text-[11px] font-mono text-[#737373] mt-0.5 block">
            Last commit payload received 12 minutes ago
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewSubmission}
            className="px-3 py-1.5 rounded-[8px] bg-[#028051] hover:bg-[#03A066] text-white font-mono text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View Submission</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onEditTeam}
            className="px-3 py-1.5 rounded-[8px] bg-[#1A1D1A] hover:bg-[#222622] text-[#A3A3A3] hover:text-white font-mono text-xs border border-[#282C28] transition-colors cursor-pointer"
          >
            Edit Team
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. SUBMISSION PANEL SUBCOMPONENT
// ==========================================
export const SubmissionPanel: React.FC = () => {
  const checkItems = [
    { label: 'Repository connected', detail: 'github.com/quantumquest/climate-ai (main branch)', passed: true },
    { label: 'README detected', detail: 'Valid project specification & architecture overview found', passed: true },
    { label: 'Demo URL verified', detail: 'HTTP 200 OK response on target endpoint (SSL valid)', passed: true },
    { label: 'Submission received', detail: 'Signed tamper-proof ledger receipt #0x8e2a...c471', passed: true },
  ];

  return (
    <div className="space-y-3.5 p-4 text-left">
      {/* Project Meta Card */}
      <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
              Project Name
            </span>
            <h4 className="text-base font-heading font-extrabold text-white mt-0.5">
              QuantumQuest
            </h4>
            <p className="text-xs text-[#A3A3A3] font-body mt-1">
              AI-powered climate optimization engine calculating decentralized carbon offset models in real time.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#028051]/15 text-[#03A066] border border-[#028051]/30 font-bold shrink-0">
            LOCKED & VERIFIED
          </span>
        </div>

        {/* Links bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#242824] font-mono text-xs">
          <div className="flex items-center gap-2 p-2 bg-[#1A1D1A] rounded-[7px] border border-[#282C28]">
            <GitBranch className="w-3.5 h-3.5 text-[#03A066]" />
            <span className="text-[#EDEDED] truncate">github.com/quantumquest/climate-ai</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-[#1A1D1A] rounded-[7px] border border-[#282C28]">
            <ExternalLink className="w-3.5 h-3.5 text-[#03A066]" />
            <span className="text-[#EDEDED] truncate">quantumquest-demo.almosthack.io</span>
          </div>
        </div>
      </div>

      {/* Build → Submit Checklist */}
      <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#03A066]" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#EDEDED] font-bold">
              Automated Integrity Pipeline: Build → Submit
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#03A066]">4/4 Checks Passed</span>
        </div>

        <div className="space-y-2">
          {checkItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2 rounded-[7px] bg-[#1A1D1A] border border-[#282C28]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#03A066] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-mono font-semibold text-white">
                  {item.label}
                </div>
                <div className="text-[10px] font-mono text-[#737373] mt-0.5 truncate">
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. JUDGING STATUS SUBCOMPONENT
// ==========================================
export const JudgingStatus: React.FC = () => {
  const criteria = [
    { name: 'Innovation & Novelty', weight: '30%', desc: 'Unique architectural approach to real-time telemetry' },
    { name: 'Technical Execution', weight: '30%', desc: 'Code cleanliness, robust error handling & test coverage' },
    { name: 'Impact & Feasibility', weight: '25%', desc: 'Demonstrable ecosystem utility and scalability' },
    { name: 'Design & Usability', weight: '15%', desc: 'Developer ergonomics and user interface clarity' },
  ];

  return (
    <div className="space-y-3.5 p-4 text-left">
      {/* Review In Progress Banner */}
      <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
            Current Stage
          </span>
          <div className="text-sm font-heading font-bold text-white mt-0.5 flex items-center gap-2">
            <span>Calibrated Double-Blind Evaluation</span>
          </div>
          <p className="text-[11px] font-mono text-[#8C908C] mt-0.5">
            Submission received & anonymized. All judge scores are cryptographically sealed.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-[#737373] block">Status</span>
          <span className="text-xs font-mono font-bold text-[#03A066] bg-[#028051]/15 px-2 py-0.5 rounded border border-[#028051]/30">
            ● IN PROGRESS
          </span>
        </div>
      </div>

      {/* Transparent Criteria Breakdown */}
      <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#EDEDED] font-bold">
            Public Evaluation Rubric
          </h4>
          <span className="text-[10px] font-mono text-[#737373]">100% Transparent Weights</span>
        </div>

        <div className="space-y-2">
          {criteria.map((c) => (
            <div
              key={c.name}
              className="p-2.5 rounded-[7px] bg-[#1A1D1A] border border-[#282C28] flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-xs font-mono font-semibold text-white">{c.name}</div>
                <div className="text-[10px] font-mono text-[#737373]">{c.desc}</div>
              </div>
              <span className="text-xs font-mono font-bold text-[#03A066] bg-[#028051]/10 px-2 py-1 rounded border border-[#028051]/20 shrink-0">
                {c.weight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. RESULT PANEL SUBCOMPONENT
// ==========================================
export const ResultPanel: React.FC = () => {
  const rubrics = [
    { name: 'Innovation', score: '27.6 / 30', pct: '92%' },
    { name: 'Technical Execution', score: '26.4 / 30', pct: '88%' },
    { name: 'Impact', score: '21.5 / 25', pct: '86%' },
    { name: 'Design', score: '9.8 / 15', pct: '65%' },
  ];

  return (
    <div className="space-y-3.5 p-4 text-left">
      {/* Podium Result Card */}
      <div className="p-4 bg-gradient-to-r from-[#171917] to-[#1A1E1A] border border-[#028051]/40 rounded-[10px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[10px] bg-[#028051]/20 border border-[#028051] flex flex-col items-center justify-center text-white">
            <Trophy className="w-4 h-4 text-[#03A066]" />
            <span className="text-xs font-mono font-extrabold text-[#5EEAD4]">#03</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#03A066] font-bold">
              Official Leaderboard Placement
            </span>
            <h4 className="text-base font-heading font-extrabold text-white">
              QuantumQuest
            </h4>
            <span className="text-[11px] font-mono text-[#8C908C]">
              Track: Artificial Intelligence
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-[#737373] block">Final Score</span>
          <span className="text-2xl font-heading font-extrabold text-[#5EEAD4]">
            85.3 <span className="text-xs font-mono text-[#737373]">/ 100</span>
          </span>
        </div>
      </div>

      {/* Transparent Scoring Breakdown */}
      <div className="p-3.5 bg-[#171917] border border-[#282C28] rounded-[10px]">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#EDEDED] font-bold">
            Transparent Scoring Breakdown
          </h4>
          <span className="text-[10px] font-mono text-[#03A066] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Calibrated Proof
          </span>
        </div>

        <div className="space-y-2">
          {rubrics.map((r) => (
            <div key={r.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#C2C6C2]">{r.name}</span>
                <span className="text-white font-semibold">{r.score}</span>
              </div>
              <div className="w-full h-1.5 bg-[#1F231F] rounded-full overflow-hidden border border-[#282C28]">
                <div
                  className="h-full bg-gradient-to-r from-[#028051] to-[#03A066] rounded-full"
                  style={{ width: r.pct }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. MASTER HACKER DASHBOARD DEMO
// ==========================================
export interface HackerDashboardDemoProps {
  className?: string;
  initialTab?: 'overview' | 'submission' | 'judging' | 'results';
}

export const HackerDashboardDemo: React.FC<HackerDashboardDemoProps> = ({
  className,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'submission' | 'judging' | 'results'>(initialTab);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div
      className={cn(
        'w-full rounded-[16px] bg-[#141614] border border-[#282C28] shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden font-body text-left relative group',
        className
      )}
    >
      {/* Top Window Bar */}
      <div className="h-9 bg-[#111311] border-b border-[#242824] px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2C302C]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2C302C]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2C302C]" />
          <span className="ml-2 text-[10px] font-mono text-[#737373]">
            app.almosthack.io/hacker/quantumquest
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#03A066] flex items-center gap-1 bg-[#028051]/15 px-2 py-0.5 rounded border border-[#028051]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#03A066] animate-pulse" />
            Active Session
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-col bg-[#131413] min-h-[420px]">
        {/* Header & Tabs */}
        <HackerHeader
          hackathonTitle="Hack The Future 2026"
          status="Registered"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content Panes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {activeTab === 'overview' && (
              <TeamOverview
                onViewSubmission={() => setActiveTab('submission')}
                onEditTeam={() => setActiveTab('overview')}
              />
            )}
            {activeTab === 'submission' && <SubmissionPanel />}
            {activeTab === 'judging' && <JudgingStatus />}
            {activeTab === 'results' && <ResultPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

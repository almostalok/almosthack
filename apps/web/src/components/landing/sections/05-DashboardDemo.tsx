'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  Trophy,
  Gavel,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@almosthack/utils';
import { OrganizerDashboardDemo } from '../demos/OrganizerDashboardDemo';

export const DashboardDemoSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard' | 'judges' | 'teams' | 'certificates'>('dashboard');

  const tabs: Array<{ id: 'dashboard' | 'leaderboard' | 'judges' | 'teams' | 'certificates'; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Organizer Dashboard', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
    { id: 'judges', label: 'Judge Panel', icon: Gavel },
    { id: 'teams', label: 'Team Dashboard', icon: Users },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  // Leaderboard Tab Data
  const leaderboardEntries = [
    { rank: '#01', team: 'ZeroTrust Zero-Knowledge', track: 'Security', score: '94.2', status: 'LOCKED & SEALED' },
    { rank: '#02', team: 'NeuralHealth Agent', track: 'Health', score: '91.8', status: 'LOCKED & SEALED' },
    { rank: '#03', team: 'QuantumQuest', track: 'AI', score: '85.3', status: 'LOCKED & SEALED' },
    { rank: '#04', team: 'GreenChain Protocol', track: 'Blockchain', score: '83.9', status: 'LOCKED & SEALED' },
  ];

  // Judge Panel Data
  const judgeList = [
    { name: 'Dr. Sarah Lin', specialty: 'AI & Neural Systems', assigned: '12 / 12 Reviewed', variance: '0.4 (Calibrated)' },
    { name: 'Marcus Vance', specialty: 'Distributed Ledgers', assigned: '10 / 10 Reviewed', variance: '0.2 (Calibrated)' },
    { name: 'Elena Rostova', specialty: 'Product & UX', assigned: '14 / 14 Reviewed', variance: '0.6 (Calibrated)' },
  ];

  // Team Dashboard Data
  const teamList = [
    { name: 'QuantumQuest', members: 3, track: 'AI', status: 'Verified Repo', commits: '42 commits' },
    { name: 'NeuralHealth', members: 4, track: 'Health', status: 'Verified Repo', commits: '68 commits' },
    { name: 'ZeroTrust', members: 4, track: 'Security', status: 'Verified Repo', commits: '89 commits' },
  ];

  return (
    <section
      id="dashboard-deep-dive"
      className="relative py-20 md:py-28 lg:py-36 bg-[#131413] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Organizer Dashboard Deep Dive"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] uppercase tracking-wider mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-[#03A066]" />
            <span>INTERACTIVE PRODUCT DEEP DIVE</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.12]"
          >
            Explore the multi-module workspace.
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-[#A3A3A3] font-body leading-relaxed max-w-2xl"
          >
            Switch between core views to see how AlmostHack unifies the entire hackathon lifecycle under one coherent design system.
          </motion.p>
        </div>

        {/* Workspace Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs font-mono font-semibold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#028051] cursor-pointer',
                  isActive
                    ? 'bg-[#028051] text-white shadow-sm border border-[#03A066]'
                    : 'bg-[#161816] text-[#A3A3A3] hover:text-[#EDEDED] hover:bg-[#1A1D1A] border border-[#242824]'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-[#737373]')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Workspace Body */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <OrganizerDashboardDemo />
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-[16px] bg-[#141614] border border-[#282C28] shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-left"
              >
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242824]">
                  <div>
                    <h3 className="text-lg font-heading font-extrabold text-white">
                      Official Sealed Leaderboard
                    </h3>
                    <p className="text-xs font-mono text-[#737373] mt-0.5">
                      Mainnet cryptographic consensus proof #0x4a9b...77e2
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#03A066] bg-[#028051]/15 px-2.5 py-1 rounded border border-[#028051]/30 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Calibrated
                  </span>
                </div>

                <div className="space-y-2.5">
                  {leaderboardEntries.map((entry) => (
                    <div
                      key={entry.rank}
                      className="p-3.5 rounded-[10px] bg-[#171917] border border-[#282C28] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-[7px] bg-[#028051]/20 border border-[#028051] flex items-center justify-center font-mono font-extrabold text-sm text-[#5EEAD4]">
                          {entry.rank}
                        </span>
                        <div>
                          <div className="text-sm font-heading font-bold text-white">
                            {entry.team}
                          </div>
                          <div className="text-[11px] font-mono text-[#737373]">
                            Track: {entry.track}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono text-[#03A066] font-bold">
                          {entry.status}
                        </span>
                        <span className="text-xl font-heading font-extrabold text-white">
                          {entry.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'judges' && (
              <motion.div
                key="judges"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-[16px] bg-[#141614] border border-[#282C28] shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-left"
              >
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242824]">
                  <div>
                    <h3 className="text-lg font-heading font-extrabold text-white">
                      Judge Allocation & Calibration Matrix
                    </h3>
                    <p className="text-xs font-mono text-[#737373] mt-0.5">
                      Double-blind rubric reviews with automated standard deviation normalization
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#5EEAD4] bg-[#028051]/20 px-2.5 py-1 rounded border border-[#028051]/40 font-bold">
                    24 Judges Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {judgeList.map((j) => (
                    <div
                      key={j.name}
                      className="p-4 rounded-[10px] bg-[#171917] border border-[#282C28] space-y-2"
                    >
                      <div className="text-sm font-heading font-bold text-white">{j.name}</div>
                      <div className="text-xs font-mono text-[#8C908C]">{j.specialty}</div>
                      <div className="pt-2 border-t border-[#242824] flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#03A066] font-semibold">{j.assigned}</span>
                        <span className="text-[#737373]">{j.variance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'teams' && (
              <motion.div
                key="teams"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-[16px] bg-[#141614] border border-[#282C28] shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-left"
              >
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242824]">
                  <div>
                    <h3 className="text-lg font-heading font-extrabold text-white">
                      Team Roster & Git Telemetry
                    </h3>
                    <p className="text-xs font-mono text-[#737373] mt-0.5">
                      132 teams cryptographically synchronized with GitHub repositories
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#03A066] bg-[#028051]/15 px-2.5 py-1 rounded border border-[#028051]/30 font-bold">
                    94% Formed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {teamList.map((team) => (
                    <div
                      key={team.name}
                      className="p-3.5 rounded-[10px] bg-[#171917] border border-[#282C28] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[6px] bg-[#222622] flex items-center justify-center font-mono font-bold text-xs text-[#03A066]">
                          {team.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-heading font-bold text-white">{team.name}</div>
                          <div className="text-[11px] font-mono text-[#737373]">
                            {team.members} members • Track: {team.track}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-[#03A066] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {team.status}
                        </span>
                        <span className="text-[#A3A3A3] bg-[#222622] px-2 py-0.5 rounded">
                          {team.commits}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'certificates' && (
              <motion.div
                key="certificates"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-[16px] bg-[#141614] border border-[#282C28] shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-left"
              >
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242824]">
                  <div>
                    <h3 className="text-lg font-heading font-extrabold text-white">
                      Verifiable Certificate Engine
                    </h3>
                    <p className="text-xs font-mono text-[#737373] mt-0.5">
                      1-click generation of digitally signed participant and winner vector credentials
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#03A066] bg-[#028051]/15 px-2.5 py-1 rounded border border-[#028051]/30 font-bold">
                    847 Issued
                  </span>
                </div>

                <div className="p-6 rounded-[12px] bg-[#171A17] border border-[#028051]/30 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-[#03A066] uppercase tracking-wider font-bold">
                      OFFICIAL CREDENTIAL SAMPLE
                    </span>
                    <h4 className="text-xl font-heading font-extrabold text-white">
                      Certificate of Achievement — Hack The Future 2026
                    </h4>
                    <p className="text-xs font-mono text-[#8C908C]">
                      Awarded to Aarav Sharma (QuantumQuest) • Verified by AlmostHack Ledger
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-[8px] bg-[#028051] text-white font-mono text-xs font-bold shrink-0">
                    SHA-256 Verified
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

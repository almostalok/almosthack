'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import {
  IconCpuChip,
  IconTrophy,
  IconShieldCert,
  IconTerminalCode,
  IconSparkle,
  IconCheckCircle,
  IconZapFlash,
} from '@/components/ui/CustomIcons';

export function InteractiveRoleDashboard() {
  const [activeRole, setActiveRole] = useState<'organizer' | 'judge' | 'participant' | 'sponsor' | 'admin'>('organizer');

  const roles = [
    { id: 'organizer', label: 'Organizer Portal', desc: 'Full event lifecycle control, broadcasts & analytics' },
    { id: 'judge', label: 'Judge Portal', desc: 'Standardized rubrics, AI fraud checks & score cards' },
    { id: 'participant', label: 'Participant Hub', desc: 'Team formation, project submissions & schedules' },
    { id: 'sponsor', label: 'Sponsor Portal', desc: 'Custom tracks, prize distribution & candidate scouting' },
    { id: 'admin', label: 'System Admin', desc: 'Domain management, white-labeling & API integrations' },
  ];

  return (
    <section id="interactive-demo" className="py-28 relative overflow-hidden bg-[#051C14] text-white select-none transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="optimizely-pill-pink shadow-md">
            [ ROLE ARCHITECTURE ]
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-display">
            Tailored Experiences for{' '}
            <span className="serif-accent text-[#ABFF44] font-normal">
              Every Stakeholder
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-sans leading-relaxed">
            Switch roles below to test how AlmostHack adapts its macOS interface for organizers, judges, participants, sponsors, and system admins.
          </p>
        </div>

        {/* Role Switcher Tabs (Optimizely Tactile Buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 font-mono">
          {roles.map((r) => {
            const isSelected = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id as any)}
                className={`px-5 py-3 text-xs font-bold cursor-pointer flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'optimizely-btn-lime shadow-md'
                    : 'optimizely-btn-dark opacity-85 hover:opacity-100'
                }`}
              >
                <IconZapFlash size={14} className={isSelected ? 'text-[#072419] fill-[#072419]' : 'text-[#ABFF44]'} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Role Preview macOS Window */}
        <SpotlightCard
          spotlightColor="rgba(171, 255, 68, 0.15)"
          className="mac-window border-2 border-[#0D3A29] overflow-hidden"
        >
          {/* macOS Top Window Header */}
          <div className="mac-window-bar px-6 py-3.5">
            <div className="mac-dots">
              <span className="mac-dot mac-dot-close" />
              <span className="mac-dot mac-dot-min" />
              <span className="mac-dot mac-dot-zoom" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-white font-bold">
              <IconTerminalCode size={14} className="text-[#ABFF44]" />
              <span>almosthack_{activeRole}_workspace.app</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#072419] bg-[#ABFF44] px-3 py-1 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-[#072419] animate-pulse" />
              <span>Live System</span>
            </div>
          </div>

          {/* Dynamic Content Body */}
          <div className="p-8 bg-[#051C14] min-h-[380px] font-sans">
            <AnimatePresence mode="wait">
              {activeRole === 'organizer' && (
                <motion.div
                  key="organizer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                    <div className="p-5 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-2">
                      <div className="text-[#789887] text-xs uppercase tracking-wider font-bold">LIVE REGISTRATION RATE</div>
                      <div className="text-3xl font-extrabold text-white">1,420 / 1,500</div>
                      <div className="text-[#ABFF44] text-xs flex items-center gap-1 font-bold">
                        <IconCheckCircle size={14} /> 94.6% Checked In
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-2">
                      <div className="text-[#789887] text-xs uppercase tracking-wider font-bold">AI EVALUATION ENGINE</div>
                      <div className="text-3xl font-extrabold text-[#ABFF44]">128 Submissions</div>
                      <div className="text-[#ABFF44] text-xs flex items-center gap-1 font-bold">
                        <IconCpuChip size={14} /> Auto-Scoring Active
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-2">
                      <div className="text-[#789887] text-xs uppercase tracking-wider font-bold">PRIZE DISBURSEMENT</div>
                      <div className="text-3xl font-extrabold text-emerald-400">$50,000 Pool</div>
                      <div className="text-[#789887] text-xs flex items-center gap-1">
                        <IconShieldCert size={14} className="text-purple-400" /> Smart Contracts Ready
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#0D3A29] border-2 border-[#ABFF44]/30 space-y-3">
                    <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                      <IconSparkle size={18} className="text-[#ABFF44]" />
                      Organizer Broadcast &amp; Autopilot Controls
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed font-sans">
                      Broadcast announcements across Discord, WhatsApp, and email with 1 click. Let AI monitor submission deadlines, automatically check repo histories, and assign judge workloads.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeRole === 'judge' && (
                <motion.div
                  key="judge"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                    <div className="p-5 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-2">
                      <div className="text-[#789887] text-xs font-bold">ASSIGNED RUBRIC SCORECARD</div>
                      <div className="text-2xl font-bold text-white">Technical Execution (40%)</div>
                      <p className="text-xs text-[#789887]">AI pre-scored architecture cleanliness: 9.5/10</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-2">
                      <div className="text-[#789887] text-xs font-bold">AI PLAGIARISM CHECK</div>
                      <div className="text-2xl font-bold text-[#ABFF44]">100% Original Code</div>
                      <p className="text-xs text-[#789887]">Verified against 10M+ GitHub repos</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeRole === 'participant' && (
                <motion.div
                  key="participant"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 font-mono"
                >
                  <div className="p-6 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-3">
                    <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                      <IconTrophy size={18} className="text-[#ABFF44]" />
                      Hacker Project Portal &amp; Team Matcher
                    </h4>
                    <p className="text-sm text-slate-200 font-sans leading-relaxed">
                      Connect your GitHub repository, submit pitch decks, find teammates based on skill gaps, and receive instant cryptographic completion certificates.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeRole === 'sponsor' && (
                <motion.div
                  key="sponsor"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 font-mono"
                >
                  <div className="p-6 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-3">
                    <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                      <IconShieldCert size={18} className="text-purple-400" />
                      Sponsor Bounty Track &amp; Talent Scouting
                    </h4>
                    <p className="text-sm text-slate-200 font-sans leading-relaxed">
                      Define custom API track bounties, evaluate teams using your tech stack, scout top developer talent, and award prizes effortlessly.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeRole === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 font-mono"
                >
                  <div className="p-6 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-3">
                    <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                      <IconCpuChip size={18} className="text-[#ABFF44]" />
                      White-Label Domain &amp; Custom Branding Engine
                    </h4>
                    <p className="text-sm text-slate-200 font-sans leading-relaxed">
                      Host hackathons on your own custom domain (`hack.yourcompany.com`), customize CSS tokens, and connect custom webhooks for automated workflows.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SpotlightCard>

      </div>
    </section>
  );
}

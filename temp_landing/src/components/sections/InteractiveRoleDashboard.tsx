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
    <section id="interactive-demo" className="py-24 relative overflow-hidden bg-black text-white bg-noise-fine select-none">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-cyan-glow opacity-25 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title with Instrument Serif Accent */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full bg-zinc-900 border border-white/15 text-xs font-mono text-cyan uppercase tracking-wider">
            role-based os system
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-display">
            tailored experiences for{' '}
            <span className="font-serif italic text-cyan text-4xl sm:text-5xl font-normal">
              every role
            </span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg font-sans">
            switch views below to test how AlmostHack adapts its macOS interface for organizers, judges, participants, sponsors, and system admins.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 font-mono">
          {roles.map((r) => {
            const isSelected = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id as any)}
                className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'mac-btn-gloss text-white shadow-xl border-cyan/50 text-cyan'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-white/10 hover:border-white/25'
                }`}
              >
                <IconZapFlash size={14} className={isSelected ? 'text-cyan fill-cyan' : 'text-zinc-500'} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Full-Width Interactive Role Preview Shell (ReactBits Spotlight Card inside macOS Window) */}
        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.15)"
          className="mac-window border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* macOS Top Window Header */}
          <div className="mac-window-bar px-6 py-3">
            <div className="mac-dots">
              <span className="mac-dot mac-dot-close" />
              <span className="mac-dot mac-dot-min" />
              <span className="mac-dot mac-dot-zoom" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
              <IconTerminalCode size={14} className="text-cyan" />
              <span className="font-bold text-white">portal_{activeRole}.app</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live &amp; Active</span>
            </div>
          </div>

          {/* Dynamic Content Body */}
          <div className="p-8 bg-zinc-950/95 min-h-[380px] font-sans">
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
                    <div className="p-5 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                      <div className="text-zinc-500 text-xs uppercase tracking-wider">LIVE REGISTRATION RATE</div>
                      <div className="text-3xl font-extrabold text-white">1,420 / 1,500</div>
                      <div className="text-emerald-400 text-xs flex items-center gap-1 font-bold">
                        <IconCheckCircle size={14} /> 94.6% Checked In
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                      <div className="text-zinc-500 text-xs uppercase tracking-wider">AI EVALUATION STATUS</div>
                      <div className="text-3xl font-extrabold text-cyan">128 Projects</div>
                      <div className="text-cyan text-xs flex items-center gap-1 font-bold">
                        <IconCpuChip size={14} /> Auto-Scoring Repos
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                      <div className="text-zinc-500 text-xs uppercase tracking-wider">PRIZE POOL DISBURSED</div>
                      <div className="text-3xl font-extrabold text-emerald-400">$50,000</div>
                      <div className="text-zinc-400 text-xs flex items-center gap-1">
                        <IconShieldCert size={14} className="text-purple-400" /> Smart Contract Ready
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-zinc-900/60 border border-white/10 space-y-3">
                    <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                      <IconSparkle size={18} className="text-cyan" />
                      Organizer Command Control Bar
                    </h4>
                    <p className="text-sm text-zinc-300">
                      Send urgent push announcements, automatically verify team GitHub repos, and resolve judging disputes with one-click AI evaluation summaries.
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
                    <div className="p-5 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                      <div className="text-zinc-500 text-xs">ASSIGNED RUBRIC SCORECARD</div>
                      <div className="text-2xl font-bold text-white">Technical Execution (40%)</div>
                      <p className="text-xs text-zinc-400">AI pre-scored architecture cleanlines: 9.5/10</p>
                    </div>

                    <div className="p-5 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                      <div className="text-zinc-500 text-xs">AI PLAGIARISM CHECK</div>
                      <div className="text-2xl font-bold text-emerald-400">100% Original Code</div>
                      <p className="text-xs text-zinc-400">Checked against 10M+ GitHub repos</p>
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
                  <div className="p-6 rounded-xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                      <IconTrophy size={18} className="text-amber-400" />
                      Team CyberPunk Project Hub
                    </h4>
                    <p className="text-sm text-zinc-300 font-sans">
                      Connect your GitHub repo, submit your pitch deck, and track live scoring in real time.
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
                  <div className="p-6 rounded-xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                      <IconShieldCert size={18} className="text-purple-400" />
                      Custom Sponsor Bounty Track
                    </h4>
                    <p className="text-sm text-zinc-300 font-sans">
                      Set custom API bounties, evaluate teams using your tech stack, and award verified prizes.
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
                  <div className="p-6 rounded-xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                      <IconCpuChip size={18} className="text-cyan" />
                      White-Label &amp; Domain Admin
                    </h4>
                    <p className="text-sm text-zinc-300 font-sans">
                      Configure custom SSL domains, white-label CSS themes, and webhook integrations.
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

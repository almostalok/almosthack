'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Award,
  Code2,
  Building,
  Shield,
  CheckCircle2,
  BarChart,
  Sparkles,
  Zap,
  Sliders,
  Send,
  Users,
  FileText
} from 'lucide-react';

export function InteractiveRoleDashboard() {
  const [activeRole, setActiveRole] = useState<'organizer' | 'judge' | 'participant' | 'sponsor' | 'admin'>('organizer');

  const roles = [
    { id: 'organizer', label: 'Organizer Portal', icon: UserCheck, desc: 'Full event lifecycle control, broadcasts & analytics' },
    { id: 'judge', label: 'Judge Portal', icon: Award, desc: 'Standardized rubrics, AI fraud checks & score cards' },
    { id: 'participant', label: 'Participant Hub', icon: Code2, desc: 'Team formation, project submissions & schedules' },
    { id: 'sponsor', label: 'Sponsor Portal', icon: Building, desc: 'Custom tracks, prize distribution & candidate scouting' },
    { id: 'admin', label: 'System Admin', icon: Shield, desc: 'Domain management, white-labeling & API integrations' },
  ];

  return (
    <section id="interactive-demo" className="py-24 relative overflow-hidden bg-[#090B10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-mono text-accent tracking-widest uppercase px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            ROLE-BASED DESIGN SYSTEM
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Tailored Experiences for Every Role.
          </h2>
          <p className="text-muted text-base sm:text-lg">
            Switch views below to test how AlmostHack adapts its interface for organizers, judges, participants, sponsors, and system admins.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-accent text-white shadow-lg shadow-accent/25 border border-accent'
                    : 'bg-surface-50 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Full-Width Interactive Role Preview Shell */}
        <div className="rounded-3xl border border-white/15 bg-surface/90 backdrop-blur-2xl glass-card overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)]">
          {/* Top Status Bar */}
          <div className="px-6 py-4 bg-surface-50 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                VIEW MODE: {activeRole.toUpperCase()} DASHBOARD
              </span>
            </div>
            <div className="text-xs text-white/60 font-mono">
              Status: <span className="text-emerald-400 font-bold">Online & Active</span>
            </div>
          </div>

          {/* Dynamic Content Body */}
          <div className="p-8 min-h-[380px]">
            <AnimatePresence mode="wait">
              {activeRole === 'organizer' && (
                <motion.div
                  key="organizer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <div className="text-white/50 text-xs font-mono">LIVE REGISTRATION RATE</div>
                      <div className="text-3xl font-extrabold text-white font-mono">1,420 / 1,500</div>
                      <div className="text-emerald-400 text-xs flex items-center gap-1">
                        <BarChart className="w-3.5 h-3.5" /> +24% vs last event
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <div className="text-white/50 text-xs font-mono">PROJECT SUBMISSIONS</div>
                      <div className="text-3xl font-extrabold text-white font-mono">148 Projects</div>
                      <div className="text-accent text-xs">Submission Deadline: Active</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <div className="text-white/50 text-xs font-mono">DISCORD & SMS BROADCAST</div>
                      <div className="text-3xl font-extrabold text-white font-mono">1-Click Dispatch</div>
                      <div className="text-white/60 text-xs">Send updates to 1,420 hackers instantly</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-surface-50 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm">Quick Action: Freeze Submissions & Trigger AI Judging</div>
                      <div className="text-xs text-white/50">Locks project editing and auto-dispatches score sheets to 24 assigned judges.</div>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Trigger AI Judging Sequence
                    </button>
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
                  <div className="p-5 rounded-2xl bg-surface-50 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">Judge Queue: Track A (AI & Machine Learning)</div>
                      <div className="text-xs text-white/50">You have 6 submissions left to evaluate. Rubric weights applied automatically.</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-accent/20 text-accent font-mono text-xs font-bold">
                      Progress: 8/14 Scored
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-black/50 border border-accent/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h4 className="text-white font-bold text-base">Project #42: PulseAI Triage Engine</h4>
                        <p className="text-white/50 text-xs">Team NeuroForge • Submitted 12m ago</p>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
                        AI Fraud Score: 0.2% (100% Original)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-surface-50 border border-white/10">
                        <span className="text-white/50">Technical Depth</span>
                        <div className="text-lg font-mono font-bold text-white mt-1">9.5 / 10</div>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-50 border border-white/10">
                        <span className="text-white/50">UI / UX Elegance</span>
                        <div className="text-lg font-mono font-bold text-white mt-1">9.2 / 10</div>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-50 border border-white/10">
                        <span className="text-white/50">Impact Potential</span>
                        <div className="text-lg font-mono font-bold text-white mt-1">9.8 / 10</div>
                      </div>
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
                  className="space-y-6"
                >
                  <div className="p-5 rounded-2xl bg-surface-50 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent">
                        TN
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">Team NeuroForge</div>
                        <div className="text-xs text-white/50">Track: AI Healthcare • 4 Members</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold border border-emerald-500/30">
                      Submission Received
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      <div className="text-white/50 font-mono">SUBMITTED REPOSITORY</div>
                      <div className="text-white font-mono">github.com/neuroforge/pulse-ai</div>
                      <div className="text-emerald-400 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> GitHub Action Build Passed
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      <div className="text-white/50 font-mono">VENUE GATE PASS</div>
                      <div className="text-white font-mono">QR Token: #AH-9842-2026</div>
                      <div className="text-accent text-[11px]">Valid for Swag & Meal Desk</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeRole === 'sponsor' && (
                <motion.div
                  key="sponsor"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="p-5 rounded-2xl bg-surface-50 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">Sponsor Hub: Google Cloud Platform Track</div>
                      <div className="text-xs text-white/50">$10,000 Special Category Bounty • 48 Teams Competing</div>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15">
                      Export Resume Booklet (.ZIP)
                    </button>
                  </div>
                </motion.div>
              )}

              {activeRole === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="p-5 rounded-2xl bg-surface-50 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">Custom Domain & White-Label Controls</div>
                      <div className="text-xs text-white/50">hack.youruniversity.edu • Custom SSL Active</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-accent/20 text-accent font-mono text-xs font-semibold">
                      Enterprise Tier
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

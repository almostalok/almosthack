'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  QrCode,
  FileCode,
  Layers,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  Zap,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';

export function HeroDashboardPreview() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'judging' | 'teams'>('submissions');
  const [filter, setFilter] = useState<string>('All');
  const [mockApproved, setMockApproved] = useState<Record<string, boolean>>({});

  const toggleApproval = (id: string) => {
    setMockApproved((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="w-full max-w-6xl mx-auto rounded-2xl border border-white/10 bg-surface/90 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden glass-card"
    >
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-white/10 bg-surface-50/70 gap-3">
        {/* Left Mac Window Dots + Live Hackathon Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-white/80 font-medium">
              Global AI Hackathon 2026 • LIVE HACKING
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'submissions'
                ? 'bg-accent text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Submissions (148)
          </button>
          <button
            onClick={() => setActiveTab('judging')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'judging'
                ? 'bg-accent text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            AI Judging Rubric
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'teams'
                ? 'bg-accent text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Team Matcher
          </button>
        </div>
      </div>

      {/* Main Dashboard Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-black/30 text-xs py-3 border-b border-white/10">
        <div className="px-5 py-2 flex items-center justify-between">
          <div>
            <div className="text-white/50 text-[11px]">Total Participants</div>
            <div className="text-lg font-bold text-white font-mono">1,420</div>
          </div>
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="px-5 py-2 flex items-center justify-between">
          <div>
            <div className="text-white/50 text-[11px]">Submissions</div>
            <div className="text-lg font-bold text-white font-mono">148 Projects</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FileCode className="w-4 h-4" />
          </div>
        </div>
        <div className="px-5 py-2 flex items-center justify-between">
          <div>
            <div className="text-white/50 text-[11px]">Judges Online</div>
            <div className="text-lg font-bold text-white font-mono">24 / 24 Active</div>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="px-5 py-2 flex items-center justify-between">
          <div>
            <div className="text-white/50 text-[11px]">AI Duplicate Shield</div>
            <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1">
              99.8% Clean
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <BrainCircuit className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Interactive Content Area */}
      <div className="p-5 min-h-[340px]">
        <AnimatePresence mode="wait">
          {activeTab === 'submissions' && (
            <motion.div
              key="submissions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span className="font-semibold text-white/90">LIVE PROJECT STREAM</span>
                <span className="flex items-center gap-1 text-accent font-mono text-[11px]">
                  <Zap className="w-3 h-3" /> Auto-synced with GitHub & Figma
                </span>
              </div>

              {/* Sample Submissions */}
              {[
                {
                  id: 'p1',
                  name: 'PulseAI - Realtime Emergency Triage',
                  team: 'Team NeuroForge',
                  track: 'AI / Healthcare',
                  score: '98.4',
                  github: 'github.com/neuroforge/pulse-ai',
                  verified: true,
                  time: '2 mins ago',
                },
                {
                  id: 'p2',
                  name: 'VeriCert - Holographic Certificates on Solana',
                  team: 'ChainCrafters',
                  track: 'Web3 / Security',
                  score: '96.8',
                  github: 'github.com/chaincrafters/vericert',
                  verified: true,
                  time: '8 mins ago',
                },
                {
                  id: 'p3',
                  name: 'DevFlow - Autonomous Code Reviewer',
                  team: 'ZeroBug Squad',
                  track: 'Developer Tools',
                  score: '94.2',
                  github: 'github.com/zerobug/devflow',
                  verified: true,
                  time: '15 mins ago',
                },
              ].map((proj) => (
                <div
                  key={proj.id}
                  className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-surface-50/90 border border-white/10 hover:border-accent/40 transition-all text-xs gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent">
                      {proj.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-accent transition-colors flex items-center gap-2">
                        {proj.name}
                        {proj.verified && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" /> AI Verified
                          </span>
                        )}
                      </div>
                      <div className="text-white/50 text-[11px] flex items-center gap-3 mt-0.5">
                        <span>{proj.team}</span>
                        <span>•</span>
                        <span className="text-white/70">{proj.track}</span>
                        <span>•</span>
                        <span className="font-mono text-white/40">{proj.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-white/50">AI Score</div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {proj.score}/100
                      </div>
                    </div>
                    <button
                      onClick={() => toggleApproval(proj.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        mockApproved[proj.id]
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {mockApproved[proj.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Shortlisted
                        </>
                      ) : (
                        'Shortlist'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'judging' && (
            <motion.div
              key="judging"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 text-xs"
            >
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 text-white/90 space-y-2">
                <div className="flex items-center gap-2 text-accent font-semibold">
                  <BrainCircuit className="w-4 h-4" /> Automated AI Rubric Analysis
                </div>
                <p className="text-white/70 text-[11px]">
                  Judges evaluate submissions with instant AI summaries, repo code quality analysis, and fraud detection.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-50 border border-white/10 space-y-2">
                  <div className="text-white/60 text-[11px]">Criterion 1: Innovation & Impact</div>
                  <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-accent to-indigo-500 h-full w-[95%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/50 font-mono">
                    <span>Novelty Index: High</span>
                    <span className="text-accent font-bold">9.5/10</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-50 border border-white/10 space-y-2">
                  <div className="text-white/60 text-[11px]">Criterion 2: Technical Execution</div>
                  <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[92%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/50 font-mono">
                    <span>Code Quality: Verified Clean</span>
                    <span className="text-emerald-400 font-bold">9.2/10</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 text-xs"
            >
              <div className="p-4 rounded-xl bg-surface-50 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">AI Team Matcher Active</div>
                  <div className="text-white/50 text-[11px]">
                    Matching solo developers based on skills, timezone, and project interest.
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-accent/20 text-accent font-mono text-[11px] font-semibold border border-accent/30">
                  94% Match Accuracy
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'Sarah Jenkins', role: 'Fullstack React/Node', match: '98%' },
                  { name: 'David Kim', role: 'ML / PyTorch Engineer', match: '94%' },
                  { name: 'Elena Rostova', role: 'Product / UI Designer', match: '91%' },
                ].map((member) => (
                  <div
                    key={member.name}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-accent/40 transition-colors"
                  >
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-white/50 text-[11px]">{member.role}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold">{member.match} Match</span>
                      <button className="text-accent hover:underline flex items-center gap-0.5">
                        Invite <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Bar */}
      <div className="px-5 py-2.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
        <span className="flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-accent" />
          QR Live Attendance & Check-in Enabled
        </span>
        <span className="font-mono text-white/40">Powered by AlmostHack Engine</span>
      </div>
    </motion.div>
  );
}

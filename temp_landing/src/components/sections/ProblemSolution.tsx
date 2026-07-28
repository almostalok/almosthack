'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  MessageSquare,
  Mail,
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Zap,
  Layers,
  Sparkles,
  RefreshCw,
  LayoutGrid
} from 'lucide-react';

export function ProblemSolution() {
  const [activeWorkflow, setActiveWorkflow] = useState<'traditional' | 'almosthack'>('almosthack');

  const oldTools = [
    { name: 'Google Forms', icon: FileSpreadsheet, issue: 'Messy registrations & lost data', color: 'text-yellow-400' },
    { name: 'Excel Spreadsheets', icon: FileSpreadsheet, issue: 'Version conflicts & broken formulas', color: 'text-emerald-400' },
    { name: 'Discord Servers', icon: MessageSquare, issue: 'Overwhelmed channels & missed pings', color: 'text-indigo-400' },
    { name: 'WhatsApp Groups', icon: MessageSquare, issue: 'Unorganized team formation chaos', color: 'text-green-400' },
    { name: 'Manual Emails', icon: Mail, issue: 'Delayed updates & spam folder drops', color: 'text-blue-400' },
    { name: 'Paper Certificates', icon: AlertTriangle, issue: 'Hours of typing & manual PDF exports', color: 'text-red-400' },
  ];

  const unifiedSolutions = [
    { title: 'Unified Registration & Check-in', desc: 'Custom forms, instant QR check-ins, and ticket validation in seconds.' },
    { title: 'AI Matchmaking & Team Hub', desc: 'Smart algorithm matches hackers by skill set and project track automatically.' },
    { title: 'Central Broadcast & Real-Time Alerts', desc: 'Push notifications via SMS, Email, and Discord bot in one click.' },
    { title: 'Fraud-Proof AI Judging Portal', desc: 'Standardized scoring rubrics, code repo verification, and zero score bias.' },
    { title: 'Instant Holographic Certificates', desc: '1-click certificate generation with cryptographically verifiable links.' },
    { title: 'Real-Time Sponsor Analytics', desc: 'Live visibility into submissions, tech stack usage, and top talents.' },
  ];

  return (
    <section id="problem" className="py-24 relative overflow-hidden bg-[#070709]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono text-accent tracking-widest uppercase px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            THE PARADIGM SHIFT
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Hackathons deserve better than spreadsheets.
          </h2>
          <p className="text-muted text-base sm:text-lg">
            Stop stitching together 7 different apps for every event. Experience true end-to-end operational clarity.
          </p>
        </div>

        {/* Workflow Toggle Control */}
        <div className="mt-10 flex justify-center">
          <div className="bg-surface-50 p-1.5 rounded-2xl border border-white/10 flex items-center gap-2">
            <button
              onClick={() => setActiveWorkflow('traditional')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeWorkflow === 'traditional'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <XCircle className="w-4 h-4 text-red-400" />
              Traditional Chaotic Workflow
            </button>
            <button
              onClick={() => setActiveWorkflow('almosthack')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeWorkflow === 'almosthack'
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-white fill-white" />
              AlmostHack OS (Unified)
            </button>
          </div>
        </div>

        {/* Dynamic Comparison View */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            {activeWorkflow === 'traditional' ? (
              <motion.div
                key="traditional-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-8 rounded-3xl bg-surface border border-red-500/20 glass-card space-y-8"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-sm text-red-400 font-bold">
                      FRAGMENTED CHAOS (7 SEPARATE APPS)
                    </span>
                  </div>
                  <span className="text-xs text-white/50 font-mono">14+ Hours Lost per Event</span>
                </div>

                {/* Workflow Flow Diagram */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {oldTools.map((tool, idx) => {
                    const Icon = tool.icon;
                    return (
                      <div
                        key={tool.name}
                        className="p-4 rounded-xl bg-black/40 border border-white/10 text-center space-y-2 flex flex-col items-center justify-center relative group hover:border-red-500/40 transition-colors"
                      >
                        <Icon className={`w-6 h-6 ${tool.color}`} />
                        <span className="text-xs font-semibold text-white">{tool.name}</span>
                        <span className="text-[10px] text-white/50 leading-tight">{tool.issue}</span>
                        {idx < oldTools.length - 1 && (
                          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-white/30">
                            →
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-center text-xs text-red-300 font-medium">
                  ⚠️ Result: Miscalculated scores, missed announcements, frustrated mentors, delayed schedules, and zero sponsor retention.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="almosthack-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-8 rounded-3xl bg-surface border border-accent/40 glass-card space-y-8 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent animate-ping" />
                    <span className="font-mono text-sm text-accent font-bold">
                      ALMOSTHACK UNIFIED OS (SINGLE PLATFORM)
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Automated Operational Speed
                  </span>
                </div>

                {/* Unified Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {unifiedSolutions.map((sol, idx) => (
                    <div
                      key={sol.title}
                      className="p-5 rounded-2xl bg-surface-50/80 border border-white/10 hover:border-accent/50 transition-all space-y-2 group"
                    >
                      <div className="flex items-center gap-2 text-accent font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        {sol.title}
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">{sol.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 text-center text-xs text-white/90 font-medium flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Everything runs seamlessly under one roof. Organizers save 20+ hours per event.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

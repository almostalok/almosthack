'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  MessageSquare,
  Mail,
  AlertTriangle,
  Zap,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';

export function ProblemSolution() {
  const [activeWorkflow, setActiveWorkflow] = useState<'traditional' | 'almosthack'>('almosthack');

  const oldTools = [
    { name: 'Google Forms', icon: FileSpreadsheet, issue: 'Messy registrations & lost data', color: 'text-amber-500' },
    { name: 'Excel Spreadsheets', icon: FileSpreadsheet, issue: 'Version conflicts & broken formulas', color: 'text-emerald-500' },
    { name: 'Discord Servers', icon: MessageSquare, issue: 'Overwhelmed channels & missed pings', color: 'text-indigo-500' },
    { name: 'WhatsApp Groups', icon: MessageSquare, issue: 'Unorganized team formation chaos', color: 'text-green-500' },
    { name: 'Manual Emails', icon: Mail, issue: 'Delayed updates & spam folder drops', color: 'text-blue-500' },
    { name: 'Paper Certificates', icon: AlertTriangle, issue: 'Hours of typing & manual PDF exports', color: 'text-red-500' },
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
    <section id="problem" className="py-24 relative overflow-hidden bg-background mac-text-main transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono text-cyan tracking-widest uppercase px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20">
            THE PARADIGM SHIFT
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold mac-text-main tracking-tight font-display">
            Hackathons deserve better than spreadsheets.
          </h2>
          <p className="mac-text-muted text-base sm:text-lg">
            Stop stitching together 7 different apps for every event. Experience true end-to-end operational clarity.
          </p>
        </div>

        {/* Workflow Toggle Control */}
        <div className="mt-10 flex justify-center">
          <div className="mac-card-bg p-1.5 rounded-2xl border mac-border flex items-center gap-2">
            <button
              onClick={() => setActiveWorkflow('traditional')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeWorkflow === 'traditional'
                  ? 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-lg'
                  : 'mac-text-muted hover:mac-text-main'
              }`}
            >
              <XCircle className="w-4 h-4 text-red-500" />
              Traditional Chaotic Workflow
            </button>
            <button
              onClick={() => setActiveWorkflow('almosthack')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeWorkflow === 'almosthack'
                  ? 'bg-cyan text-black font-bold shadow-lg shadow-cyan/20'
                  : 'mac-text-muted hover:mac-text-main'
              }`}
            >
              <Zap className="w-4 h-4 text-black fill-black" />
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
                className="p-8 rounded-3xl mac-card-bg border border-red-500/30 space-y-8"
              >
                <div className="flex items-center justify-between border-b mac-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-sm text-red-500 font-bold">
                      FRAGMENTED CHAOS (7 SEPARATE APPS)
                    </span>
                  </div>
                  <span className="text-xs mac-text-muted font-mono">14+ Hours Lost per Event</span>
                </div>

                {/* Workflow Flow Diagram */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {oldTools.map((tool, idx) => {
                    const Icon = tool.icon;
                    return (
                      <div
                        key={tool.name}
                        className="p-4 rounded-xl mac-pill-bg border mac-border text-center space-y-2 flex flex-col items-center justify-center relative group hover:border-red-500/40 transition-colors"
                      >
                        <Icon className={`w-6 h-6 ${tool.color}`} />
                        <span className="text-xs font-semibold mac-text-main">{tool.name}</span>
                        <span className="text-[10px] mac-text-muted leading-tight">{tool.issue}</span>
                        {idx < oldTools.length - 1 && (
                          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 mac-text-muted">
                            →
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center text-xs text-red-500 font-medium">
                  ⚠️ Result: Miscalculated scores, missed announcements, frustrated mentors, delayed schedules, and zero sponsor retention.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="almosthack-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-8 rounded-3xl mac-card-bg border border-cyan/40 space-y-8 shadow-[0_0_50px_rgba(0,240,255,0.15)]"
              >
                <div className="flex items-center justify-between border-b mac-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan animate-ping" />
                    <span className="font-mono text-sm text-cyan font-bold">
                      ALMOSTHACK UNIFIED OS (SINGLE PLATFORM)
                    </span>
                  </div>
                  <span className="text-xs text-emerald-500 font-mono flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Automated Operational Speed
                  </span>
                </div>

                {/* Unified Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {unifiedSolutions.map((sol) => (
                    <div
                      key={sol.title}
                      className="p-5 rounded-2xl mac-pill-bg border mac-border hover:border-cyan/50 transition-all space-y-2 group"
                    >
                      <div className="flex items-center gap-2 text-cyan font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-cyan" />
                        {sol.title}
                      </div>
                      <p className="text-xs mac-text-muted leading-relaxed">{sol.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-cyan/10 border border-cyan/30 text-center text-xs mac-text-main font-medium flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan" />
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

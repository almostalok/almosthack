'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Sparkles, Shield, Cpu, Zap, Activity, CheckCircle2, Code2 } from 'lucide-react';

interface VercelHeroProps {
  onOpenDemoModal?: () => void;
  onOpenCommandMenu?: () => void;
}

export function VercelHero({ onOpenDemoModal, onOpenCommandMenu }: VercelHeroProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'ai'>('overview');

  return (
    <section className="relative pt-24 pb-28 lg:pt-36 lg:pb-40 overflow-hidden bg-black text-white">
      {/* Vercel Ambient Background Beams & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-vercel-radial pointer-events-none opacity-90" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-glow blur-[140px] pointer-events-none opacity-60" />
      <div className="absolute inset-0 vercel-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          
          {/* Tech Brutalist Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full brutalist-tag text-xs text-white/90 shadow-2xl backdrop-blur-xl"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan animate-ping" />
            <span className="text-cyan font-mono font-bold tracking-wider">[ SYSTEM OS v2.4 ]</span>
            <span className="w-px h-3.5 bg-white/20" />
            <span className="text-white/80 font-mono flex items-center gap-1.5">
              Unified Hackathon Engine <Sparkles className="w-3.5 h-3.5 text-cyan" />
            </span>
          </motion.div>

          {/* Neo-Brutalist High Impact Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] uppercase text-white"
          >
            Build Better Hackathons. <br />
            <span className="text-gradient-cyan">Without The Chaos.</span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-lg sm:text-xl text-white/70 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            The Vercel-grade operating system for modern hackathons. Replace fragmented forms, manual spreadsheets, and unorganized channels with one real-time unified engine.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-display font-bold text-sm hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Deploy Hackathon Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenCommandMenu}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface-50 border border-white/20 text-white font-mono text-xs hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-cyan" />
              <span>Interactive Sandbox (Cmd+K)</span>
            </button>
          </motion.div>

          {/* Tech Proof Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pt-4 text-xs font-mono text-white/50"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
              <span>Instant QR Check-ins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
              <span>AI Plagiarism & Repo Audit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
              <span>Cryptographic Holographic Certs</span>
            </div>
          </motion.div>
        </div>

        {/* 3D Dashboard Mockup Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-16 relative max-w-6xl mx-auto"
        >
          {/* Glass Card Container wrapping 3D Mockup */}
          <div className="relative rounded-3xl vercel-card p-3 sm:p-5 vercel-card-hover group shadow-2xl border border-white/15 overflow-hidden">
            
            {/* Top Window Navigation Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/60 rounded-2xl border border-white/10 mb-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-white/50 hidden sm:inline">almosthack-os-v2.4.main.sys</span>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded-lg text-[11px] transition-all ${
                    activeTab === 'overview'
                      ? 'bg-cyan text-black font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  3D Control Center
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-3 py-1 rounded-lg text-[11px] transition-all ${
                    activeTab === 'submissions'
                      ? 'bg-cyan text-black font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Live Code Feed
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`px-3 py-1 rounded-lg text-[11px] transition-all ${
                    activeTab === 'ai'
                      ? 'bg-cyan text-black font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  AI Rubric Core
                </button>
              </div>

              <div className="flex items-center gap-2 text-cyan font-bold">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">99.99% Uptime</span>
              </div>
            </div>

            {/* 3D Asset Mockup Rendering */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] w-full bg-black/80 flex items-center justify-center group-hover:scale-[1.01] transition-transform duration-500">
              <Image
                src="/images/hero-3d-mockup.png"
                alt="3D Hackathon OS Control Center Mockup"
                fill
                priority
                className="object-cover rounded-2xl opacity-95 group-hover:opacity-100 transition-opacity"
              />

              {/* Holographic Overlay Effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

              {/* Floating Stat Card 1 */}
              <div className="absolute bottom-6 left-6 p-4 rounded-2xl vercel-card border border-white/20 text-left font-mono hidden sm:block backdrop-blur-2xl shadow-xl">
                <div className="text-[10px] text-white/50 uppercase tracking-widest">Global Hackers</div>
                <div className="text-xl font-bold text-white font-display flex items-center gap-2 mt-0.5">
                  12,480+ <span className="text-xs font-mono text-cyan bg-cyan/10 px-2 py-0.5 rounded-full">+480 today</span>
                </div>
              </div>

              {/* Floating Stat Card 2 */}
              <div className="absolute top-8 right-8 p-4 rounded-2xl vercel-card border border-cyan/30 text-left font-mono hidden sm:block backdrop-blur-2xl shadow-xl">
                <div className="text-[10px] text-cyan uppercase tracking-widest flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Automated AI Judging
                </div>
                <div className="text-lg font-bold text-white font-display mt-0.5">
                  0.2s Evaluation Speed
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { TiltedCard } from '@/components/reactbits/TiltedCard';
import { ShinyText } from '@/components/reactbits/ShinyText';
import { HeroHyperspeedBackground } from '@/components/reactbits/HeroHyperspeedBackground';
import {
  IconAppleMac,
  IconWindowsOS,
  IconCpuChip,
  IconTrophy,
  IconShieldCert,
  IconSparkle,
  IconTerminalCode,
  IconZapFlash,
  IconCheckCircle,
} from '@/components/ui/CustomIcons';

interface ClickyHeroSectionProps {
  onOpenDemoModal?: () => void;
  onOpenCommandMenu?: () => void;
}

export function ClickyHeroSection({ onOpenDemoModal, onOpenCommandMenu }: ClickyHeroSectionProps) {
  return (
    <section className="relative min-h-screen pt-12 pb-28 overflow-hidden bg-modern-dark text-white select-none">
      
      {/* ReactBits Animated Cosmic Floating Particle Canvas */}
      <HeroHyperspeedBackground />

      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-cyan-glow opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-900/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-900/25 blur-3xl pointer-events-none" />

      {/* FLOATING MACOS WINDOWS & REACTBITS TILTED CARDS */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Floating Kaomojis */}
        <div className="hidden lg:block absolute left-6 top-10 -rotate-6 z-20">
          <div className="kaomoji-badge font-mono text-cyan shadow-cyan/20">
            ^ ω ^
          </div>
        </div>

        <div className="hidden lg:block absolute right-16 top-12 rotate-12 z-20">
          <div className="kaomoji-badge font-mono text-purple-400">
            &#123; ^-^ &#125;
          </div>
        </div>

        <div className="hidden lg:block absolute left-20 top-[420px] -rotate-12 z-20">
          <div className="kaomoji-badge font-mono text-amber-400">
            (¬_¬)
          </div>
        </div>

        <div className="hidden lg:block absolute right-24 top-[380px] rotate-6 z-20">
          <div className="kaomoji-badge font-mono text-emerald-400">
            ¯\_(ツ)_/¯
          </div>
        </div>

        {/* Custom Dark Nametag Sticker */}
        <div className="hidden xl:block absolute right-8 top-2 -rotate-6 z-20">
          <div className="nametag-dark p-3 shadow-2xl w-48 text-center font-mono">
            <div className="text-cyan text-[9px] font-bold uppercase tracking-widest bg-cyan/15 py-1 rounded border border-cyan/30">
              HELLO my name is
            </div>
            <div className="mt-2 text-white font-display font-extrabold text-sm flex items-center justify-center gap-1.5">
              <IconZapFlash className="w-4 h-4 text-cyan fill-cyan" />
              AlmostHack AI
            </div>
            <div className="mt-1 text-[9px] text-zinc-500">
              agent #0042 • sonoma OS
            </div>
          </div>
        </div>

        {/* ReactBits 3D Tilted macOS Window 1 (Top Left): ai_eval_agent.mov */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block absolute left-2 top-20 w-64 z-10"
        >
          <TiltedCard maxRotate={15} scale={1.04}>
            <div className="mac-window shadow-2xl overflow-hidden">
              <div className="mac-window-bar">
                <div className="mac-dots">
                  <span className="mac-dot mac-dot-close" />
                  <span className="mac-dot mac-dot-min" />
                  <span className="mac-dot mac-dot-zoom" />
                </div>
                <span className="text-[10px] font-mono text-zinc-400">ai_eval_agent.mov</span>
              </div>
              <div className="p-3.5 bg-zinc-950/90 font-mono text-[11px] text-zinc-300 flex flex-col gap-2">
                <div className="flex items-center justify-between text-cyan font-bold">
                  <span className="flex items-center gap-1.5"><IconCpuChip className="w-3.5 h-3.5 text-cyan" /> Auto-Reviewing</span>
                  <span className="animate-pulse text-emerald-400 text-[10px]">● LIVE</span>
                </div>
                <div className="bg-black/70 p-2.5 rounded border border-white/10 text-[10px] space-y-1">
                  <p className="text-emerald-400 font-semibold">✓ 42 Commits Scanned</p>
                  <p className="text-zinc-300">Code Score: 98.4 / 100</p>
                  <p className="text-zinc-500 text-[9px]">Plagiarism: 0% Detected</p>
                </div>
              </div>
            </div>
          </TiltedCard>
        </motion.div>

        {/* ReactBits 3D Tilted macOS Window 2 (Top Right): live_leaderboard.mov */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: 5 }}
          animate={{ opacity: 1, y: 0, rotate: 5 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:block absolute right-4 top-28 w-64 z-10"
        >
          <TiltedCard maxRotate={15} scale={1.04}>
            <div className="mac-window shadow-2xl overflow-hidden">
              <div className="mac-window-bar">
                <div className="mac-dots">
                  <span className="mac-dot mac-dot-close" />
                  <span className="mac-dot mac-dot-min" />
                  <span className="mac-dot mac-dot-zoom" />
                </div>
                <span className="text-[10px] font-mono text-zinc-400">live_leaderboard.mov</span>
              </div>
              <div className="p-3.5 bg-zinc-950/90 font-mono text-[11px] text-zinc-300 flex flex-col gap-2">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span className="flex items-center gap-1.5"><IconTrophy className="w-3.5 h-3.5" /> Top Hackers</span>
                  <span className="text-[9px] text-zinc-400">50 Teams</span>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between bg-white/5 px-2.5 py-1 rounded border border-white/5">
                    <span className="text-white font-bold">1. Team CyberPunk</span>
                    <span className="text-cyan font-bold">99.2 pts</span>
                  </div>
                  <div className="flex justify-between bg-white/5 px-2.5 py-1 rounded border border-white/5">
                    <span className="text-white">2. Neural Builders</span>
                    <span className="text-cyan font-bold">96.8 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </TiltedCard>
        </motion.div>

        {/* ReactBits 3D Tilted macOS Window 3 (Bottom Left): cert_mint.mov */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 3 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden lg:block absolute left-8 top-[480px] w-56 z-10"
        >
          <TiltedCard maxRotate={15} scale={1.04}>
            <div className="mac-window shadow-2xl overflow-hidden">
              <div className="mac-window-bar">
                <div className="mac-dots">
                  <span className="mac-dot mac-dot-close" />
                  <span className="mac-dot mac-dot-min" />
                  <span className="mac-dot mac-dot-zoom" />
                </div>
                <span className="text-[10px] font-mono text-zinc-400">cert_mint.mov</span>
              </div>
              <div className="p-3.5 bg-zinc-950/90 font-mono text-[11px] text-zinc-300 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <IconShieldCert className="w-3.5 h-3.5" /> Crypto Certificate
                </div>
                <div className="text-[10px] text-zinc-400 bg-purple-950/40 p-2.5 rounded border border-purple-500/25">
                  Proof of Win: #0492
                  <div className="text-[9px] text-purple-300 truncate mt-1">Hash: 0x8a92...f7b</div>
                </div>
              </div>
            </div>
          </TiltedCard>
        </motion.div>

        {/* CENTER HERO HEADLINE GROUP */}
        <div className="pt-16 pb-12 text-center max-w-3xl mx-auto relative z-20">
          
          {/* ReactBits ShinyText Pill Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-zinc-900/90 border border-white/15 px-4 py-1.5 rounded-full text-xs font-mono mb-6 shadow-xl shadow-cyan/10"
          >
            <IconSparkle className="w-3.5 h-3.5 text-cyan" />
            <ShinyText text="macOS & Web AI Hackathon Copilot" speed={4} />
          </motion.div>

          {/* Main Title: heyclicky styled almosthack */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white lowercase leading-none"
          >
            almosthack
          </motion.h1>

          {/* Subtitle with Instrument Serif Accent */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-xl sm:text-2xl text-zinc-300 max-w-2xl mx-auto font-sans font-normal tracking-tight leading-relaxed"
          >
            an ai buddy &amp; evaluation engine that{' '}
            <span className="font-serif italic text-cyan text-2xl sm:text-3xl font-normal">
              lives on your mac &amp; web
            </span>
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <div className="flex flex-col items-center">
              <button
                onClick={onOpenDemoModal}
                className="mac-btn-gloss px-8 py-4 rounded-xl font-display font-bold text-sm text-white flex items-center gap-3 shadow-2xl cursor-pointer group"
              >
                <IconAppleMac size={20} className="fill-white group-hover:scale-110 transition-transform" />
                <span>download for mac</span>
              </button>
              <span className="mt-2 text-[11px] font-mono text-zinc-500">
                100% free. sonoma 14.2 or higher
              </span>
            </div>

            <button
              onClick={onOpenDemoModal}
              className="px-7 py-4 rounded-xl bg-zinc-900 border border-white/15 hover:border-white/35 text-zinc-200 hover:text-white font-display font-semibold text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-lg"
            >
              <IconWindowsOS size={16} className="fill-cyan" />
              <span>windows waitlist</span>
            </button>
          </motion.div>
        </div>

        {/* REACTBITS SPOTLIGHT CARD: CENTER DEMO WINDOW */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto relative z-20 mt-4"
        >
          <SpotlightCard
            spotlightColor="rgba(0, 240, 255, 0.22)"
            className="mac-window shadow-[0_30px_100px_rgba(0,240,255,0.2)]"
          >
            <div className="mac-window-bar px-4 py-3">
              <div className="mac-dots">
                <span className="mac-dot mac-dot-close" />
                <span className="mac-dot mac-dot-min" />
                <span className="mac-dot mac-dot-zoom" />
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                <IconZapFlash className="w-3.5 h-3.5 text-cyan fill-cyan" />
                <span>almosthack_dashboard_v2.mov</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Ready
              </span>
            </div>

            <div className="p-6 bg-zinc-950/95 aspect-video rounded-b-xl relative overflow-hidden flex flex-col justify-between">
              
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan/20 border border-cyan/40 flex items-center justify-center text-cyan font-extrabold font-mono text-sm shadow-md">
                    AH
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">Global AI Hackathon 2026</h3>
                    <p className="font-mono text-xs text-zinc-400">128 Submissions • Real-time AI Scoring Active</p>
                  </div>
                </div>
                <button
                  onClick={onOpenCommandMenu}
                  className="bg-white/10 hover:bg-white/20 text-white font-mono text-xs px-3.5 py-2 rounded-md flex items-center gap-2 transition-colors cursor-pointer border border-white/10"
                >
                  <IconTerminalCode className="w-3.5 h-3.5 text-cyan" />
                  <span>Run Evaluation</span>
                </button>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="bg-zinc-900/80 border border-white/10 p-3.5 rounded-lg flex flex-col gap-1">
                  <span className="text-[11px] font-mono text-cyan flex items-center gap-1.5 font-bold">
                    <IconCheckCircle className="w-3.5 h-3.5 text-cyan" /> Code &amp; Repo Analysis
                  </span>
                  <p className="text-xs text-zinc-300">Instant GitHub commit parsing, architecture check &amp; plagiarism detection.</p>
                </div>

                <div className="bg-zinc-900/80 border border-white/10 p-3.5 rounded-lg flex flex-col gap-1">
                  <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1.5 font-bold">
                    <IconSparkle className="w-3.5 h-3.5 text-purple-400" /> AI Judge Copilot
                  </span>
                  <p className="text-xs text-zinc-300">AI auto-scores pitch decks, demo videos, and technical execution.</p>
                </div>

                <div className="bg-zinc-900/80 border border-white/10 p-3.5 rounded-lg flex flex-col gap-1">
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                    <IconTrophy className="w-3.5 h-3.5 text-emerald-400" /> Automated Payouts
                  </span>
                  <p className="text-xs text-zinc-300">Smart contract prize distribution &amp; cryptographic certificates.</p>
                </div>
              </div>

              {/* Bottom Window Status */}
              <div className="bg-zinc-900/90 border border-white/10 px-4 py-2.5 rounded-lg flex items-center justify-between font-mono text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
                  <span className="text-zinc-200">Agent Status: Standing by for new submissions</span>
                </div>
                <button
                  onClick={onOpenDemoModal}
                  className="text-cyan hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Launch Interactive Demo</span>
                  <IconZapFlash className="w-3 h-3 text-cyan fill-cyan" />
                </button>
              </div>

            </div>
          </SpotlightCard>
        </motion.div>

      </div>
    </section>
  );
}

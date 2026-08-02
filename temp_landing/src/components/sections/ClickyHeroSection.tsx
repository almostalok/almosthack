'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
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
  IconArrowRight,
} from '@/components/ui/CustomIcons';

interface ClickyHeroSectionProps {
  onOpenDemoModal?: () => void;
  onOpenCommandMenu?: () => void;
}

export function ClickyHeroSection({ onOpenDemoModal, onOpenCommandMenu }: ClickyHeroSectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'rubric' | 'certs'>('overview');

  return (
    <section className="relative pt-12 pb-24 overflow-hidden bg-[#051C14] text-white select-none transition-colors duration-300">
      
      {/* Background Particle Canvas */}
      <HeroHyperspeedBackground />

      {/* Ambient Grid */}
      <div className="absolute inset-0 optimizely-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* HERO HEADLINE SECTION */}
        <div className="pt-10 pb-10 text-center max-w-4xl mx-auto relative z-20">
          
          {/* Pastel Pink Pill Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 optimizely-pill-pink mb-8 shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-[#072419] animate-ping" />
            <span className="text-[#072419] font-extrabold">[ HACKATHON OS ]</span>
            <span className="text-[#072419]/40">|</span>
            <span>AI Platform to create &amp; optimize hackathons</span>
          </motion.div>

          {/* Main Title: Optimizely 3D Layered Extrusion */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter lowercase leading-none"
          >
            <span className="optimizely-hero-title">almosthack</span>
          </motion.h1>

          {/* Subtitle with Serif Accent */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-2xl text-slate-200 max-w-2xl mx-auto font-sans font-normal tracking-tight leading-relaxed"
          >
            The AI platform to create and optimize every hackathon.{' '}
            <span className="serif-accent text-[#ABFF44] text-2xl sm:text-3xl font-normal">
              So builders can do the work they love.
            </span>
          </motion.p>

          {/* Optimizely Tactile 3D Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <div className="flex flex-col items-center">
              <button
                onClick={onOpenDemoModal}
                className="optimizely-btn-lime px-8 py-4 text-sm font-bold flex items-center gap-3 cursor-pointer"
              >
                <IconAppleMac size={20} className="fill-[#072419] text-[#072419]" />
                <span>Download macOS App</span>
                <IconArrowRight size={16} className="text-[#072419]" />
              </button>
              <span className="mt-2.5 text-[11px] font-mono text-[#789887]">
                Free v2.4 Release • macOS Sonoma 14.2+
              </span>
            </div>

            <button
              onClick={onOpenDemoModal}
              className="optimizely-btn-dark px-7 py-4 text-sm font-bold flex items-center gap-2.5 cursor-pointer"
            >
              <IconWindowsOS size={16} className="fill-[#ABFF44]" />
              <span>Web Platform &amp; Windows</span>
            </button>
          </motion.div>
        </div>

        {/* DEMO MACOS WINDOW WITH OPTIMIZELY TACTILE CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto relative z-20 mt-4"
        >
          <SpotlightCard
            spotlightColor="rgba(171, 255, 68, 0.15)"
            className="mac-window border-2 border-[#0D3A29]"
          >
            {/* macOS Title Bar */}
            <div className="mac-window-bar px-5 py-3">
              <div className="mac-dots">
                <span className="mac-dot mac-dot-close" />
                <span className="mac-dot mac-dot-min" />
                <span className="mac-dot mac-dot-zoom" />
              </div>

              {/* Tab Switcher inside Mac Window */}
              <div className="hidden sm:flex items-center gap-1.5 bg-[#051C14] p-1 rounded-xl border border-[#0D3A29] text-xs font-mono">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'overview' ? 'bg-[#ABFF44] text-[#072419] font-bold shadow-sm' : 'text-[#789887] hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'submissions' ? 'bg-[#ABFF44] text-[#072419] font-bold shadow-sm' : 'text-[#789887] hover:text-white'
                  }`}
                >
                  Submissions (128)
                </button>
                <button
                  onClick={() => setActiveTab('rubric')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'rubric' ? 'bg-[#ABFF44] text-[#072419] font-bold shadow-sm' : 'text-[#789887] hover:text-white'
                  }`}
                >
                  AI Rubric
                </button>
                <button
                  onClick={() => setActiveTab('certs')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'certs' ? 'bg-[#ABFF44] text-[#072419] font-bold shadow-sm' : 'text-[#789887] hover:text-white'
                  }`}
                >
                  Certificates
                </button>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-[#ABFF44] animate-pulse" />
                <span className="text-[#ABFF44] font-bold text-[11px]">AI Engine Online</span>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="p-6 sm:p-8 bg-[#051C14] rounded-b-2xl min-h-[380px] flex flex-col justify-between text-white">
              
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#0D3A29] pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#ABFF44] border-2 border-[#0D3A29] flex items-center justify-center text-[#072419] font-mono font-black text-lg shadow-md">
                        AH
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-white text-lg sm:text-xl">
                          Global AI Innovators Hackathon 2026
                        </h3>
                        <p className="font-mono text-xs text-[#789887] mt-0.5">
                          128 Teams • $25,000 Prize Pool • Autonomous AI Scoring Active
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onOpenCommandMenu}
                      className="self-start sm:self-auto optimizely-btn-dark px-4 py-2 text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <IconTerminalCode className="w-4 h-4 text-[#ABFF44]" />
                      <span>Run Command (⌘K)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0D3A29]/60 border border-[#0D3A29] p-4 rounded-xl transition-all hover:border-[#ABFF44]">
                      <span className="text-xs font-mono text-[#ABFF44] flex items-center gap-2 font-bold mb-2">
                        <IconCheckCircle className="w-4 h-4 text-[#ABFF44]" /> Automated Code Audit
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Deep GitHub commit history analysis, repo structure checks, and instant plagiarism similarity scoring.
                      </p>
                    </div>

                    <div className="bg-[#0D3A29]/60 border border-[#0D3A29] p-4 rounded-xl transition-all hover:border-[#ABFF44]">
                      <span className="text-xs font-mono text-purple-400 flex items-center gap-2 font-bold mb-2">
                        <IconSparkle className="w-4 h-4 text-purple-400" /> AI Rubric Evaluator
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Multi-criteria AI evaluation for pitch decks, demo videos, innovation depth, and UI/UX polish.
                      </p>
                    </div>

                    <div className="bg-[#0D3A29]/60 border border-[#0D3A29] p-4 rounded-xl transition-all hover:border-[#ABFF44]">
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-2 font-bold mb-2">
                        <IconTrophy className="w-4 h-4 text-emerald-400" /> Instant Verifiable Certs
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Generate cryptographically signed certificates with QR verification for every participant instantly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[#789887] border-b border-[#0D3A29] pb-2">
                    <span>PROJECT / TEAM</span>
                    <span>REPO AUDIT</span>
                    <span>AI SCORE</span>
                    <span>STATUS</span>
                  </div>
                  {[
                    { team: 'NeuralFlow AI', repo: 'github.com/neuralflow/core', score: '96.8 / 100', status: 'Passed Audit' },
                    { team: 'QuantumLedger', repo: 'github.com/quantum/chain', score: '92.4 / 100', status: 'Passed Audit' },
                    { team: 'VisionCraft VR', repo: 'github.com/visioncraft/app', score: '89.1 / 100', status: 'Verified' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono p-3 bg-[#0D3A29]/40 border border-[#0D3A29] rounded-lg">
                      <span className="text-white font-bold">{row.team}</span>
                      <span className="text-[#789887]">{row.repo}</span>
                      <span className="text-[#ABFF44] font-bold">{row.score}</span>
                      <span className="text-[#072419] bg-[#ABFF44] px-2 py-0.5 rounded font-bold text-[10px]">
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'rubric' && (
                <div className="space-y-4">
                  <h4 className="font-display font-bold text-white text-sm">Autonomous Evaluation Matrix</h4>
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Technical Complexity (35%)</span>
                        <span className="text-[#ABFF44] font-bold">98/100</span>
                      </div>
                      <div className="w-full h-2 bg-[#0D3A29] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ABFF44] w-[98%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Innovation &amp; Originality (25%)</span>
                        <span className="text-purple-400 font-bold">94/100</span>
                      </div>
                      <div className="w-full h-2 bg-[#0D3A29] rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 w-[94%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>UI/UX &amp; Design Excellence (20%)</span>
                        <span className="text-emerald-400 font-bold">96/100</span>
                      </div>
                      <div className="w-full h-2 bg-[#0D3A29] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[96%]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'certs' && (
                <div className="p-6 bg-gradient-to-r from-[#0D3A29] to-[#051C14] border-2 border-[#ABFF44]/40 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#ABFF44] uppercase tracking-wider font-bold">
                      VERIFIABLE CREDENTIAL
                    </span>
                    <h4 className="font-display font-bold text-white text-lg">Certificate of Excellence</h4>
                    <p className="text-xs text-slate-300 font-mono">Issued to: Alex Vance • Global AI Hackathon 2026</p>
                  </div>
                  <div className="w-16 h-16 bg-[#ABFF44] p-1.5 rounded-lg shadow-lg flex items-center justify-center border-2 border-[#0D3A29]">
                    <div className="w-full h-full border border-[#072419] p-1 flex items-center justify-center font-mono text-[8px] font-bold text-[#072419]">
                      QR VERIFY
                    </div>
                  </div>
                </div>
              )}

              {/* Window Footer Telemetry Bar */}
              <div className="mt-6 pt-4 border-t-2 border-[#0D3A29] flex items-center justify-between font-mono text-xs text-[#789887]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ABFF44] animate-ping" />
                  <span className="text-slate-300">Live Agent: 128 submissions evaluated in 4.2s</span>
                </div>
                <button
                  onClick={onOpenDemoModal}
                  className="text-[#ABFF44] hover:underline flex items-center gap-1 font-bold transition-colors cursor-pointer"
                >
                  <span>Launch Live Demo</span>
                  <IconZapFlash className="w-3.5 h-3.5 text-[#ABFF44] fill-[#ABFF44]" />
                </button>
              </div>

            </div>
          </SpotlightCard>
        </motion.div>

      </div>
    </section>
  );
}

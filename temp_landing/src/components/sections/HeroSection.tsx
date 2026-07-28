'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Sparkles, Users, Award, Code, CheckCircle2 } from 'lucide-react';
import { HeroDashboardPreview } from './HeroDashboardPreview';

interface HeroSectionProps {
  onOpenDemoModal?: () => void;
}

export function HeroSection({ onOpenDemoModal }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'judging'>('overview');

  return (
    <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-36 overflow-hidden">
      {/* Background Gradients & Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-hero-gradient pointer-events-none opacity-80" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-50/80 border border-white/10 text-xs font-medium text-white/90 backdrop-blur-md shadow-inner"
          >
            <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
            <span className="text-white/60 font-mono text-[11px]">ALMOSTHACK OS 2.0</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-accent font-semibold flex items-center gap-1">
              End-to-End Hackathon Engine <Sparkles className="w-3 h-3" />
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
          >
            Build Better Hackathons. <br />
            <span className="text-gradient-accent">Without the Chaos.</span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted max-w-2xl mx-auto font-normal leading-relaxed"
          >
            The Modern Operating System for Hackathons. Replace fragmented forms, spreadsheets, Discord channels, and manual certificates with one powerful platform.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-all shadow-xl shadow-accent/25 flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Organizing Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface-50 border border-white/15 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
              <span>Watch 2-Min Demo</span>
            </button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pt-4 text-xs text-white/50"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              <span>Setup in under 5 minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              <span>Automated AI Judging & Certificates</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Feature Pills surrounding dashboard */}
        <div className="mt-14 relative">
          <HeroDashboardPreview />
        </div>
      </div>
    </section>
  );
}

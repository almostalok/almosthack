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
  IconArrowRight,
} from '@/components/ui/CustomIcons';

export function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'registration',
      title: 'Registration Management',
      desc: 'Customizable registration forms, instant eligibility screening, role assignment, and automated RSVP workflows.',
      badge: 'Zero Friction',
      preview: {
        title: 'Custom Registration Portal',
        stat1: '1,420 Registered',
        stat2: '99.4% Completion',
        detail: 'Instant RSVP verification & automated Discord role assignment upon registration.',
      },
    },
    {
      id: 'team-formation',
      title: 'AI Team Formation',
      desc: 'Algorithmic matchmaking connects solo hackers based on tech stack, experience level, timezones, and project ideas.',
      badge: 'AI Engine',
      preview: {
        title: 'Smart Matching Hub',
        stat1: '320 Teams Formed',
        stat2: '94% Compatibility',
        detail: 'Matching React & Python devs with UI designers automatically before hacking begins.',
      },
    },
    {
      id: 'judge-portal',
      title: 'Bias-Proof Judge Portal',
      desc: 'Standardized scoring rubrics, code repo verification, duplicate entry shields, and weighted score calculations.',
      badge: 'Fair Scoring',
      preview: {
        title: 'Judge Evaluation Matrix',
        stat1: '50 Judges Active',
        stat2: '100% Unbiased Score',
        detail: 'Automated code similarity checks & weighted scoring matrix across all tracks.',
      },
    },
    {
      id: 'certificate-engine',
      title: 'Cryptographic Certificates',
      desc: 'Generate thousands of verifiable certificates on IPFS & Solana with 1-click LinkedIn sharing.',
      badge: 'Web3 & PDF',
      preview: {
        title: 'Instant Badge Minting',
        stat1: '1,200 Certificates',
        stat2: '<1s Generation',
        detail: 'IPFS hash proof of win attached directly to participant profile credentials.',
      },
    },
  ];

  return (
    <section id="features" className="py-28 relative overflow-hidden bg-black text-white bg-noise-fine select-none">
      {/* Radial Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-cyan-glow opacity-25 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Instrument Serif Accent */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-block px-3.5 py-1 rounded-full bg-zinc-900 border border-white/15 text-xs font-mono text-cyan uppercase tracking-wider">
            os core features
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white">
            deep feature modules{' '}
            <span className="font-serif italic text-cyan text-4xl sm:text-6xl font-normal">
              built for scale
            </span>
          </h2>
          <p className="font-sans text-zinc-400 text-base sm:text-lg">
            everything required to launch, manage, evaluate, and award developers in one unified desktop experience.
          </p>
        </div>

        {/* Feature Interactive Split Shell */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Feature Buttons */}
          <div className="lg:col-span-5 space-y-3 font-mono">
            {features.map((feat, idx) => {
              const isSelected = activeFeature === idx;
              return (
                <SpotlightCard
                  key={feat.id}
                  onClick={() => setActiveFeature(idx)}
                  spotlightColor="rgba(0, 240, 255, 0.15)"
                  className={`mac-window p-5 border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan/50 bg-zinc-950/95 shadow-xl'
                      : 'border-white/10 bg-zinc-950/80 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <IconZapFlash size={14} className={isSelected ? 'text-cyan fill-cyan' : 'text-zinc-500'} />
                      <h3 className="font-display font-bold text-sm text-white">{feat.title}</h3>
                    </div>
                    <span className="text-[10px] text-cyan bg-cyan/15 border border-cyan/30 px-2 py-0.5 rounded font-bold">
                      {feat.badge}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-zinc-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </SpotlightCard>
              );
            })}
          </div>

          {/* Right Column: Dynamic Preview Window inside SpotlightCard */}
          <div className="lg:col-span-7">
            <SpotlightCard
              spotlightColor="rgba(0, 240, 255, 0.2)"
              className="mac-window border border-white/15 overflow-hidden shadow-2xl p-0"
            >
              <div className="mac-window-bar px-6 py-3">
                <div className="mac-dots">
                  <span className="mac-dot mac-dot-close" />
                  <span className="mac-dot mac-dot-min" />
                  <span className="mac-dot mac-dot-zoom" />
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                  <IconTerminalCode size={14} className="text-cyan" />
                  <span>module_{features[activeFeature].id}.app</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </div>

              <div className="p-8 bg-zinc-950/95 space-y-6 font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h4 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <IconSparkle size={18} className="text-cyan" />
                    {features[activeFeature].preview.title}
                  </h4>
                  <span className="text-xs text-cyan bg-cyan/10 border border-cyan/25 px-3 py-1 rounded-full">
                    {features[activeFeature].badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 space-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase">PRIMARY METRIC</div>
                    <div className="text-2xl font-bold text-white">{features[activeFeature].preview.stat1}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 space-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase">SYSTEM EFFICIENCY</div>
                    <div className="text-2xl font-bold text-cyan">{features[activeFeature].preview.stat2}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black border border-white/10 text-xs text-zinc-300 flex items-start gap-2">
                  <IconCheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="font-sans">{features[activeFeature].preview.detail}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

        </div>

      </div>
    </section>
  );
}

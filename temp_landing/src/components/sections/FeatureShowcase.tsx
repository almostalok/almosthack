'use client';

import React, { useState } from 'react';
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
      title: 'AI Team Matchmaking',
      desc: 'Algorithmic matchmaking connects solo hackers based on tech stack, experience level, timezones, and project ideas.',
      badge: 'AI Match',
      preview: {
        title: 'Smart Matching Hub',
        stat1: '320 Teams Formed',
        stat2: '94% Compatibility',
        detail: 'Matching React & Python devs with UI designers automatically before hacking begins.',
      },
    },
    {
      id: 'judge-portal',
      title: 'Bias-Proof Rubrics',
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
    <section id="features" className="py-28 relative overflow-hidden bg-[#051C14] text-white select-none transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="optimizely-pill-pink shadow-md">
            [ PLATFORM MODULES ]
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white">
            Deep Feature Modules{' '}
            <span className="serif-accent text-[#ABFF44] font-normal">
              Built for Scale
            </span>
          </h2>
          <p className="font-sans text-slate-300 text-base sm:text-lg leading-relaxed">
            Everything required to launch, manage, evaluate, and award developers in one unified desktop &amp; web experience.
          </p>
        </div>

        {/* Feature Split Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Optimizely Tactile Cards */}
          <div className="lg:col-span-5 space-y-4 font-mono">
            {features.map((feat, idx) => {
              const isSelected = activeFeature === idx;
              return (
                <SpotlightCard
                  key={feat.id}
                  onClick={() => setActiveFeature(idx)}
                  spotlightColor="rgba(171, 255, 68, 0.15)"
                  className={`mac-window p-5 border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#ABFF44] bg-[#0D3A29] shadow-[ -4px_4px_0_0_#ABFF44]'
                      : 'border-[#0D3A29] bg-[#051C14] hover:border-[#ABFF44]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconZapFlash size={14} className={isSelected ? 'text-[#ABFF44] fill-[#ABFF44]' : 'text-[#789887]'} />
                      <h3 className="font-display font-bold text-base text-white">{feat.title}</h3>
                    </div>
                    <span className="optimizely-pill-lime text-[10px] px-2 py-0.5">
                      {feat.badge}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-slate-300 leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </SpotlightCard>
              );
            })}
          </div>

          {/* Right Column: Live Module Workspace Window */}
          <div className="lg:col-span-7">
            <SpotlightCard
              spotlightColor="rgba(171, 255, 68, 0.18)"
              className="mac-window border-2 border-[#0D3A29] overflow-hidden p-0"
            >
              <div className="mac-window-bar px-6 py-3.5">
                <div className="mac-dots">
                  <span className="mac-dot mac-dot-close" />
                  <span className="mac-dot mac-dot-min" />
                  <span className="mac-dot mac-dot-zoom" />
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-white font-bold">
                  <IconTerminalCode size={14} className="text-[#ABFF44]" />
                  <span>module_{features[activeFeature].id}.app</span>
                </div>
                <span className="text-[10px] font-mono text-[#072419] bg-[#ABFF44] px-2.5 py-0.5 rounded-full font-bold">
                  Active Workspace
                </span>
              </div>

              <div className="p-8 bg-[#051C14] space-y-6 font-mono">
                <div className="flex items-center justify-between border-b-2 border-[#0D3A29] pb-4">
                  <h4 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <IconSparkle size={18} className="text-[#ABFF44]" />
                    {features[activeFeature].preview.title}
                  </h4>
                  <span className="optimizely-pill-pink">
                    {features[activeFeature].badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-1">
                    <div className="text-[10px] text-[#789887] uppercase font-bold">PRIMARY METRIC</div>
                    <div className="text-2xl font-bold text-white">{features[activeFeature].preview.stat1}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-1">
                    <div className="text-[10px] text-[#789887] uppercase font-bold">SYSTEM EFFICIENCY</div>
                    <div className="text-2xl font-bold text-[#ABFF44]">{features[activeFeature].preview.stat2}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D3A29] border-2 border-[#ABFF44]/30 text-xs text-slate-200 flex items-start gap-2.5">
                  <IconCheckCircle size={16} className="text-[#ABFF44] shrink-0 mt-0.5" />
                  <p className="font-sans leading-relaxed">{features[activeFeature].preview.detail}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

        </div>

      </div>
    </section>
  );
}

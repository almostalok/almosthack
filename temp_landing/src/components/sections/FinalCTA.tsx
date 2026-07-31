'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { FooterFluidWaves } from '@/components/reactbits/FooterFluidWaves';
import { IconSparkle, IconArrowRight, IconZapFlash } from '@/components/ui/CustomIcons';

interface FinalCTAProps {
  onOpenDemoModal?: () => void;
}

export function FinalCTA({ onOpenDemoModal }: FinalCTAProps) {
  return (
    <section id="final-cta" className="py-24 relative overflow-hidden bg-modern-dark text-white select-none">
      
      {/* ReactBits Animated Fluid Neon Wave Canvas Background */}
      <FooterFluidWaves />

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-glow opacity-30 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.2)"
          className="mac-window p-10 sm:p-14 border border-white/15 bg-zinc-950/95 shadow-[0_30px_100px_rgba(0,240,255,0.18)] relative overflow-hidden flex flex-col items-center gap-6"
        >
          <div className="mac-dots absolute top-4 left-4">
            <span className="mac-dot mac-dot-close" />
            <span className="mac-dot mac-dot-min" />
            <span className="mac-dot mac-dot-zoom" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-white/15 text-cyan font-mono text-xs mt-2">
            <IconSparkle size={14} className="text-cyan" />
            <span>the future of hackathons</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight font-display max-w-3xl leading-tight">
            ready to build your{' '}
            <span className="font-serif italic text-cyan text-4xl sm:text-6xl font-normal">
              next hackathon?
            </span>
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto font-sans">
            join hundreds of colleges, communities, and tech companies running chaos-free hackathons with AlmostHack.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <a
              href="#pricing"
              className="mac-btn-gloss w-full sm:w-auto px-8 py-4 rounded-xl text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-2xl cursor-pointer"
            >
              <span>start free now</span>
              <IconArrowRight size={14} className="text-cyan" />
            </a>

            <button
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 border border-white/15 text-zinc-300 hover:text-white font-mono text-xs font-bold hover:border-white/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <IconZapFlash size={14} className="text-cyan fill-cyan" />
              <span>book 1-on-1 demo</span>
            </button>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}

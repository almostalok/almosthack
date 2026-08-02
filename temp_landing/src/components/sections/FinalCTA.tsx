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
    <section id="final-cta" className="py-28 relative overflow-hidden bg-[#051C14] text-white select-none transition-colors duration-300">
      
      {/* Animated Waves */}
      <FooterFluidWaves />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <SpotlightCard
          spotlightColor="rgba(171, 255, 68, 0.22)"
          className="mac-window p-10 sm:p-16 border-2 border-[#0D3A29] bg-[#051C14] relative overflow-hidden flex flex-col items-center gap-6"
        >
          <div className="mac-dots absolute top-5 left-5">
            <span className="mac-dot mac-dot-close" />
            <span className="mac-dot mac-dot-min" />
            <span className="mac-dot mac-dot-zoom" />
          </div>

          <div className="optimizely-pill-pink shadow-md">
            <IconSparkle size={14} className="text-[#072419]" />
            <span>THE FUTURE OF HACKATHONS IS HERE</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-display max-w-3xl leading-tight">
            Ready to Build Your{' '}
            <span className="serif-accent text-[#ABFF44] font-normal">
              Next Hackathon?
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto font-sans leading-relaxed font-medium">
            Join hundreds of colleges, communities, and tech companies running chaos-free hackathons with AlmostHack.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <a
              href="#pricing"
              className="optimizely-btn-lime px-8 py-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Start Free Now</span>
              <IconArrowRight size={14} className="text-[#072419]" />
            </a>

            <button
              onClick={onOpenDemoModal}
              className="optimizely-btn-dark px-8 py-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <IconZapFlash size={14} className="text-[#ABFF44] fill-[#ABFF44]" />
              <span>Book 1-on-1 Demo</span>
            </button>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}

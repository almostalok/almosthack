'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

interface FinalCTAProps {
  onOpenDemoModal?: () => void;
}

export function FinalCTA({ onOpenDemoModal }: FinalCTAProps) {
  return (
    <section id="final-cta" className="py-24 relative overflow-hidden bg-background">
      {/* Background Radiating Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="p-12 sm:p-16 rounded-3xl bg-surface border border-accent/40 glass-card shadow-2xl space-y-8 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent font-semibold text-xs">
            <Sparkles className="w-4 h-4" />
            THE FUTURE OF HACKATHONS
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Ready to build your next hackathon?
          </h2>

          <p className="text-muted text-base sm:text-xl max-w-2xl mx-auto font-normal">
            Join hundreds of colleges, communities, and tech companies running chaotic-free hackathons with AlmostHack.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-all shadow-xl shadow-accent/25 flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Free Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface-50 border border-white/15 text-white font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
            >
              <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
              <span>Book 1-on-1 Demo</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

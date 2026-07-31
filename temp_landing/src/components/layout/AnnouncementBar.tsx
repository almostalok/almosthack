'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IconSparkle, IconArrowRight, IconZapFlash } from '@/components/ui/CustomIcons';

export function AnnouncementBar() {
  return (
    <div className="w-full bg-zinc-950/95 border-b border-white/10 py-2.5 px-4 text-xs font-mono text-zinc-300 overflow-hidden relative z-50 select-none backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan/15 text-cyan text-[11px] font-bold tracking-wide border border-cyan/30">
            <IconZapFlash size={12} className="text-cyan fill-cyan" />
            <span>NEW RELEASE v2.4</span>
          </span>
          <span className="hidden sm:inline text-zinc-300 font-sans">
            now powering{' '}
            <span className="font-serif italic text-cyan text-sm font-normal">
              next-generation hackathons
            </span>{' '}
            worldwide.
          </span>
          <span className="sm:hidden text-zinc-300 font-sans">
            powering next-gen hackathons.
          </span>
        </motion.div>

        <a 
          href="#features" 
          className="inline-flex items-center gap-1 text-cyan font-mono font-bold hover:underline transition-all group ml-1"
        >
          <span>Explore OS</span>
          <IconArrowRight size={12} className="text-cyan group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}

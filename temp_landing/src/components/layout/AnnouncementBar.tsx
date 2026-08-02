'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IconArrowRight, IconZapFlash } from '@/components/ui/CustomIcons';

export function AnnouncementBar() {
  return (
    <div className="w-full bg-[#051C14] text-[#F5F8F0] border-b-2 border-[#0D3A29] py-2.5 px-4 text-xs font-mono overflow-hidden relative z-50 select-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-3">
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5"
        >
          <span className="optimizely-pill-pink shadow-sm">
            <IconZapFlash size={11} className="text-[#072419] fill-[#072419] animate-pulse" />
            <span>v2.4 RELEASE</span>
          </span>
          <span className="hidden sm:inline text-slate-200 font-sans text-[13px] font-medium">
            AI to automate, evaluate &amp; optimize every{' '}
            <span className="font-serif italic text-[#ABFF44] text-sm">
              digital hackathon experience
            </span>.
          </span>
          <span className="sm:hidden text-slate-200 font-sans text-xs">
            Hackathon OS v2.4 Released
          </span>
        </motion.div>

        <a 
          href="#features" 
          className="inline-flex items-center gap-1 text-[#ABFF44] text-xs font-mono font-bold hover:text-white transition-colors group"
        >
          <span>Explore OS</span>
          <IconArrowRight size={12} className="text-[#ABFF44] group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}

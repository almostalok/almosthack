'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export function AnnouncementBar() {
  return (
    <div className="w-full bg-[#090D16] border-b border-white/10 py-2 px-4 text-xs font-medium text-white/90 overflow-hidden relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[11px] font-semibold tracking-wide border border-accent/30">
            <Sparkles className="w-3 h-3 animate-pulse" />
            NEW RELEASE v2.4
          </span>
          <span className="hidden sm:inline text-white/70">
            🚀 Now powering next-generation hackathons worldwide.
          </span>
          <span className="sm:hidden text-white/70">
            🚀 Powering next-gen hackathons.
          </span>
        </motion.div>

        <a 
          href="#features" 
          className="inline-flex items-center gap-1 text-accent font-semibold hover:text-white transition-colors group"
        >
          <span>Explore Platform</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { LiveTelemetryDemo } from '../demos/LiveTelemetryDemo';
import { Radio, Activity, Zap, CheckCircle2 } from 'lucide-react';

export const LiveOperationsSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="live-operations"
      className="relative py-20 md:py-28 lg:py-36 bg-[#111311] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Live Operations Telemetry"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] uppercase tracking-wider mb-5"
          >
            <Radio className="w-4 h-4 text-[#03A066] animate-pulse" />
            <span>REAL-TIME LIVE OPERATIONS</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.12]"
          >
            Know what&apos;s happening.
            <br />
            <span className="relative inline-block text-white">
              While it&apos;s happening.
              <Scribble
                variant="underline"
                color="#028051"
                className="absolute -bottom-2 left-0 w-full h-3 text-[#028051]"
              />
            </span>
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-[#A3A3A3] font-body leading-relaxed max-w-2xl"
          >
            During a hackathon, things move fast. AlmostHack moves with them. Monitor builder activity, repository commits, and judge progress in real time without refreshing.
          </motion.p>
        </div>

        {/* Live Telemetry Demo Container */}
        <div className="relative">
          <div
            className="absolute -inset-3 bg-gradient-to-tr from-[#028051]/10 via-transparent to-transparent rounded-[20px] -z-10 border border-[#282C28]/40"
            aria-hidden="true"
          />

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <LiveTelemetryDemo />
          </motion.div>
        </div>

      </div>
    </section>
  );
};

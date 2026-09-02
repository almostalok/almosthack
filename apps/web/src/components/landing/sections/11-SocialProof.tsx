'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { Trophy, Users, GitCommit, Globe2, ShieldCheck } from 'lucide-react';

export const SocialProofSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const proofMetrics = [
    { value: '1,200+', label: 'Hackathon Organizers', sub: 'From university tech clubs to global enterprise challenges', icon: Users },
    { value: '25,000+', label: 'Builders Onboarded', sub: 'Zero duplicate registration submissions recorded', icon: GitCommit },
    { value: '80+', label: 'Countries Represented', sub: 'Distributed double-blind judging across time zones', icon: Globe2 },
    { value: '100%', label: 'Cryptographic Audit Trail', sub: 'Deterministic consensus without spreadsheet formulas', icon: ShieldCheck },
  ];

  return (
    <section
      id="social-proof"
      className="relative py-28 md:py-36 lg:py-48 bg-[#111311] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Platform Social Proof and Outcomes"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Section Header */}
        <div className="max-w-4xl mb-20 md:mb-28">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] uppercase tracking-wider mb-6 font-semibold"
          >
            <Trophy className="w-4 h-4 text-[#03A066]" />
            <span>COMMUNITY & TELEMETRY PROOF</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight text-white leading-[1.08]"
          >
            Loved by organizers.
            <br />
            <span className="relative inline-block text-white">
              Tolerated by hackers.
              <Scribble
                variant="underline"
                color="#028051"
                className="absolute -bottom-3 left-0 w-full h-4 text-[#028051]"
              />
            </span>
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl sm:text-2xl text-[#A3A3A3] font-body leading-relaxed max-w-3xl font-normal"
          >
            Real metrics from hundreds of hackathons hosted across developer communities, university clubs, and open-source ecosystems.
          </motion.p>
        </div>

        {/* 4 Large Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {proofMetrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-8 rounded-[20px] bg-[#161816] border border-[#262A26] hover:border-[#028051]/50 transition-all text-left shadow-sm"
              >
                <div className="w-12 h-12 rounded-[10px] bg-[#1F231F] border border-[#282C28] flex items-center justify-center text-[#03A066] mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-4xl sm:text-5xl font-heading font-extrabold text-white">
                  {m.value}
                </div>
                <div className="text-base font-mono font-bold text-[#EDEDED] mt-2">
                  {m.label}
                </div>
                <p className="text-xs sm:text-sm font-mono text-[#737373] mt-2 leading-relaxed">
                  {m.sub}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

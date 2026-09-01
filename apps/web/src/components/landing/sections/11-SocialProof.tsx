'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import {
  Users,
  ShieldCheck,
  Trophy,
  GitCommit,
  Globe2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const SocialProofSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const proofMetrics = [
    { value: '1,200+', label: 'Hackathon Organizers', sub: 'From university hackathons to global enterprise series', icon: Users },
    { value: '25,000+', label: 'Builders Onboarded', sub: 'Zero duplicate registration submissions recorded', icon: GitCommit },
    { value: '80+', label: 'Countries Represented', sub: 'Global distributed judging across time zones', icon: Globe2 },
    { value: '100%', label: 'Cryptographic Audit Trail', sub: 'Deterministic consensus without spreadsheet formulas', icon: ShieldCheck },
  ];

  const organizerNotes = [
    {
      role: 'Lead Hackathon Director',
      event: 'Global Web3 & AI Hack Series',
      quote: 'We used to lose 4 hours calculating judge variance and arguing about spreadsheet permissions. AlmostHack sealed the leaderboard in 12 seconds.',
      tag: 'Organizer Verified',
    },
    {
      role: 'Technical Operations Lead',
      event: 'University Tech Challenge (1,400 builders)',
      quote: 'Git commit integrity validation eliminated all late submission disputes. The contestants actually trusted the final scoring breakdown.',
      tag: 'Operations Verified',
    },
  ];

  return (
    <section
      id="social-proof"
      className="relative py-20 md:py-28 lg:py-36 bg-[#111311] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Platform Social Proof and Outcomes"
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
            <Trophy className="w-4 h-4 text-[#03A066]" />
            <span>COMMUNITY & TELEMETRY PROOF</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.12]"
          >
            Loved by organizers.
            <br />
            <span className="relative inline-block text-white">
              Tolerated by hackers.
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
            Real metrics from hundreds of hackathons hosted across universities, developer communities, and developer ecosystems.
          </motion.p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {proofMetrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-5 rounded-[12px] bg-[#161816] border border-[#262A26] hover:border-[#028051]/40 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-[7px] bg-[#1F231F] border border-[#282C28] flex items-center justify-center text-[#03A066] mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                  {m.value}
                </div>
                <div className="text-sm font-mono font-bold text-[#EDEDED] mt-1">
                  {m.label}
                </div>
                <p className="text-xs font-mono text-[#737373] mt-1">
                  {m.sub}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* 2 Restrained Verified Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organizerNotes.map((note, idx) => (
            <motion.div
              key={idx}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
              className="p-6 rounded-[14px] bg-[#141614] border border-[#282C28] flex flex-col justify-between text-left"
            >
              <p className="text-sm text-[#EDEDED] font-body leading-relaxed italic">
                &ldquo;{note.quote}&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-[#242824] flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="font-bold text-white block">{note.role}</span>
                  <span className="text-[11px] text-[#737373]">{note.event}</span>
                </div>
                <span className="text-[10px] text-[#03A066] bg-[#028051]/15 px-2 py-0.5 rounded border border-[#028051]/30">
                  {note.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

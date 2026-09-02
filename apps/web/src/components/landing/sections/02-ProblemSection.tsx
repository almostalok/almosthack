'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { Scribble } from '@almosthack/ui';

export const ProblemSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const chaosChain = [
    {
      title: 'Google Forms',
      note: 'Duplicate entries, no live validation',
      iconSrc: '/assets/almosthack/problem/chaos-forms.svg',
    },
    {
      title: 'Google Sheets (v14_final)',
      note: 'Corrupted cell formulas & locked rows',
      iconSrc: '/assets/almosthack/problem/chaos-spreadsheet.svg',
    },
    {
      title: 'Discord DM Hell',
      note: '8 different admins answering submissions',
      iconSrc: '/assets/almosthack/problem/chaos-chat.svg',
    },
    {
      title: 'Drive Folder Archaeology',
      note: 'Broken permission links at 2 AM',
      iconSrc: '/assets/almosthack/problem/chaos-files.svg',
    },
  ];

  const almostHackPillars = [
    { title: 'One Unified Platform', desc: 'From registration to cryptographic leaderboard seal.' },
    { title: 'One Source of Truth', desc: 'Real-time Git commit verification with zero sync latency.' },
    { title: 'Zero Spreadsheet Archaeology', desc: 'Deterministic consensus scoring without spreadsheet formulas.' },
  ];

  return (
    <section
      id="problem"
      className="relative py-28 md:py-36 lg:py-48 bg-[#111311] border-t border-[#222622] text-left overflow-hidden"
      aria-label="The Problem with Traditional Hackathons"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Editorial Section Header */}
        <div className="max-w-4xl mb-20 md:mb-28">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] uppercase tracking-wider mb-6 font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-[#03A066]" />
            <span>THE OLD WAY VS ALMOSTHACK</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight text-white leading-[1.08]"
          >
            Your hackathon has enough
            <br />
            <span className="relative inline-block text-white">
              chaos already.
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
            className="mt-6 text-xl sm:text-2xl text-[#A3A3A3] font-body leading-relaxed max-w-2xl"
          >
            Running a 500-person event shouldn&apos;t require duct-taping five consumer apps together while praying nobody edits cell C42.
          </motion.p>
        </div>

        {/* Visual Storytelling Sequence: The Chaos Journey */}
        <div className="mb-20">
          <div className="text-xs font-mono uppercase tracking-widest text-[#737373] mb-8 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#737373]" />
            <span>The Traditional Hackathon Breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {chaosChain.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-[16px] bg-[#141614] border border-[#262A26] flex flex-col justify-between hover:border-[#3A3F3A] transition-colors"
              >
                <div>
                  <div className="w-12 h-12 rounded-[10px] bg-[#1A1D1A] border border-[#282C28] flex items-center justify-center mb-6">
                    <Image
                      src={item.iconSrc}
                      alt=""
                      width={32}
                      height={32}
                      className="opacity-90"
                    />
                  </div>
                  <h3 className="text-lg font-heading font-extrabold text-[#EDEDED]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#8C908C] font-body mt-2 leading-relaxed">
                    {item.note}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#222622] text-[11px] font-mono text-[#737373]">
                  Step 0{idx + 1} • High friction
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transition Visual Divider */}
        <div className="my-16 flex items-center justify-center gap-4">
          <div className="h-px bg-[#262A26] flex-1" />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#181A18] border border-[#028051]/40 text-xs font-mono text-[#03A066]">
            <span>TRANSITION TO ALMOSTHACK</span>
            <Image src="/assets/almosthack/problem/chaos-arrow.svg" alt="" width={24} height={12} />
          </div>
          <div className="h-px bg-[#262A26] flex-1" />
        </div>

        {/* The AlmostHack OS Standard */}
        <div className="p-8 sm:p-12 lg:p-16 rounded-[20px] bg-gradient-to-b from-[#161B16] to-[#131613] border border-[#028051]/40 shadow-[0_20px_60px_rgba(2,128,81,0.08)]">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono text-[#5EEAD4] bg-[#028051]/20 px-3 py-1 rounded-[6px] border border-[#028051]/40 font-bold uppercase tracking-wider">
              VERIFIED OPERATING SYSTEM
            </span>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white mt-4 leading-tight">
              One platform. One source of truth.
              <br />
              <span className="text-[#5EEAD4]">Zero spreadsheet archaeology.</span>
            </h3>
            <p className="mt-4 text-base sm:text-lg text-[#A3A3A3] font-body leading-relaxed">
              Automate participant onboarding, team rosters, live GitHub commit auditing, double-blind calibrated judging, and instant certificate issuance in a single resilient console.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#028051]/20">
            {almostHackPillars.map((p) => (
              <div key={p.title} className="space-y-2">
                <div className="flex items-center gap-2 text-base font-mono font-bold text-white">
                  <CheckCircle2 className="w-5 h-5 text-[#03A066] shrink-0" />
                  <span>{p.title}</span>
                </div>
                <p className="text-sm text-[#8C908C] font-body leading-relaxed pl-7">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

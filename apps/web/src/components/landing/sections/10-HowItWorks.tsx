'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      num: '01',
      action: 'CREATE',
      title: 'Build your event.',
      description: 'Define tracks, rules, multi-stage timeline milestones, and calibrated evaluation rubrics in a unified setup wizard.',
      items: ['Tracks & Challenges', 'Custom Rules & Guidelines', 'Multi-Stage Timeline', 'Weighted Rubrics'],
      iconSrc: '/assets/almosthack/how-it-works/create.svg',
      mascotText: 'Setting up tracks...',
    },
    {
      num: '02',
      action: 'INVITE',
      title: 'Bring everyone in.',
      description: 'Onboard builders, judges, and partners with frictionless role-based access and automated GitHub & Discord sync.',
      items: ['Verified Hackers', 'Team Formations', 'Judge Allocation', 'Sponsor Challenges'],
      iconSrc: '/assets/almosthack/how-it-works/invite.svg',
      mascotText: 'Welcome builders!',
    },
    {
      num: '03',
      action: 'RUN',
      title: 'Let AlmostHack handle it.',
      description: 'Continuous repository integrity checks, live telemetry, double-blind judging, and automated variance balancing.',
      items: ['Live Registrations', 'Git Commit Auditing', 'Calibrated Scoring', 'Real-Time Ops'],
      iconSrc: '/assets/almosthack/how-it-works/run.svg',
      mascotText: 'Auditing commits...',
    },
    {
      num: '04',
      action: 'CELEBRATE',
      title: 'Finish without the chaos.',
      description: 'Publish verifiable scorecards, unseal transparent leaderboards, and issue instant cryptographic certificates.',
      items: ['Cryptographic Leaderboard', 'Public Score Ledger', 'Verifiable Certificates', 'Post-Event Telemetry'],
      iconSrc: '/assets/almosthack/how-it-works/celebrate.svg',
      mascotText: 'You survived! 🎉',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-32 md:py-44 lg:py-56 bg-[#131413] border-t border-[#222622] text-left overflow-hidden"
      aria-label="How AlmostHack Works"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Section Header */}
        <div className="max-w-4xl mb-24 md:mb-32">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] uppercase tracking-wider mb-6 font-semibold"
          >
            <Sparkles className="w-4 h-4 text-[#03A066]" />
            <span>HOW IT WORKS • 4-STAGE LIFECYCLE</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight text-white leading-[1.08]"
          >
            From &ldquo;let&apos;s run a hackathon&rdquo;
            <br />
            <span className="relative inline-block text-white">
              to &ldquo;holy shit, it actually worked.&rdquo;
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
            Four continuous steps. One resilient platform. Considerably fewer fires.
          </motion.p>
        </div>

        {/* 4-Step Spacious Visual Journey */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 items-stretch relative">
          
          {/* Subtle Connecting Background Line (Desktop) */}
          <div
            className="hidden lg:block absolute top-20 left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#028051]/30 to-transparent -z-10"
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-8 rounded-[20px] bg-[#161816] border border-[#262A26] hover:border-[#028051]/50 transition-all duration-200 flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Step Num + Icon */}
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#242824]">
                  <span className="w-10 h-10 rounded-[10px] bg-[#1F231F] border border-[#282C28] flex items-center justify-center font-mono font-bold text-sm text-[#03A066] group-hover:bg-[#028051] group-hover:text-white transition-colors">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Image src={step.iconSrc} alt="" width={36} height={36} />
                  </div>
                </div>

                <span className="text-xs font-mono font-extrabold text-[#5EEAD4] tracking-widest uppercase block mb-1">
                  {step.action}
                </span>

                <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white mb-3">
                  {step.title}
                </h3>

                <p className="text-sm text-[#8C908C] font-body leading-relaxed mb-8">
                  {step.description}
                </p>

                {/* Sub-item Checklist */}
                <div className="space-y-2 font-mono text-xs text-[#C2C6C2] pt-4 border-t border-[#242824]">
                  {step.items.map((it) => (
                    <div key={it} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#03A066] shrink-0" />
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-10 pt-4 border-t border-[#242824] flex items-center justify-between text-xs font-mono text-[#737373]">
                <span>Automated</span>
                <span className="text-[#03A066] font-semibold">{step.mascotText}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

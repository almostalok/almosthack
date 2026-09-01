'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { MascotRobot } from '../MascotRobot';
import {
  Sparkles,
  UserPlus2,
  Cpu,
  Trophy,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      num: '01',
      action: 'CREATE',
      title: 'Build your event.',
      description: 'Define tracks, rules, multi-stage timeline milestones, and calibrated evaluation rubrics in a unified setup wizard.',
      items: ['Tracks & Challenges', 'Custom Rules & Guidelines', 'Multi-Stage Timeline', 'Weighted Rubrics'],
      mascotState: 'working' as const,
      mascotText: 'Setting up tracks...',
    },
    {
      num: '02',
      action: 'INVITE',
      title: 'Bring everyone in.',
      description: 'Onboard builders, judges, and partners with frictionless role-based access and automated GitHub & Discord sync.',
      items: ['Verified Hackers', 'Team Formations', 'Judge Allocation', 'Sponsor Challenges'],
      mascotState: 'waving' as const,
      mascotText: 'Welcome builders!',
    },
    {
      num: '03',
      action: 'RUN',
      title: 'Let AlmostHack handle it.',
      description: 'Continuous repository integrity checks, live telemetry, double-blind judging, and automated variance balancing.',
      items: ['Live Registrations', 'Git Commit Auditing', 'Calibrated Scoring', 'Real-Time Ops'],
      mascotState: 'judging' as const,
      mascotText: 'Auditing commits...',
    },
    {
      num: '04',
      action: 'CELEBRATE',
      title: 'Finish without the chaos.',
      description: 'Publish verifiable scorecards, unseal transparent leaderboards, and issue instant cryptographic certificates.',
      items: ['Cryptographic Leaderboard', 'Public Score Ledger', 'Verifiable Certificates', 'Post-Event Telemetry'],
      mascotState: 'celebrating' as const,
      mascotText: 'You survived! 🎉',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-24 md:py-36 lg:py-44 bg-[#131413] border-t border-[#222622] text-left overflow-hidden"
      aria-label="How AlmostHack Works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-20 md:mb-28">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] uppercase tracking-wider mb-5"
          >
            <Sparkles className="w-4 h-4 text-[#03A066]" />
            <span>HOW IT WORKS • 4-STAGE LIFECYCLE</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.12]"
          >
            From &ldquo;let&apos;s run a hackathon&rdquo;
            <br />
            <span className="relative inline-block text-white">
              to &ldquo;holy shit, it actually worked.&rdquo;
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
            Four continuous steps. One resilient platform. Considerably fewer fires.
          </motion.p>
        </div>

        {/* 4-Step Spacious Visual Journey */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-6 sm:p-7 rounded-[16px] bg-[#161816] border border-[#262A26] hover:border-[#028051]/50 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Step Num + Action */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#242824]">
                  <span className="w-8 h-8 rounded-[7px] bg-[#1F231F] border border-[#282C28] flex items-center justify-center font-mono font-bold text-xs text-[#03A066] group-hover:bg-[#028051] group-hover:text-white transition-colors">
                    {step.num}
                  </span>
                  <span className="text-xs font-mono font-extrabold text-[#5EEAD4] tracking-wider uppercase">
                    {step.action}
                  </span>
                </div>

                <h3 className="text-lg font-heading font-extrabold text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-xs text-[#8C908C] font-body leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Sub-item Checklist */}
                <div className="space-y-1.5 font-mono text-xs text-[#C2C6C2] pt-2 border-t border-[#242824]">
                  {step.items.map((it) => (
                    <div key={it} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#03A066] shrink-0" />
                      <span className="text-[11px]">{it}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Mascot Indicator */}
              <div className="mt-8 pt-4 border-t border-[#242824] flex items-center justify-between text-xs font-mono text-[#737373]">
                <span>Status: Automated</span>
                <span className="text-[#03A066] font-semibold">{step.mascotText}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

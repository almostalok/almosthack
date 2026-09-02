'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { MascotRobot } from '../MascotRobot';
import { JudgeScoringDemo } from '../demos/JudgeScoringDemo';
import { Gavel, ShieldCheck, CheckCircle2, Scale } from 'lucide-react';

export const JudgeExperienceSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const judgeHighlights = [
    {
      title: 'Context Without Clutter',
      desc: 'Judges see project specs, live demos, and verified GitHub commits in one distraction-free interface.',
      iconSrc: '/assets/almosthack/judge/judge-rubric.svg',
    },
    {
      title: 'Double-Blind Anonymization',
      desc: 'Eliminate bias with automatic team name masking and blinded score submissions.',
      iconSrc: '/assets/almosthack/judge/judge-scorecard.svg',
    },
    {
      title: 'Automated Score Normalization',
      desc: 'Our statistical consensus algorithm automatically balances harsh and lenient scorers.',
      iconSrc: '/assets/almosthack/judge/judge-feedback.svg',
    },
  ];

  return (
    <section
      id="judges"
      className="relative py-28 md:py-36 lg:py-48 bg-[#131413] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Judge Experience"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Section Header */}
        <div className="max-w-4xl mb-16 md:mb-24">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] uppercase tracking-wider mb-6 font-semibold"
          >
            <Gavel className="w-4 h-4 text-[#03A066]" />
            <span>FOR JUDGES & EVALUATORS</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight text-white leading-[1.08]"
          >
            Judge the work.
            <br />
            <span className="relative inline-block text-white">
              Not the spreadsheet.
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
            Give every judge the same rubric, the right context, and a focused place to score without navigating complex spreadsheet permissions.
          </motion.p>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT: Highlights & Live Status */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Progress Card */}
            <div className="p-6 rounded-[16px] bg-[#161816] border border-[#282C28] space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                <span className="text-[#8C908C]">Active Judging Panel:</span>
                <span className="text-[#03A066] font-bold">24 Judges Active</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                <span className="text-[#8C908C]">Review Progress:</span>
                <span className="text-white font-bold">72% (14 reviews remaining)</span>
              </div>
              <div className="w-full h-2.5 bg-[#1F231F] rounded-full overflow-hidden border border-[#282C28] p-0.5">
                <div className="h-full rounded-full bg-gradient-to-r from-[#028051] to-[#03A066] w-[72%]" />
              </div>
            </div>

            {/* Benefit Items */}
            <div className="space-y-3.5">
              {judgeHighlights.map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-[12px] bg-[#161816] border border-[#242824] flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-[#1F231F] border border-[#282C28] flex items-center justify-center shrink-0 mt-0.5">
                    <Image src={item.iconSrc} alt="" width={24} height={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-heading font-bold text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#8C908C] font-body mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Large Interactive Scoring Demo + Mascot */}
          <div className="lg:col-span-7 relative z-10">
            {/* Mascot Robot positioned with humorous note */}
            <div className="absolute -top-14 sm:-top-16 right-4 sm:right-6 z-30 pointer-events-auto">
              <MascotRobot
                variant="judging"
                speechText={"Please don't\ngive everyone 100."}
              />
            </div>

            {/* Decorative Grid Frame */}
            <div
              className="absolute -inset-4 bg-gradient-to-br from-[#028051]/15 via-transparent to-transparent rounded-[24px] -z-10 border border-[#282C28]/50"
              aria-hidden="true"
            />

            <JudgeScoringDemo />
          </div>

        </div>

      </div>
    </section>
  );
};

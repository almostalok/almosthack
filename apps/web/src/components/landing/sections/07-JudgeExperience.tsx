'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { MascotRobot } from '../MascotRobot';
import { JudgeScoringDemo } from '../demos/JudgeScoringDemo';
import {
  Gavel,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';

export const JudgeExperienceSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const judgeHighlights = [
    {
      title: 'Context Without Clutter',
      desc: 'Judges see project specs, live demos, and verified GitHub commits in one distraction-free interface.',
      icon: Scale,
    },
    {
      title: 'Double-Blind Anonymization',
      desc: 'Eliminate bias with automatic team name masking and blinded score submissions.',
      icon: ShieldCheck,
    },
    {
      title: 'Automated Score Normalization',
      desc: 'Our statistical consensus algorithm automatically balances harsh and lenient scorers.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section
      id="judges"
      className="relative py-20 md:py-28 lg:py-36 bg-[#131413] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Judge Experience"
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
            <Gavel className="w-4 h-4 text-[#03A066]" />
            <span>FOR JUDGES & EVALUATORS</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.12]"
          >
            Judge the work.
            <br />
            <span className="relative inline-block text-white">
              Not the spreadsheet.
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
            Give every judge the same rubric, the right context, and a focused place to score without navigating complex spreadsheet permissions.
          </motion.p>
        </div>

        {/* 2-Column Split: Key Highlights on Left, Interactive Scoring Demo on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* LEFT: Highlights & Live Status */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Progress Card */}
            <div className="p-4 rounded-[12px] bg-[#161816] border border-[#282C28] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8C908C]">Active Judging Panel:</span>
                <span className="text-[#03A066] font-bold">24 Judges Active</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8C908C]">Review Progress:</span>
                <span className="text-white font-bold">72% Complete (14 reviews remaining)</span>
              </div>
              <div className="w-full h-2 bg-[#1F231F] rounded-full overflow-hidden border border-[#282C28] p-0.5">
                <div className="h-full rounded-full bg-gradient-to-r from-[#028051] to-[#03A066] w-[72%]" />
              </div>
            </div>

            {/* Benefit Items */}
            <div className="space-y-2.5 pt-2">
              {judgeHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-3.5 rounded-[10px] bg-[#161816] border border-[#242824] flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-[7px] bg-[#1F231F] border border-[#282C28] flex items-center justify-center text-[#03A066] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-heading font-bold text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#8C908C] font-body mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Interactive Judge Scoring Demo + Mascot */}
          <div className="lg:col-span-7 relative z-10">
            {/* Mascot Robot positioned with humorous note */}
            <div className="absolute -top-12 sm:-top-14 right-4 sm:right-6 z-30 pointer-events-auto">
              <MascotRobot
                variant="judging"
                speechText={"Please don't\ngive everyone 100."}
              />
            </div>

            {/* Decorative Grid Frame */}
            <div
              className="absolute -inset-3 bg-gradient-to-br from-[#028051]/10 via-transparent to-transparent rounded-[20px] -z-10 border border-[#282C28]/40"
              aria-hidden="true"
            />

            <JudgeScoringDemo />
          </div>

        </div>

      </div>
    </section>
  );
};

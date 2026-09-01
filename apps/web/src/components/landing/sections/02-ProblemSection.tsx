'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import {
  FileSpreadsheet,
  AlertTriangle,
  Mail,
  FolderSync,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const oldChaosItems = [
    { title: 'Google Forms', desc: 'Broken schema, duplicate submissions, zero live validation.', icon: FileSpreadsheet },
    { title: 'Google Sheets (v14_final_FINAL)', desc: '12 tabs, corrupted formulas, someone accidentally deleted row 84.', icon: AlertTriangle },
    { title: 'Discord DM Chaos', desc: '"Hey, where do I submit?" sent to 8 different volunteer admins.', icon: Mail },
    { title: 'Fragmented Drive Folders', desc: 'Videos in Loom, slides in Canva, repos missing permissions.', icon: FolderSync },
    { title: '"WHO HAS THE FINAL SCORES?"', desc: 'Panicked 2 AM calculations before closing ceremony.', icon: HelpCircle },
  ];

  const almostHackSolution = [
    { title: 'One Unified Platform', desc: 'From registration to cryptographic leaderboard seal.' },
    { title: 'One Source of Truth', desc: 'Real-time Git verification, zero sync latency.' },
    { title: 'Zero Spreadsheet Archaeology', desc: 'Deterministic consensus scoring without spreadsheet formulas.' },
  ];

  return (
    <section
      id="problem"
      className="relative py-20 md:py-28 lg:py-36 bg-[#111311] border-t border-[#222622] text-left overflow-hidden"
      aria-label="The Problem with Traditional Hackathons"
    >
      {/* Subtle ambient accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#028051]/5 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

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
            <span className="w-2 h-2 rounded-full bg-[#03A066]" />
            <span>THE OLD WAY VS ALMOSTHACK</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.12]"
          >
            Your hackathon has enough chaos already.
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-[#A3A3A3] font-body leading-relaxed max-w-2xl"
          >
            Running a 500-person event shouldn&apos;t require duct-taping five consumer apps together while praying nobody edits cell C42.
          </motion.p>
        </div>

        {/* Dual Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* LEFT: The Chaos (Old Stack) */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 p-6 sm:p-8 rounded-[16px] bg-[#141614] border border-[#282C28] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242824]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#3A3F3A]" />
                  <span className="font-mono text-xs text-[#8C908C] uppercase tracking-wider font-bold">
                    Traditional Hackathon Stack
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#8C908C] bg-[#1F231F] px-2 py-0.5 rounded border border-[#282C28]">
                  FRAGILE
                </span>
              </div>

              <div className="space-y-3">
                {oldChaosItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="p-3 rounded-[10px] bg-[#181A18] border border-[#262A26] flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-[6px] bg-[#202420] border border-[#2C302C] flex items-center justify-center text-[#8C908C] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-mono font-semibold text-[#EDEDED]">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#737373] font-body mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#242824] text-xs font-mono text-[#737373]">
              Result: 14 open tabs, 3 lost submissions, organizer sleep deficit.
            </div>
          </motion.div>

          {/* RIGHT: The AlmostHack Standard */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-6 p-6 sm:p-8 rounded-[16px] bg-gradient-to-b from-[#161A16] to-[#131613] border border-[#028051]/40 flex flex-col justify-between relative shadow-[0_12px_40px_rgba(2,128,81,0.08)]"
          >
            {/* Top Badge */}
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#028051]/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#03A066] animate-pulse" />
                  <span className="font-mono text-xs text-[#03A066] uppercase tracking-wider font-bold">
                    AlmostHack Operating System
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#5EEAD4] bg-[#028051]/20 px-2 py-0.5 rounded border border-[#028051]/40 font-bold">
                  VERIFIED OS
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-[12px] bg-[#171B17] border border-[#028051]/30">
                  <h3 className="text-lg font-heading font-extrabold text-white">
                    One platform.
                    <br />
                    One source of truth.
                    <br />
                    <span className="text-[#5EEAD4]">Zero spreadsheet archaeology.</span>
                  </h3>
                  <p className="text-xs text-[#A3A3A3] font-body mt-2 leading-relaxed">
                    Automate participant onboarding, team formation, live GitHub commit auditing, double-blind calibrated judging, and instant certificate issuance in a single resilient console.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {almostHackSolution.map((sol) => (
                    <div
                      key={sol.title}
                      className="flex items-start gap-3 p-3 rounded-[10px] bg-[#161A16] border border-[#242A24]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#03A066] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-mono font-bold text-white">{sol.title}</div>
                        <div className="text-xs text-[#8C908C] font-body mt-0.5">{sol.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#028051]/20 flex items-center justify-between text-xs font-mono text-[#03A066]">
              <span>Predictable. Explainable. Auditable.</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

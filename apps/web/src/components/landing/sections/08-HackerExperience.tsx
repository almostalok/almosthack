'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { MascotRobot } from '../MascotRobot';
import { HackerDashboardDemo } from '../demos/HackerDashboardDemo';
import { Code2, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@almosthack/utils';

export const HackerExperienceSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedHackerFeature, setSelectedHackerFeature] = useState(0);

  const hackerFeatures = [
    {
      num: '01',
      title: 'Frictionless Registration',
      description: 'One-click GitHub & Discord identity auth without repetitive form questionnaires.',
      iconSrc: '/assets/almosthack/hacker/hacker-build.svg',
      tabTarget: 'overview' as const,
    },
    {
      num: '02',
      title: 'Squad Formation & Matchmaking',
      description: 'Find teammates by skillset (frontend, smart contracts, ML) or invite with unique invite links.',
      iconSrc: '/assets/almosthack/hacker/hacker-team.svg',
      tabTarget: 'overview' as const,
    },
    {
      num: '03',
      title: 'Continuous Git Integrity Sync',
      description: 'Connect your public or private GitHub repository for automatic commit timeline tracking.',
      iconSrc: '/assets/almosthack/hacker/hacker-submit.svg',
      tabTarget: 'submission' as const,
    },
    {
      num: '04',
      title: 'Multi-Track Submission Builder',
      description: 'Submit demo links, pitch videos, and architecture diagrams into sponsor bounty tracks.',
      iconSrc: '/assets/almosthack/hacker/hacker-submit.svg',
      tabTarget: 'submission' as const,
    },
    {
      num: '05',
      title: 'Zero-Dispute Deadline Freeze',
      description: 'Cryptographic commit hashing prevents unfair post-deadline pushes and disqualification disputes.',
      iconSrc: '/assets/almosthack/hacker/hacker-deadline.svg',
      tabTarget: 'submission' as const,
    },
    {
      num: '06',
      title: 'Live Evaluation Status Tracker',
      description: 'See exactly when judges are reviewing your project without waiting in the dark.',
      iconSrc: '/assets/almosthack/judge/judge-scorecard.svg',
      tabTarget: 'judging' as const,
    },
    {
      num: '07',
      title: 'Double-Blind Anonymized Evaluation',
      description: 'Compete on code and execution merit alone without fear of prestige or university bias.',
      iconSrc: '/assets/almosthack/transparent/fairness-check.svg',
      tabTarget: 'judging' as const,
    },
    {
      num: '08',
      title: 'Explainable Score Breakdown',
      description: 'Inspect full rubric criteria feedback, judge notes, and normalized score percentiles.',
      iconSrc: '/assets/almosthack/transparent/score-normalization.svg',
      tabTarget: 'results' as const,
    },
    {
      num: '09',
      title: 'Public Cryptographic Leaderboard',
      description: 'Immutable final standings with tamper-proof blockchain and ledger verification hashes.',
      iconSrc: '/assets/almosthack/hacker/hacker-results.svg',
      tabTarget: 'results' as const,
    },
    {
      num: '10',
      title: 'Verifiable Digital Credentials',
      description: 'One-click cryptographic certificate claim for your GitHub profile and resume.',
      iconSrc: '/assets/almosthack/organizer/organizer-results.svg',
      tabTarget: 'results' as const,
    },
  ];

  return (
    <section
      id="hackers"
      className="relative py-28 md:py-36 lg:py-48 bg-[#111311] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Hacker and Contestant Experience"
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
            <Code2 className="w-4 h-4 text-[#03A066]" />
            <span>FOR HACKERS & CONTESTANTS</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight text-white leading-[1.08]"
          >
            They came to build.
            <br />
            <span className="relative inline-block text-white">
              Let them build.
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
            Less admin. More shipping. Registration, team formation, GitHub commit tracking, and transparent scoring that treats builders with respect.
          </motion.p>
        </div>

        {/* 2-Column Interactive Hacker Experience (Left 10-Item Nav -> Right Hacker Portal Demo) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT: 10-Item Hacker Feature Matrix */}
          <div className="lg:col-span-6 space-y-2.5">
            {hackerFeatures.map((feat, idx) => {
              const isSelected = selectedHackerFeature === idx;
              return (
                <button
                  key={feat.num}
                  type="button"
                  onClick={() => setSelectedHackerFeature(idx)}
                  onMouseEnter={() => setSelectedHackerFeature(idx)}
                  onFocus={() => setSelectedHackerFeature(idx)}
                  className={cn(
                    'w-full p-4 rounded-[12px] border transition-all text-left flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer',
                    isSelected
                      ? 'bg-[#181D18] border-[#028051] shadow-sm'
                      : 'bg-[#141614] border-[#242824] hover:bg-[#1A1D1A] hover:border-[#2C302C]'
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-[8px] border flex items-center justify-center font-mono text-xs font-bold shrink-0',
                      isSelected
                        ? 'bg-[#028051] text-white border-[#03A066]'
                        : 'bg-[#1E221E] text-[#8C908C] border-[#282C28]'
                    )}
                  >
                    {feat.num}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className={cn(
                          'text-base font-heading font-bold',
                          isSelected ? 'text-white' : 'text-[#EDEDED]'
                        )}
                      >
                        {feat.title}
                      </h3>
                      {isSelected ? (
                        <span className="text-xs font-mono text-[#03A066] font-bold">
                          ACTIVE →
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-[#4A4E4A]" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#8C908C] font-body mt-1 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Large Interactive Contestant Portal Demo + Mascot */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 relative">
            {/* Mascot Robot positioned with builder note */}
            <div className="absolute -top-14 sm:-top-16 right-4 sm:right-6 z-30 pointer-events-auto">
              <MascotRobot
                variant="working"
                speechText={"Ship code.\nWe'll handle the rest."}
              />
            </div>

            {/* Decorative Grid Frame */}
            <div
              className="absolute -inset-4 bg-gradient-to-tl from-[#028051]/15 via-transparent to-transparent rounded-[24px] -z-10 border border-[#282C28]/50"
              aria-hidden="true"
            />

            <HackerDashboardDemo
              initialTab={hackerFeatures[selectedHackerFeature].tabTarget}
            />
          </div>

        </div>

      </div>
    </section>
  );
};

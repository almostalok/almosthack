'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@almosthack/utils';

export const OrganizerExperienceSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      id: 'setup',
      name: 'SETUP',
      title: 'Event Architecture & Rubrics',
      description: 'Configure tracks, multi-stage submission deadlines, prize pools, and weighted scoring criteria in minutes.',
      iconSrc: '/assets/almosthack/organizer/organizer-setup.svg',
      metric: '4 Tracks Configured',
      tag: 'Step 01',
      detailSnippet: 'schema: v2.1 • tracks: [ai, security, health, blockchain]',
    },
    {
      id: 'registration',
      name: 'REGISTRATION',
      title: 'Builder Verification Stream',
      description: 'Role-based access, automated GitHub verification, and instant Discord webhook sync without form scraping.',
      iconSrc: '/assets/almosthack/organizer/organizer-setup.svg',
      metric: '847 Verified Builders',
      tag: 'Step 02',
      detailSnippet: 'auth: session_verified • rate_limit: 0 violations',
    },
    {
      id: 'teams',
      name: 'TEAMS',
      title: 'Dynamic Roster & Matchmaking',
      description: 'Real-time squad formation, capacity controls (up to 4 builders/team), and captain credential management.',
      iconSrc: '/assets/almosthack/organizer/organizer-teams.svg',
      metric: '132 Teams Ready',
      tag: 'Step 03',
      detailSnippet: 'roster_sync: 100% • locked_captains: 132/132',
    },
    {
      id: 'submissions',
      name: 'SUBMISSIONS',
      title: 'Continuous Git Integrity Auditing',
      description: 'Automated commit hashing, repository snapshotting, and demo endpoint validation with zero late submission disputes.',
      iconSrc: '/assets/almosthack/organizer/organizer-submissions.svg',
      metric: '76 Repos Synced',
      tag: 'Step 04',
      detailSnippet: 'sha256_audit: verified • git_tree: immutable',
    },
    {
      id: 'judging',
      name: 'JUDGING',
      title: 'Double-Blind Calibrated Scoring',
      description: 'Zero-bias consensus calculation, outlier normalization, and reviewer workload distribution.',
      iconSrc: '/assets/almosthack/organizer/organizer-judging.svg',
      metric: '24 Judges Active (72%)',
      tag: 'Step 05',
      detailSnippet: 'normalization: bayesian • variance: 0.4',
    },
    {
      id: 'results',
      name: 'RESULTS',
      title: 'Cryptographic Leaderboard Seal',
      description: 'Publish verifiable scorecards, transparent rank audit trails, and automated vector certificates.',
      iconSrc: '/assets/almosthack/organizer/organizer-results.svg',
      metric: 'Instant Mainnet Proof',
      tag: 'Step 06',
      detailSnippet: 'ledger_seal: 0x4a9b...77e2 • status: published',
    },
  ];

  return (
    <section
      id="organizer-experience"
      className="relative py-28 md:py-36 lg:py-48 bg-[#131413] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Organizer Command Center Experience"
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
            <span className="w-2 h-2 rounded-full bg-[#03A066]" />
            <span>ORGANIZER COMMAND CENTER</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight text-white leading-[1.08]"
          >
            Everything you need.
            <br />
            <span className="relative inline-block text-white">
              Nothing you need to duct-tape together.
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
            One unified lifecycle engine orchestrating setup, registration, team rosters, repository commit verification, calibrated judging, and final results.
          </motion.p>
        </div>

        {/* 6-Step Interactive Lifecycle Strip */}
        <div className="mb-12 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-3 min-w-[840px]">
            {workflowSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    'flex-1 flex items-center gap-3 p-4 rounded-[12px] border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer',
                    isActive
                      ? 'bg-[#028051] border-[#03A066] text-white shadow-md'
                      : 'bg-[#161816] border-[#262A26] text-[#8C908C] hover:bg-[#1A1D1A] hover:text-[#EDEDED]'
                  )}
                >
                  <Image
                    src={step.iconSrc}
                    alt=""
                    width={24}
                    height={24}
                    className={cn('shrink-0', isActive ? 'brightness-200' : 'opacity-70')}
                  />
                  <div>
                    <span className={cn('text-[11px] font-mono block font-bold', isActive ? 'text-[#5EEAD4]' : 'text-[#737373]')}>
                      {step.tag}
                    </span>
                    <span className="text-sm font-mono font-bold tracking-wide">{step.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Large Product Showcase */}
        <motion.div
          key={activeStep}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8 sm:p-12 lg:p-14 rounded-[20px] bg-[#161816] border border-[#282C28] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Step Detail Info */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono text-[#03A066] uppercase tracking-wider font-bold bg-[#028051]/15 px-3 py-1 rounded-[6px] border border-[#028051]/30">
                {workflowSteps[activeStep].tag} • {workflowSteps[activeStep].name}
              </span>
              
              <h3 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                {workflowSteps[activeStep].title}
              </h3>
              
              <p className="text-base sm:text-lg text-[#A3A3A3] font-body leading-relaxed">
                {workflowSteps[activeStep].description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <span className="px-4 py-2 rounded-[10px] bg-[#1A1D1A] border border-[#282C28] text-sm font-mono font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#03A066]" />
                  {workflowSteps[activeStep].metric}
                </span>
                <span className="text-xs font-mono text-[#737373]">
                  Workflow State: Automated
                </span>
              </div>
            </div>

            {/* Simulated Live Console Pane */}
            <div className="lg:col-span-6 p-6 rounded-[14px] bg-[#131413] border border-[#282C28] font-mono text-xs text-left shadow-inner">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#242824]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#03A066] animate-pulse" />
                  <span className="text-xs text-[#EDEDED] font-bold">almosthack/organizer-engine</span>
                </div>
                <span className="text-[11px] text-[#737373] bg-[#1A1D1A] px-2.5 py-1 rounded border border-[#282C28]">
                  STAGE {activeStep + 1} OF 6
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-[8px] bg-[#181B18] border border-[#262A26] flex items-center justify-between">
                  <span className="text-[#8C908C]">Workflow Protocol:</span>
                  <span className="text-[#5EEAD4] font-bold">{workflowSteps[activeStep].name}</span>
                </div>
                <div className="p-3 rounded-[8px] bg-[#181B18] border border-[#262A26] flex items-center justify-between">
                  <span className="text-[#8C908C]">Telemetry Active:</span>
                  <span className="text-[#03A066] font-bold">100% Deterministic</span>
                </div>
                <div className="p-3 rounded-[8px] bg-[#181B18] border border-[#262A26] flex items-center justify-between">
                  <span className="text-[#8C908C]">System Payload:</span>
                  <span className="text-[#C2C6C2] truncate max-w-[200px] sm:max-w-xs">{workflowSteps[activeStep].detailSnippet}</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import {
  SlidersHorizontal,
  UserPlus,
  Users2,
  FileCode,
  Gavel,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
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
      icon: SlidersHorizontal,
      metric: '4 Tracks Configured',
      tag: 'Step 01',
    },
    {
      id: 'registration',
      name: 'REGISTRATION',
      title: 'Builder Verification Stream',
      description: 'Role-based access, automated GitHub verification, and instant Discord webhook sync without form scraping.',
      icon: UserPlus,
      metric: '847 Verified Builders',
      tag: 'Step 02',
    },
    {
      id: 'teams',
      name: 'TEAMS',
      title: 'Dynamic Roster & Matchmaking',
      description: 'Real-time squad formation, capacity controls (up to 4 builders/team), and captain credential management.',
      icon: Users2,
      metric: '132 Teams Ready',
      tag: 'Step 03',
    },
    {
      id: 'submissions',
      name: 'SUBMISSIONS',
      title: 'Continuous Git Integrity Auditing',
      description: 'Automated commit hashing, repository snapshotting, and demo endpoint validation with zero late submission disputes.',
      icon: FileCode,
      metric: '76 Repos Synced',
      tag: 'Step 04',
    },
    {
      id: 'judging',
      name: 'JUDGING',
      title: 'Double-Blind Calibrated Scoring',
      description: 'Zero-bias consensus calculation, outlier normalization, and reviewer workload distribution.',
      icon: Gavel,
      metric: '24 Judges Active (72%)',
      tag: 'Step 05',
    },
    {
      id: 'results',
      name: 'RESULTS',
      title: 'Cryptographic Leaderboard Seal',
      description: 'Publish verifiable scorecards, transparent rank audit trails, and automated vector certificates.',
      icon: Trophy,
      metric: 'Instant Mainnet Proof',
      tag: 'Step 06',
    },
  ];

  return (
    <section
      id="organizer-experience"
      className="relative py-20 md:py-28 lg:py-36 bg-[#131413] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Organizer Command Center Experience"
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
            <span className="w-2 h-2 rounded-full bg-[#03A066]" />
            <span>ORGANIZER COMMAND CENTER</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.12]"
          >
            Everything you need.
            <br />
            <span className="relative inline-block text-white">
              Nothing you need to duct-tape together.
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
            One unified lifecycle engine orchestrating setup, registration, team rosters, repository commit verification, calibrated judging, and final results.
          </motion.p>
        </div>

        {/* Interactive Step Timeline Bar */}
        <div className="mb-10 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-2 min-w-[720px]">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    'flex-1 flex items-center justify-between p-3 rounded-[10px] border transition-all text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#028051] cursor-pointer',
                    isActive
                      ? 'bg-[#028051] border-[#03A066] text-white shadow-sm'
                      : 'bg-[#161816] border-[#242824] text-[#8C908C] hover:bg-[#1A1D1A] hover:text-[#EDEDED]'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-[#737373]')} />
                    <div>
                      <span className={cn('text-[10px] font-mono block', isActive ? 'text-[#5EEAD4]' : 'text-[#737373]')}>
                        {step.tag}
                      </span>
                      <span className="text-xs font-mono font-bold">{step.name}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Product UI Fragment Box */}
        <motion.div
          key={activeStep}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-8 rounded-[16px] bg-[#161816] border border-[#282C28] shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Step Detail Copy */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono text-[#03A066] uppercase tracking-wider font-semibold bg-[#028051]/15 px-2.5 py-1 rounded border border-[#028051]/30">
                {workflowSteps[activeStep].tag} • {workflowSteps[activeStep].name}
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                {workflowSteps[activeStep].title}
              </h3>
              <p className="text-sm sm:text-base text-[#A3A3A3] font-body leading-relaxed">
                {workflowSteps[activeStep].description}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#03A066]" />
                  {workflowSteps[activeStep].metric}
                </span>
                <span className="text-xs font-mono text-[#737373]">
                  Status: Automated
                </span>
              </div>
            </div>

            {/* Simulated Live Console Pane */}
            <div className="lg:col-span-6 p-4 rounded-[12px] bg-[#131413] border border-[#282C28] font-mono text-xs text-left">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242824]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
                  <span className="text-[11px] text-[#A3A3A3]">almosthack/core-v1.4</span>
                </div>
                <span className="text-[10px] text-[#737373] bg-[#1A1D1A] px-2 py-0.5 rounded">
                  STAGE {activeStep + 1} OF 6
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2 rounded bg-[#1A1D1A] border border-[#262A26] flex items-center justify-between">
                  <span className="text-[#8C908C]">Workflow Protocol:</span>
                  <span className="text-[#5EEAD4] font-semibold">{workflowSteps[activeStep].name}</span>
                </div>
                <div className="p-2 rounded bg-[#1A1D1A] border border-[#262A26] flex items-center justify-between">
                  <span className="text-[#8C908C]">Telemetry Active:</span>
                  <span className="text-[#03A066] font-semibold">100% Deterministic</span>
                </div>
                <div className="p-2 rounded bg-[#1A1D1A] border border-[#262A26] flex items-center justify-between">
                  <span className="text-[#8C908C]">Manual Spreadsheet Edits:</span>
                  <span className="text-[#EDEDED] font-semibold">0 Required</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

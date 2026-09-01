'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import {
  Sliders,
  UserCheck,
  Users,
  FileCheck2,
  Gavel,
  ShieldCheck,
  Radio,
  Trophy,
  Award,
  History,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@almosthack/utils';

export const OrganizerFeaturesSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      num: '01',
      title: 'Hackathon setup',
      description: 'Create tracks, timelines and rules.',
      detail: 'Configure multi-track challenges, prize pool distributions, and strict cut-off milestones with a single configuration payload.',
      icon: Sliders,
    },
    {
      num: '02',
      title: 'Registration management',
      description: 'Manage participants without spreadsheet archaeology.',
      detail: 'Auto-verify builder profiles, review applicant questionnaires, and manage acceptance quotas in real time.',
      icon: UserCheck,
    },
    {
      num: '03',
      title: 'Team management',
      description: 'Create, approve and organize teams.',
      detail: 'Dynamic team formation tools, captain management, and automated discord role provisioning.',
      icon: Users,
    },
    {
      num: '04',
      title: 'Submission management',
      description: 'Track every submission in one place.',
      detail: 'Continuous Git commit verification, repository integrity checks, and preview deployment audits.',
      icon: FileCheck2,
    },
    {
      num: '05',
      title: 'Judge management',
      description: 'Assign judges, rubrics and evaluation workflows.',
      detail: 'Intelligent conflict-of-interest detection and balanced review workload distribution across judge panels.',
      icon: Gavel,
    },
    {
      num: '06',
      title: 'Transparent judging',
      description: 'Make every score explainable.',
      detail: 'Double-blind scoring with automatic variance normalization so every winner is statistically proven.',
      icon: ShieldCheck,
    },
    {
      num: '07',
      title: 'Live operations',
      description: 'See what is happening while it happens.',
      detail: 'Real-time telemetry stream of registrations, commit pushes, review completions, and broadcast announcements.',
      icon: Radio,
    },
    {
      num: '08',
      title: 'Results & rankings',
      description: 'Publish results without spreadsheet gymnastics.',
      detail: 'One-click leaderboard unseal with automated cryptographic hash verifications and public ledger access.',
      icon: Trophy,
    },
    {
      num: '09',
      title: 'Certificates',
      description: 'Generate participant and winner certificates.',
      detail: 'Automated cryptographic certificate generation with verifiable signatures for all contestants.',
      icon: Award,
    },
    {
      num: '10',
      title: 'Audit trail',
      description: 'Know what changed, when and by whom.',
      detail: 'Immutable event log tracking all organizer actions, score updates, and system overrides.',
      icon: History,
    },
  ];

  return (
    <section
      id="features"
      className="relative py-20 md:py-28 lg:py-36 bg-[#111311] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Organizer Features Matrix"
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
            <span>FOR ORGANIZERS</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.12]"
          >
            Built for the organizers in the arena.
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-[#A3A3A3] font-body leading-relaxed max-w-2xl"
          >
            Ten mission-critical primitives designed to replace brittle workflows with automated, explainable software.
          </motion.p>
        </div>

        {/* Feature Matrix + Interactive Spotlight Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* LEFT: Complete 10 Feature List (Mandatory & explicitly readable) */}
          <div className="lg:col-span-6 space-y-2">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              const isSelected = selectedFeature === idx;
              return (
                <button
                  key={feat.num}
                  type="button"
                  onClick={() => setSelectedFeature(idx)}
                  className={cn(
                    'w-full p-3.5 rounded-[10px] border transition-all text-left flex items-start gap-3.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#028051] cursor-pointer',
                    isSelected
                      ? 'bg-[#181D18] border-[#028051]/60 shadow-xs'
                      : 'bg-[#141614] border-[#242824] hover:bg-[#1A1D1A] hover:border-[#2C302C]'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-[7px] border flex items-center justify-center font-mono text-[11px] font-bold shrink-0',
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
                          'text-sm font-heading font-bold',
                          isSelected ? 'text-white' : 'text-[#EDEDED]'
                        )}
                      >
                        {feat.title}
                      </h3>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-[#03A066] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8C908C] font-body mt-0.5 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Live Visual Spotlight of Selected Feature */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="p-6 sm:p-8 rounded-[16px] bg-[#161816] border border-[#282C28] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242824]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#03A066] animate-pulse" />
                  <span className="font-mono text-xs text-[#A3A3A3] uppercase tracking-wider">
                    Feature Deep Dive
                  </span>
                </div>
                <span className="text-xs font-mono text-[#5EEAD4] bg-[#028051]/20 px-2.5 py-0.5 rounded border border-[#028051]/40 font-bold">
                  {features[selectedFeature].num} / 10
                </span>
              </div>

              <div className="space-y-4 text-left">
                <div className="w-12 h-12 rounded-[10px] bg-[#028051]/15 border border-[#028051]/40 flex items-center justify-center text-[#03A066]">
                  {React.createElement(features[selectedFeature].icon, { className: 'w-6 h-6' })}
                </div>

                <h4 className="text-2xl font-heading font-extrabold text-white">
                  {features[selectedFeature].title}
                </h4>

                <p className="text-sm text-[#C2C6C2] font-body leading-relaxed">
                  {features[selectedFeature].detail}
                </p>

                <div className="pt-4 border-t border-[#242824] space-y-2">
                  <div className="text-xs font-mono text-[#737373] uppercase tracking-wider">
                    System Guarantees
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#03A066]" />
                    <span>Deterministic execution with zero spreadsheet dependency</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#03A066]" />
                    <span>Real-time WebSocket event emission to connected organizers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
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
      iconSrc: '/assets/almosthack/organizer/organizer-setup.svg',
      uiHeader: 'Track & Timeline Matrix',
      mockData: [
        { label: 'Configured Tracks', val: '4 Tracks (AI, Web3, Health, Climate)' },
        { label: 'Milestone Timeline', val: 'Registration → Pitch → Code Freeze → Unseal' },
        { label: 'Rubric Criteria', val: '5 Calibrated Weighted Dimensions' },
      ],
    },
    {
      num: '02',
      title: 'Registration management',
      description: 'Manage participants without spreadsheet archaeology.',
      detail: 'Auto-verify builder profiles, review applicant questionnaires, and manage acceptance quotas in real time.',
      iconSrc: '/assets/almosthack/organizer/organizer-setup.svg',
      uiHeader: 'Applicant Verification Engine',
      mockData: [
        { label: 'Registered Applicants', val: '847 Total Builders' },
        { label: 'GitHub Verification', val: '100% Identity Validated' },
        { label: 'Acceptance Rate', val: '78% Auto-Approved' },
      ],
    },
    {
      num: '03',
      title: 'Team management',
      description: 'Create, approve and organize teams.',
      detail: 'Dynamic team formation tools, captain management, and automated discord role provisioning.',
      iconSrc: '/assets/almosthack/organizer/organizer-teams.svg',
      uiHeader: 'Dynamic Squad Matchmaking',
      mockData: [
        { label: 'Active Teams', val: '132 Teams (Avg. 3.4 builders/team)' },
        { label: 'Role Provisioning', val: 'Discord & Slack Webhooks Synced' },
        { label: 'Captain Lockouts', val: '132 Captains Verified' },
      ],
    },
    {
      num: '04',
      title: 'Submission management',
      description: 'Track every submission in one place.',
      detail: 'Continuous Git commit verification, repository integrity checks, and preview deployment audits.',
      iconSrc: '/assets/almosthack/organizer/organizer-submissions.svg',
      uiHeader: 'Continuous Git Repository Audit',
      mockData: [
        { label: 'Repositories Synced', val: '76 Repositories Monitored' },
        { label: 'Commit Frequency', val: '1,420 Commits Hashed' },
        { label: 'Late Submission Disputes', val: '0 (Cryptographically Blocked)' },
      ],
    },
    {
      num: '05',
      title: 'Judge management',
      description: 'Assign judges, rubrics and evaluation workflows.',
      detail: 'Intelligent conflict-of-interest detection and balanced review workload distribution across judge panels.',
      iconSrc: '/assets/almosthack/organizer/organizer-judging.svg',
      uiHeader: 'Judge Allocation & Panel Calibration',
      mockData: [
        { label: 'Active Evaluators', val: '24 Industry Experts' },
        { label: 'Panel Assignment', val: 'Double-Blind (No Track Bias)' },
        { label: 'Workload Balance', val: '6.2 Reviews / Judge' },
      ],
    },
    {
      num: '06',
      title: 'Transparent judging',
      description: 'Make every score explainable.',
      detail: 'Double-blind scoring with automatic variance normalization so every winner is statistically proven.',
      iconSrc: '/assets/almosthack/organizer/organizer-judging.svg',
      uiHeader: 'Bayesian Score Normalization',
      mockData: [
        { label: 'Raw Variance', val: '3.2 Mean Deviation' },
        { label: 'Normalized Score', val: '85.3 / 100 Calibrated' },
        { label: 'Public Auditability', val: '100% Scorecard Transparency' },
      ],
    },
    {
      num: '07',
      title: 'Live operations',
      description: 'See what is happening while it happens.',
      detail: 'Real-time telemetry stream of registrations, commit pushes, review completions, and broadcast announcements.',
      iconSrc: '/assets/almosthack/live/live-pulse.svg',
      uiHeader: 'Real-Time Telemetry Stream',
      mockData: [
        { label: 'WebSocket Stream', val: '100% Active • 24ms latency' },
        { label: 'Active Session', val: 'Hack The Future 2026 ● LIVE' },
        { label: 'System Health', val: 'All 5 Microservices Operational' },
      ],
    },
    {
      num: '08',
      title: 'Results & rankings',
      description: 'Publish results without spreadsheet gymnastics.',
      detail: 'One-click leaderboard unseal with automated cryptographic hash verifications and public ledger access.',
      iconSrc: '/assets/almosthack/organizer/organizer-results.svg',
      uiHeader: 'Cryptographic Leaderboard Unseal',
      mockData: [
        { label: 'Rankings Sealed', val: 'SHA-256 Verified Ledger' },
        { label: 'Winner Verification', val: 'Top 3 Finalists Confirmed' },
        { label: 'Public Export', val: 'JSON, CSV, Webhook & API' },
      ],
    },
    {
      num: '09',
      title: 'Certificates',
      description: 'Generate participant and winner certificates.',
      detail: 'Automated cryptographic certificate generation with verifiable signatures for all contestants.',
      iconSrc: '/assets/almosthack/organizer/organizer-results.svg',
      uiHeader: 'Verifiable Digital Credentials',
      mockData: [
        { label: 'Certificates Issued', val: '847 Participant Credentials' },
        { label: 'Digital Signature', val: 'ECDSA Signed' },
        { label: 'Claim Rate', val: '92% Claimed Within 24h' },
      ],
    },
    {
      num: '10',
      title: 'Audit trail',
      description: 'Know what changed, when and by whom.',
      detail: 'Immutable event log tracking all organizer actions, score updates, and system overrides.',
      iconSrc: '/assets/almosthack/transparent/audit-trail.svg',
      uiHeader: 'Immutable Event Log & Ledger',
      mockData: [
        { label: 'Logged Actions', val: '3,810 Events Recorded' },
        { label: 'Tamper Resistance', val: 'Append-Only Hash Chain' },
        { label: 'Organizer Trace', val: '100% Attributed' },
      ],
    },
  ];

  return (
    <section
      id="features"
      className="relative py-28 md:py-36 lg:py-48 bg-[#111311] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Organizer Features Matrix"
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
            <span>FOR ORGANIZERS</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight text-white leading-[1.08]"
          >
            Built for the organizers in the arena.
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl sm:text-2xl text-[#A3A3A3] font-body leading-relaxed max-w-3xl font-normal"
          >
            Ten mission-critical primitives designed to replace brittle workflows with automated, explainable software.
          </motion.p>
        </div>

        {/* 2-Column Interactive Product Navigator (Left list -> Right preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT: Complete 10-Item Feature Navigation */}
          <div className="lg:col-span-6 space-y-2.5">
            {features.map((feat, idx) => {
              const isSelected = selectedFeature === idx;
              return (
                <button
                  key={feat.num}
                  type="button"
                  onClick={() => setSelectedFeature(idx)}
                  onMouseEnter={() => setSelectedFeature(idx)}
                  onFocus={() => setSelectedFeature(idx)}
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

          {/* RIGHT: Large Interactive Product Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <motion.div
              key={selectedFeature}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="p-8 sm:p-10 rounded-[20px] bg-[#161816] border border-[#282C28] shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-left"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242824]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#03A066] animate-pulse" />
                  <span className="font-mono text-xs text-[#A3A3A3] uppercase tracking-wider font-bold">
                    {features[selectedFeature].uiHeader}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#5EEAD4] bg-[#028051]/20 px-3 py-1 rounded-[6px] border border-[#028051]/40 font-bold">
                  {features[selectedFeature].num} / 10
                </span>
              </div>

              <div className="space-y-6">
                <div className="w-14 h-14 rounded-[12px] bg-[#028051]/15 border border-[#028051]/40 flex items-center justify-center">
                  <Image
                    src={features[selectedFeature].iconSrc}
                    alt=""
                    width={32}
                    height={32}
                  />
                </div>

                <div>
                  <h4 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                    {features[selectedFeature].title}
                  </h4>
                  <p className="text-sm sm:text-base text-[#C2C6C2] font-body leading-relaxed mt-2">
                    {features[selectedFeature].detail}
                  </p>
                </div>

                {/* Dynamic Mock Telemetry Cards */}
                <div className="space-y-2.5 pt-4 border-t border-[#242824]">
                  {features[selectedFeature].mockData.map((m) => (
                    <div
                      key={m.label}
                      className="p-3 rounded-[8px] bg-[#141614] border border-[#262A26] flex items-center justify-between font-mono text-xs"
                    >
                      <span className="text-[#8C908C]">{m.label}:</span>
                      <span className="text-white font-bold truncate max-w-[200px] sm:max-w-xs">{m.val}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#03A066]">
                  <CheckCircle2 className="w-4 h-4 text-[#03A066]" />
                  <span>Real-time WebSocket event synchronization verified</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
};

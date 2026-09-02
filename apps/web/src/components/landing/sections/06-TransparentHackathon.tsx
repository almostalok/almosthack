'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { ShieldCheck, CheckCircle2, Lock, Terminal, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@almosthack/utils';

export const TransparentHackathonSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(4); // default on Consensus

  const flowSteps = [
    { id: 'submission', label: 'SUBMISSION', iconSrc: '/assets/almosthack/transparent/transparent-flow.svg' },
    { id: 'rubric', label: 'RUBRIC', iconSrc: '/assets/almosthack/judge/judge-rubric.svg' },
    { id: 'scores', label: 'JUDGE SCORES', iconSrc: '/assets/almosthack/judge/judge-scorecard.svg' },
    { id: 'normalization', label: 'NORMALIZATION', iconSrc: '/assets/almosthack/transparent/score-normalization.svg' },
    { id: 'consensus', label: 'CONSENSUS', iconSrc: '/assets/almosthack/transparent/fairness-check.svg' },
    { id: 'final', label: 'FINAL RESULT', iconSrc: '/assets/almosthack/organizer/organizer-results.svg' },
  ];

  const criteriaScores = [
    { name: 'Innovation', score: 18, max: 20, pct: '90%' },
    { name: 'Execution', score: 17, max: 20, pct: '85%' },
    { name: 'Impact', score: 19, max: 20, pct: '95%' },
    { name: 'Design', score: 16, max: 20, pct: '80%' },
    { name: 'Presentation', score: 15, max: 20, pct: '75%' },
  ];

  const auditEvents = [
    { time: '10:42:00', event: 'Judge 01, 02, 03 assigned to Sub-8492 (QuantumQuest)', actor: 'consensus_engine' },
    { time: '11:08:14', event: 'Judge 01 submitted double-blind rubric evaluation (Raw: 87.0)', actor: 'dr_sarah' },
    { time: '11:14:32', event: 'Judge 02 & 03 completed evaluations (Raw: 84.0, 85.0)', actor: 'panel_sync' },
    { time: '11:15:00', event: 'Normalized Bayesian consensus calculated: 85.3 / 100. Review locked.', actor: 'ledger_seal' },
  ];

  return (
    <section
      id="transparency"
      className="relative py-28 md:py-36 lg:py-48 bg-[#111311] border-t border-[#222622] text-left overflow-hidden"
      aria-label="The Transparent Hackathon Operating System"
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
            <ShieldCheck className="w-4 h-4 text-[#03A066]" />
            <span>CORE PRODUCT PILLAR • THE TRANSPARENT HACKATHON</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight text-white leading-[1.08]"
          >
            Every decision.
            <br />
            <span className="relative inline-block text-white">
              Visible.
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
            No mystery scores. No black-box judging. No &ldquo;wait, how did they win?&rdquo;
            Every score is traceable, calibrated, and cryptographically auditable.
          </motion.p>
        </div>

        {/* 6-Step Visual Journey Stepper */}
        <div className="mb-14 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-3 min-w-[800px]">
            {flowSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-[12px] font-mono text-xs sm:text-sm font-semibold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer',
                    isActive
                      ? 'bg-[#028051] text-white border-[#03A066] shadow-md'
                      : 'bg-[#161816] text-[#8C908C] hover:text-white border-[#242824]'
                  )}
                >
                  <Image
                    src={step.iconSrc}
                    alt=""
                    width={20}
                    height={20}
                    className={cn(isActive ? 'brightness-200' : 'opacity-60')}
                  />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real Score Ledger & Audit Trail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT: QuantumQuest Detailed Rubric Breakdown */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-[20px] bg-[#161816] border border-[#282C28] shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#242824]">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#03A066] font-bold block">
                    TRANSPARENT SCORE LEDGER
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">
                    QuantumQuest
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono uppercase text-[#737373] block">Total Raw</span>
                  <span className="text-3xl font-heading font-extrabold text-white">
                    85 <span className="text-sm font-mono text-[#737373]">/ 100</span>
                  </span>
                </div>
              </div>

              {/* 5 Criteria */}
              <div className="space-y-4">
                {criteriaScores.map((c) => (
                  <div key={c.name} className="space-y-1.5 font-mono text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#C2C6C2]">{c.name}</span>
                      <span className="font-bold text-white">
                        {c.score} <span className="text-[#737373] font-normal">/ {c.max}</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1F231F] rounded-full overflow-hidden border border-[#282C28]">
                      <div
                        className="h-full bg-gradient-to-r from-[#028051] to-[#03A066] rounded-full transition-all"
                        style={{ width: c.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Judge Variance Summary */}
            <div className="mt-10 pt-6 border-t border-[#242824] space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3.5 rounded-[10px] bg-[#1A1D1A] border border-[#282C28]">
                  <span className="text-[11px] text-[#737373] block">Judge 01</span>
                  <span className="text-base font-bold text-white mt-0.5">87.0</span>
                </div>
                <div className="p-3.5 rounded-[10px] bg-[#1A1D1A] border border-[#282C28]">
                  <span className="text-[11px] text-[#737373] block">Judge 02</span>
                  <span className="text-base font-bold text-white mt-0.5">84.0</span>
                </div>
                <div className="p-3.5 rounded-[10px] bg-[#1A1D1A] border border-[#282C28]">
                  <span className="text-[11px] text-[#737373] block">Judge 03</span>
                  <span className="text-base font-bold text-white mt-0.5">85.0</span>
                </div>
              </div>

              <div className="p-4 rounded-[12px] bg-[#028051]/15 border border-[#028051]/30 flex items-center justify-between font-mono text-sm">
                <span className="text-[#5EEAD4] font-semibold">Normalized Bayesian Consensus Score:</span>
                <strong className="text-xl text-white font-heading font-extrabold">85.3 / 100</strong>
              </div>
            </div>
          </div>

          {/* RIGHT: Immutable Audit Trail Block */}
          <div className="lg:col-span-5 p-8 sm:p-10 rounded-[20px] bg-[#141614] border border-[#282C28] flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#242824]">
                <div className="flex items-center gap-2.5 font-mono text-sm text-[#EDEDED] font-bold">
                  <Terminal className="w-5 h-5 text-[#03A066]" />
                  <span>Immutable Audit Log</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#03A066] animate-pulse" />
              </div>

              <div className="space-y-3.5 font-mono text-xs">
                {auditEvents.map((ev, i) => (
                  <div key={i} className="p-3.5 rounded-[10px] bg-[#181B18] border border-[#242824] space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#03A066] font-bold">{ev.time}</span>
                      <span className="text-[#737373]">@{ev.actor}</span>
                    </div>
                    <p className="text-xs text-[#C2C6C2] leading-snug">
                      {ev.event}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#242824] flex items-center justify-between text-xs font-mono text-[#737373]">
              <span className="flex items-center gap-2 text-[#03A066]">
                <Lock className="w-4 h-4" /> Cryptographically Sealed
              </span>
              <span>SHA-256 Ledger</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

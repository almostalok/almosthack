'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MacFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'what is almosthack?',
      a: 'an ai co-host and evaluation engine for your hackathon. connect your event repos and it automatically scans commits, evaluates pitch videos, generates live leaderboards, and issues cryptographic certificates.',
    },
    {
      q: 'is our event data & code private?',
      a: 'yes. code repositories, pitch materials, and judge notes are strictly processed in isolated ephemeral runtime containers and are never stored or trained on public models.',
    },
    {
      q: 'does almosthack replace human judges?',
      a: 'no! almosthack acts as an ai copilot for judges. it pre-scans technical execution, architecture quality, and repo activity so human judges can focus on creativity and live demos.',
    },
    {
      q: 'which platforms & stacks does it work with?',
      a: 'anything in your developer workflow. github, gitlab, devpost, dorahacks, discord, slack, and custom webhooks.',
    },
    {
      q: 'what’s the difference between free, pro, and max?',
      a: 'free includes 25 ai code reviews per month. pro gives you unlimited code evaluations + 150 ai judge copilot credits. max provides 1,000 credits, white-label branding, and dedicated support.',
    },
    {
      q: 'is it free for community & student hackathons?',
      a: 'yes! community events can start 100% free. we also offer a 50% maker discount on pro for indie jams and student clubs.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-modern-dark text-white relative overflow-hidden select-none">
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">

        {/* Section Header with Instrument Serif Accent */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="inline-block px-3.5 py-1 rounded-full bg-zinc-900 border border-white/15 text-xs font-mono text-cyan uppercase tracking-wider mb-4">
            faq
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white lowercase">
            frequently asked{' '}
            <span className="font-serif italic text-cyan text-4xl sm:text-5xl font-normal">
              questions
            </span>
          </h2>
          <p className="mt-3 text-zinc-400 font-sans text-base">
            what to know about almosthack, ai evaluation, and getting started.
          </p>
        </div>

        {/* macOS Style Accordion Container */}
        <div className="mac-window border border-white/15 overflow-hidden p-2 shadow-2xl space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-zinc-950/80 rounded-lg border border-white/5 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left font-mono text-sm sm:text-base text-white hover:text-cyan transition-colors cursor-pointer select-none"
                >
                  <span className="font-semibold">{faq.q}</span>
                  <div className="p-1 rounded bg-white/5 text-cyan border border-white/10 ml-4 shrink-0">
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 pt-1 text-sm font-sans text-zinc-300 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MacFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'what is almosthack?',
      a: 'An AI co-host and evaluation engine for your hackathon. Connect your event repos and it automatically scans commits, evaluates pitch videos, generates live leaderboards, and issues cryptographic certificates.',
    },
    {
      q: 'is our event data & code private?',
      a: 'Yes. Code repositories, pitch materials, and judge notes are strictly processed in isolated ephemeral runtime containers and are never stored or trained on public models.',
    },
    {
      q: 'does almosthack replace human judges?',
      a: 'No! AlmostHack acts as an AI copilot for judges. It pre-scans technical execution, architecture quality, and repo activity so human judges can focus on creativity and live demos.',
    },
    {
      q: 'which platforms & stacks does it work with?',
      a: 'Anything in your developer workflow. GitHub, GitLab, Devpost, DoraHacks, Discord, Slack, and custom webhooks.',
    },
    {
      q: 'what’s the difference between free, pro, and max?',
      a: 'Free includes 25 AI code reviews per month. Pro gives you unlimited code evaluations + 150 AI judge copilot credits. Max provides 1,000 credits, white-label branding, and dedicated support.',
    },
    {
      q: 'is it free for community & student hackathons?',
      a: 'Yes! Community events can start 100% free. We also offer a 50% maker discount on Pro for indie jams and student clubs.',
    },
  ];

  return (
    <section id="faq" className="py-28 bg-[#051C14] text-white relative overflow-hidden select-none transition-colors duration-300">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="optimizely-pill-pink shadow-md mb-3">
            [ FREQUENTLY ASKED QUESTIONS ]
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white lowercase">
            frequently asked{' '}
            <span className="serif-accent text-[#ABFF44] font-normal">
              questions
            </span>
          </h2>
          <p className="mt-3 text-slate-300 font-sans text-base leading-relaxed">
            Everything you need to know about AlmostHack, AI evaluation, and getting started.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="optimizely-card rounded-3xl border-2 border-[#0D3A29] overflow-hidden p-5 shadow-[-6px_6px_0_0_#0D3A29] bg-[#F5F8F0] text-[#072419] space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border-2 border-[#0D3A29] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-mono text-sm sm:text-base text-[#072419] hover:text-[#0D3A29] transition-colors cursor-pointer select-none font-bold"
                >
                  <span>{faq.q}</span>
                  <div className="p-1 rounded-lg bg-[#ABFF44] text-[#072419] border border-[#0D3A29] ml-4 shrink-0 shadow-sm">
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
                      <div className="px-6 pb-5 pt-1 text-sm font-sans text-[#557365] leading-relaxed border-t-2 border-[#0D3A29] font-medium">
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

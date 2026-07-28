'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How fast can I setup a hackathon on AlmostHack?',
      a: 'You can launch your complete hackathon landing page, custom registration form, track categories, and sponsor badges in under 5 minutes.',
    },
    {
      q: 'How does the AI Judge Assistance & Duplicate Shield work?',
      a: 'Our AI engine scans submitted GitHub repositories for commit timeline verification, code originality, and plagiarism. It synthesizes complex codebases into 10-second executive summaries and applies standardized scoring rubrics automatically.',
    },
    {
      q: 'Can we use our own custom domain and white-label branding?',
      a: 'Yes! On Enterprise and Professional plans, you can host your event on custom subdomains like hack.youruniversity.edu with automated SSL certificates and custom logo themes.',
    },
    {
      q: 'Does AlmostHack support offline venue check-ins?',
      a: 'Absolutely. Every registered hacker receives an encrypted QR code pass. Organizers and gate staff can scan passes using mobile phones for instant gate check-ins, lunch redemptions, and swag distribution.',
    },
    {
      q: 'Is AlmostHack free for small college and community hackathons?',
      a: 'Yes, our Starter plan is 100% free forever for hackathons up to 300 participants, complete with registration tools and PDF certificates.',
    },
    {
      q: 'How are digital certificates verified?',
      a: 'Each certificate issued on AlmostHack includes a unique cryptographic verification link and QR code anchored on Solana/IPFS. Recruiters can verify authenticity in 1-click.',
    },
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-[#07080E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-mono text-accent tracking-widest uppercase px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Everything you need to know.
          </h2>
          <p className="text-muted text-base sm:text-lg">
            Have a question? We’re here to help you build your best hackathon yet.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-surface border border-white/10 glass-card overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 group"
                >
                  <span className="font-semibold text-white text-base group-hover:text-accent transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/50 group-hover:text-white transition-transform ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6 text-xs text-white/70 leading-relaxed font-sans border-t border-white/5 pt-4"
                    >
                      {faq.a}
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

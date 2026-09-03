'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MessageSquare, ArrowRight, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({});

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const col1Faqs = [
    {
      q: 'What is AlmostHack?',
      a: 'AlmostHack is the operating system for hackathons. It brings event setup, team formation, Git commit verification, calibrated judging, and verifiable certificates into one unified workspace.',
    },
    {
      q: 'Can I create a private hackathon?',
      a: 'Yes. You can configure hackathons as public, invite-only, or restricted to specific corporate email domains or whitelist lists with custom access control.',
    },
    {
      q: 'Can participants connect GitHub?',
      a: 'Yes. Teams connect their GitHub repositories directly so AlmostHack can audit commit history, detect pre-event development, and verify PR activity during the build window.',
    },
    {
      q: 'Can I integrate with other tools?',
      a: 'AlmostHack integrates with GitHub, Discord, Google, Docker, email providers, and provides webhooks and REST APIs to sync data with external systems.',
    },
  ];

  const col2Faqs = [
    {
      q: 'Can judges score submissions inside AlmostHack?',
      a: 'Yes. Judges access a focused, double-blind judging portal with customizable rubrics, scoring sliders, private notes, and automated conflict-of-interest detection.',
    },
    {
      q: 'Can participants see their judging results?',
      a: 'Organizers can toggle transparent feedback on or off. When enabled, teams can view anonymized rubric scores and constructive feedback once results are finalized.',
    },
    {
      q: 'Can I manage multiple hackathons?',
      a: 'Yes. Organization accounts can run concurrent hackathons, clone tracks and rubrics from past events, and maintain organizational archives from a single dashboard.',
    },
    {
      q: 'How are results calculated?',
      a: 'Scores are computed using robust consensus methods—including trimmed means, Olympic averaging, and z-score normalization—to ensure fairness and eliminate outlier bias.',
    },
  ];

  return (
    <section id="faq" className="relative py-20 lg:py-28 bg-[#0B0D0C] border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Graphic Speech Bubble */}
          <div className="lg:col-span-2 hidden lg:flex flex-col items-center pt-8">
            <div className="relative w-20 h-20 rounded-2xl bg-[#151917] border border-[#028051] flex items-center justify-center shadow-[0_0_25px_rgba(2,128,81,0.4)]">
              <MessageSquare className="w-10 h-10 text-[#A8E63B]" />
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#028051] flex items-center justify-center text-white border-2 border-[#0B0D0C] text-xs font-bold">
                ?
              </div>
            </div>
          </div>

          {/* Right Column: 2-Column Accordion */}
          <div className="lg:col-span-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="text-[11px] font-mono tracking-widest text-[#A8E63B] uppercase font-semibold">
                  EVERYTHING YOU NEED TO KNOW
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Frequently asked questions
                </h2>
              </div>

              <Link
                href="/docs"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#A7AEA7] hover:text-white transition-colors"
              >
                <span>View all docs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2 Columns of Accordions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column 1 */}
              <div className="space-y-3">
                {col1Faqs.map((faq, idx) => {
                  const isOpen = !!openItems[idx];
                  return (
                    <div
                      key={faq.q}
                      className="rounded-xl bg-[#111412] border border-white/[0.08] overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => toggleItem(idx)}
                        className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-white hover:text-[#A8E63B] transition-colors"
                        aria-expanded={isOpen}
                      >
                        <span className="pr-2">{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#737A73] transition-transform duration-200 shrink-0 ${
                            isOpen ? 'rotate-180 text-[#A8E63B]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-[#A7AEA7] leading-relaxed border-t border-white/[0.04] pt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Column 2 */}
              <div className="space-y-3">
                {col2Faqs.map((faq, idx) => {
                  const actualIdx = idx + 10;
                  const isOpen = !!openItems[actualIdx];
                  return (
                    <div
                      key={faq.q}
                      className="rounded-xl bg-[#111412] border border-white/[0.08] overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => toggleItem(actualIdx)}
                        className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-white hover:text-[#A8E63B] transition-colors"
                        aria-expanded={isOpen}
                      >
                        <span className="pr-2">{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#737A73] transition-transform duration-200 shrink-0 ${
                            isOpen ? 'rotate-180 text-[#A8E63B]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-[#A7AEA7] leading-relaxed border-t border-white/[0.04] pt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

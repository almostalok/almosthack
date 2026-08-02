'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, ArrowRight } from 'lucide-react';

interface MacPricingSectionProps {
  onOpenDemoModal?: () => void;
}

export function MacPricingSection({ onOpenDemoModal }: MacPricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-28 bg-[#051C14] text-white relative overflow-hidden select-none transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="optimizely-pill-pink shadow-md mb-3">
            [ TRANSPARENT PRICING ]
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white lowercase">
            almosthack,{' '}
            <span className="serif-accent text-[#ABFF44] font-normal">
              your way
            </span>
          </h2>
          <p className="mt-3 text-slate-300 font-sans text-base leading-relaxed">
            Three transparent plans for organizers of all sizes. Cancel anytime.
          </p>

          {/* Optimizely Billing Toggle Switch */}
          <div className="mt-8 inline-flex items-center gap-2 bg-[#0D3A29] border-2 border-[#0D3A29] p-1.5 rounded-full shadow-lg">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all ${
                !isYearly
                  ? 'bg-[#ABFF44] text-[#072419] border border-[#0D3A29] shadow-sm'
                  : 'text-[#789887] hover:text-white'
              }`}
            >
              monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                isYearly
                  ? 'bg-[#ABFF44] text-[#072419] border border-[#0D3A29] shadow-sm'
                  : 'text-[#789887] hover:text-white'
              }`}
            >
              <span>yearly</span>
              <span className="optimizely-pill-pink text-[9px] px-1.5 py-0.5">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: FREE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="optimizely-card rounded-3xl flex flex-col justify-between p-8 space-y-6"
          >
            <div className="flex flex-col justify-between flex-1 gap-6">
              <div>
                <h3 className="font-display text-3xl font-black text-[#072419] lowercase">free</h3>
                <p className="text-xs font-mono text-[#557365] mt-1 font-bold">Ideal for local meetups &amp; small hackathons</p>
                
                <div className="my-6">
                  <div className="font-display text-5xl font-black text-[#072419]">
                    $0
                  </div>
                  <p className="text-xs font-mono text-[#557365] mt-1 font-bold">Free forever, no credit card needed</p>
                </div>

                <button
                  onClick={onOpenDemoModal}
                  className="optimizely-btn-dark w-full py-3.5 text-xs font-bold flex items-center justify-center cursor-pointer"
                >
                  start free
                </button>
              </div>

              <div className="pt-6 border-t-2 border-[#0D3A29] space-y-3 font-mono text-xs text-[#072419] font-bold">
                <p className="text-[#557365] text-[10px] uppercase tracking-wider font-extrabold">INCLUDES</p>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0D3A29]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>25 AI code evaluations / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0D3A29]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Unlimited hacker registrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0D3A29]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Basic live leaderboard</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: PRO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="optimizely-card rounded-3xl flex flex-col justify-between p-8 relative border-2 border-[#0D3A29] bg-[#ABFF44] text-[#072419] shadow-[-6px_6px_0_0_#0D3A29]"
          >
            <div className="absolute -top-3.5 right-6 optimizely-pill-pink text-[10px] shadow-md font-extrabold">
              POPULAR CHOICE
            </div>

            <div className="flex flex-col justify-between flex-1 gap-6">
              <div>
                <h3 className="font-display text-3xl font-black text-[#072419] lowercase">pro</h3>
                <p className="text-xs font-mono text-[#072419]/80 mt-1 font-bold">Run hackathons like a pro. Best for active organizers</p>
                
                <div className="my-6">
                  <div className="font-display text-5xl font-black text-[#072419]">
                    {isYearly ? '$16' : '$20'}
                    <span className="text-sm font-normal text-[#072419] font-mono"> / mo</span>
                  </div>
                  <p className="text-xs font-mono text-[#072419]/80 mt-1 font-bold">
                    {isYearly ? 'Billed annually ($192/yr)' : 'Billed monthly, cancel anytime'}
                  </p>
                </div>

                <button
                  onClick={onOpenDemoModal}
                  className="optimizely-btn-dark w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <svg className="w-4 h-4 text-[#ABFF44] fill-[#ABFF44]" viewBox="0 0 24 24">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>get pro</span>
                </button>
              </div>

              <div className="pt-6 border-t-2 border-[#072419] space-y-3 font-mono text-xs text-[#072419] font-bold">
                <p className="text-[#072419]/70 text-[10px] uppercase tracking-wider font-extrabold">INCLUDES EVERYTHING IN FREE PLUS</p>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#072419]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Unlimited AI code evaluations</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#072419]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>150 AI judge copilot credits / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#072419]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Custom cryptographic certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#072419]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Real-time live scoring matrix</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: MAX */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="optimizely-card rounded-3xl flex flex-col justify-between p-8 space-y-6"
          >
            <div className="flex flex-col justify-between flex-1 gap-6">
              <div>
                <h3 className="font-display text-3xl font-black text-[#072419] lowercase">max</h3>
                <p className="text-xs font-mono text-[#557365] mt-1 font-bold">All hands &amp; models you need. Best for enterprise events</p>
                
                <div className="my-6">
                  <div className="font-display text-5xl font-black text-[#072419]">
                    {isYearly ? '$80' : '$100'}
                    <span className="text-sm font-normal text-[#557365] font-mono"> / mo</span>
                  </div>
                  <p className="text-xs font-mono text-[#557365] mt-1 font-bold">
                    {isYearly ? 'Billed annually ($960/yr)' : 'Billed monthly, cancel anytime'}
                  </p>
                </div>

                <button
                  onClick={onOpenDemoModal}
                  className="optimizely-btn-dark w-full py-3.5 text-xs font-bold flex items-center justify-center cursor-pointer"
                >
                  get max
                </button>
              </div>

              <div className="pt-6 border-t-2 border-[#0D3A29] space-y-3 font-mono text-xs text-[#072419] font-bold">
                <p className="text-[#557365] text-[10px] uppercase tracking-wider font-extrabold">INCLUDES EVERYTHING IN PRO PLUS</p>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0D3A29]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Priority GPU AI queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0D3A29]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>1,000 AI judge agent credits / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0D3A29]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>White-label branding &amp; custom domain</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0D3A29]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Dedicated event manager &amp; live support</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Maker Discount Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 max-w-4xl mx-auto optimizely-card p-8 border-2 border-[#0D3A29] shadow-[-6px_6px_0_0_#0D3A29] bg-[#F5F8F0]"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-[#072419]">
            <div className="space-y-2 text-left">
              <h4 className="font-display font-black text-[#072419] text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0D3A29]" />
                Indie Hackathon &amp; Student Grant
              </h4>
              <p className="text-xs text-[#557365] max-w-xl leading-relaxed font-sans font-medium">
                If you&apos;re organizing an open-source jam, university event, or community hackathon, show us! We&apos;ll grant you 50% off Pro for your event *
              </p>
              <p className="text-[10px] text-[#557365] font-bold">* Open to new and existing event organizers.</p>
            </div>

            <button
              onClick={onOpenDemoModal}
              className="optimizely-btn-lime whitespace-nowrap px-6 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>reach out to us</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#072419]" />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

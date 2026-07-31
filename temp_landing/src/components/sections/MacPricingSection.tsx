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
    <section id="pricing" className="py-24 bg-modern-dark text-white relative overflow-hidden select-none">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-glow opacity-25 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full bg-zinc-900 border border-white/15 text-xs font-mono text-cyan uppercase tracking-wider mb-4">
            pricing
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white lowercase">
            almosthack,{' '}
            <span className="font-serif italic text-cyan text-4xl sm:text-5xl font-normal">
              your way
            </span>
          </h2>
          <p className="mt-3 text-zinc-400 font-sans text-base">
            three simple plans for organizers of all sizes. cancel anytime.
          </p>

          {/* Billing Toggle Switch */}
          <div className="mt-8 inline-flex items-center gap-2 bg-zinc-900/90 border border-white/15 p-1 rounded-full backdrop-blur-md shadow-xl">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all ${
                !isYearly
                  ? 'bg-gradient-to-r from-zinc-800 to-zinc-950 text-white border border-white/20 shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                isYearly
                  ? 'bg-gradient-to-r from-zinc-800 to-zinc-950 text-white border border-white/20 shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>yearly</span>
              <span className="bg-cyan text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 macOS Window Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: FREE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mac-window flex flex-col justify-between p-0 overflow-hidden"
          >
            <div className="mac-window-bar px-4 py-3">
              <div className="mac-dots">
                <span className="mac-dot mac-dot-close" />
                <span className="mac-dot mac-dot-min" />
                <span className="mac-dot mac-dot-zoom" />
              </div>
              <span className="text-xs font-mono text-zinc-400">free.app</span>
            </div>

            <div className="p-6 bg-zinc-950/90 flex flex-col justify-between flex-1 gap-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-white lowercase">free</h3>
                <p className="text-xs font-mono text-zinc-400 mt-1">see what the fuss is about. best for local meetups</p>
                
                <div className="my-6">
                  <div className="font-display text-4xl font-extrabold text-white">
                    $0
                  </div>
                  <p className="text-xs font-mono text-zinc-500 mt-1">free forever, no credit card needed</p>
                </div>

                <button
                  onClick={onOpenDemoModal}
                  className="w-full py-3 rounded-xl bg-zinc-900 border border-white/15 hover:border-white/30 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg"
                >
                  start free
                </button>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3 font-mono text-xs text-zinc-300">
                <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-bold">includes</p>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>25 AI code evaluations / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Unlimited hacker registrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Basic live leaderboard</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: PRO (Popular Glowing Card) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mac-window flex flex-col justify-between p-0 overflow-hidden relative border-cyan/50 shadow-[0_0_50px_rgba(0,240,255,0.18)]"
          >
            {/* Popular Badge */}
            <div className="absolute top-2 right-4 bg-cyan text-black font-mono text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase z-20 shadow-md">
              popular
            </div>

            <div className="mac-window-bar px-4 py-3">
              <div className="mac-dots">
                <span className="mac-dot mac-dot-close" />
                <span className="mac-dot mac-dot-min" />
                <span className="mac-dot mac-dot-zoom" />
              </div>
              <span className="text-xs font-mono text-cyan">pro.app</span>
            </div>

            <div className="p-6 bg-zinc-950/95 flex flex-col justify-between flex-1 gap-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-white lowercase">pro</h3>
                <p className="text-xs font-mono text-zinc-400 mt-1">run hackathons like a pro. best for active organizers</p>
                
                <div className="my-6">
                  <div className="font-display text-4xl font-extrabold text-white">
                    {isYearly ? '$16' : '$20'}
                    <span className="text-sm font-normal text-zinc-400 font-mono"> / mo</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-500 mt-1">
                    {isYearly ? 'billed annually ($192/yr)' : 'billed monthly, cancel anytime'}
                  </p>
                </div>

                <button
                  onClick={onOpenDemoModal}
                  className="mac-btn-gloss w-full py-3.5 rounded-xl text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl"
                >
                  <svg className="w-4 h-4 text-cyan fill-cyan" viewBox="0 0 24 24">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>get pro</span>
                </button>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3 font-mono text-xs text-zinc-300">
                <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-bold">includes</p>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Unlimited AI code evaluations</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>150 AI judge copilot credits / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Custom cryptographic certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
            className="mac-window flex flex-col justify-between p-0 overflow-hidden"
          >
            <div className="mac-window-bar px-4 py-3">
              <div className="mac-dots">
                <span className="mac-dot mac-dot-close" />
                <span className="mac-dot mac-dot-min" />
                <span className="mac-dot mac-dot-zoom" />
              </div>
              <span className="text-xs font-mono text-zinc-400">max.app</span>
            </div>

            <div className="p-6 bg-zinc-950/90 flex flex-col justify-between flex-1 gap-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-white lowercase">max</h3>
                <p className="text-xs font-mono text-zinc-400 mt-1">all hands &amp; models you need. best for enterprise events</p>
                
                <div className="my-6">
                  <div className="font-display text-4xl font-extrabold text-white">
                    {isYearly ? '$80' : '$100'}
                    <span className="text-sm font-normal text-zinc-400 font-mono"> / mo</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-500 mt-1">
                    {isYearly ? 'billed annually ($960/yr)' : 'billed monthly, cancel anytime'}
                  </p>
                </div>

                <button
                  onClick={onOpenDemoModal}
                  className="w-full py-3 rounded-xl bg-zinc-900 border border-white/15 hover:border-white/30 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg"
                >
                  get max
                </button>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3 font-mono text-xs text-zinc-300">
                <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-bold">includes</p>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Unlimited AI evaluations &amp; priority GPU queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>1,000 AI judge agent credits / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>White-label branding &amp; custom domain</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Dedicated event manager &amp; live support</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Maker Discount Terminal Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 max-w-4xl mx-auto mac-window border border-white/15 overflow-hidden shadow-2xl"
        >
          <div className="mac-window-bar px-4 py-2.5">
            <div className="mac-dots">
              <span className="mac-dot mac-dot-close" />
              <span className="mac-dot mac-dot-min" />
              <span className="mac-dot mac-dot-zoom" />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-cyan font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>&lt; maker discount &gt;</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="p-6 bg-zinc-950/95 flex flex-col md:flex-row items-center justify-between gap-6 font-mono">
            <div className="space-y-2 text-left">
              <h4 className="text-white font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Indie Hackathon &amp; Student Grant
              </h4>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                if you&apos;re organizing an open-source jam, university event, or community hackathon, show us! we&apos;ll grant you 50% off pro for your event *
              </p>
              <p className="text-[10px] text-zinc-600">* open to new and existing event organizers.</p>
            </div>

            <button
              onClick={onOpenDemoModal}
              className="mac-btn-gloss whitespace-nowrap px-6 py-3 rounded-xl font-mono text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-xl"
            >
              <span>reach out to us</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan" />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

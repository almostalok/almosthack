'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2, Terminal, Sparkles } from 'lucide-react';
import { Scribble } from '@almosthack/ui';
import { MascotRobot } from '../MascotRobot';
import { OrganizerDashboardDemo } from '../demos/OrganizerDashboardDemo';

export interface HeroSectionProps {
  onBookDemo?: () => void;
  onSeeAction?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBookDemo,
  onSeeAction,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const handleSeeAction = () => {
    if (onSeeAction) {
      onSeeAction();
    } else {
      const demoElement = document.getElementById('hero-demo-visual');
      if (demoElement) {
        demoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleBookDemo = () => {
    if (onBookDemo) {
      onBookDemo();
    } else {
      const demoElement = document.getElementById('book-demo') || document.getElementById('hero');
      if (demoElement) {
        demoElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="hero"
      className="relative pt-12 pb-24 md:pt-20 md:pb-36 lg:pt-28 lg:pb-44 overflow-hidden text-left"
      aria-label="AlmostHack Hero"
    >
      {/* Background Ambient Glow & Pixel Cluster */}
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#028051]/8 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-16 left-8 w-80 h-80 bg-[#028051]/5 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div className="absolute top-20 right-12 opacity-30 hidden lg:block pointer-events-none -z-10">
        <Image
          src="/assets/almosthack/hero/hero-pixel-cluster.svg"
          alt=""
          width={48}
          height={48}
        />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ==================================================== */}
          {/* LEFT COLUMN: Narrative, Massive Headline, CTAs, Proof */}
          {/* ==================================================== */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            
            {/* Eyebrow Pill */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] font-semibold tracking-wider mb-6 shadow-xs uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
              <span>THE OPERATING SYSTEM FOR HACKATHONS</span>
            </motion.div>

            {/* Massive Hero Headline (64-88px scale) */}
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] tracking-tight text-white leading-[1.04]"
            >
              Run hackathons.
              <br />
              <span className="relative inline-block text-white">
                Not mental breakdowns.
                {/* Hand-drawn scribble underline accent */}
                <span className="absolute -bottom-3 left-0 w-full h-4 text-[#028051] pointer-events-none block overflow-visible">
                  <Image
                    src="/assets/almosthack/hero/hero-scribble.svg"
                    alt=""
                    width={240}
                    height={24}
                    className="w-full h-full object-fill"
                  />
                </span>
              </span>
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 text-xl sm:text-2xl text-[#A3A3A3] font-body max-w-xl leading-relaxed font-normal"
            >
              We handle the boring stuff.
              <br />
              <span className="text-[#EDEDED] font-medium">You enjoy the chaos.</span>
            </motion.p>

            {/* Action Buttons (CTAs) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4 w-full sm:w-auto"
            >
              {/* Primary CTA */}
              <button
                type="button"
                onClick={handleBookDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-[12px] bg-[#028051] hover:bg-[#03A066] active:bg-[#015033] text-white font-semibold text-lg shadow-[0_4px_20px_rgba(2,128,81,0.3)] transition-all border border-[#03A066]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131413] cursor-pointer"
              >
                <span>Book a Demo</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Secondary CTA */}
              <button
                type="button"
                onClick={handleSeeAction}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[12px] bg-[#181A18] hover:bg-[#222622] active:bg-[#161816] text-[#EDEDED] font-medium text-lg border border-[#282C28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer"
              >
                <Play className="w-4 h-4 text-[#03A066] fill-[#03A066]" />
                <span>See it in Action</span>
              </button>
            </motion.div>

            {/* Proof Statistics */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 pt-8 border-t border-[#242824] w-full"
            >
              <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-sm sm:text-base font-mono text-[#8C908C]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#03A066]" />
                  <strong className="text-white font-bold font-heading text-base sm:text-lg">
                    1,200+
                  </strong>
                  <span>organizers</span>
                </div>

                <span className="text-[#3A3F3A] hidden xs:inline">•</span>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#03A066]" />
                  <strong className="text-white font-bold font-heading text-base sm:text-lg">
                    25K+
                  </strong>
                  <span>hackers</span>
                </div>

                <span className="text-[#3A3F3A] hidden xs:inline">•</span>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#03A066]" />
                  <strong className="text-white font-bold font-heading text-base sm:text-lg">
                    80+
                  </strong>
                  <span>countries</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT COLUMN: Large Product UI Demo + Mascot        */}
          {/* ==================================================== */}
          <div className="lg:col-span-6 relative z-10 mt-8 lg:mt-0" id="hero-demo-visual">
            
            {/* Mascot Robot positioned dynamically with speech bubble */}
            <div className="absolute -top-14 sm:-top-16 right-4 sm:right-8 z-30 pointer-events-auto">
              <MascotRobot
                variant="default"
                speechText={'Spreadsheets called.\nThey quit.'}
              />
            </div>

            {/* Decorative Ambient Border Frame */}
            <div
              className="absolute -inset-4 bg-gradient-to-tr from-[#028051]/15 via-transparent to-transparent rounded-[24px] -z-10 border border-[#282C28]/60"
              aria-hidden="true"
            />

            {/* Large Prominent Organizer Dashboard Demo */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              <OrganizerDashboardDemo />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2, Terminal } from 'lucide-react';
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
      className="relative pt-8 pb-16 md:pt-14 md:pb-24 lg:pt-20 lg:pb-32 overflow-hidden text-left"
      aria-label="AlmostHack Hero"
    >
      {/* Subtle Background Ambient Glow (Controlled primary green only) */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#028051]/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-10 left-10 w-72 h-72 bg-[#028051]/5 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ==================================================== */}
          {/* LEFT COLUMN: Narrative, Headlines, CTAs, Proof       */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 flex flex-col items-start z-10">
            
            {/* Eyebrow Pill */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] font-medium tracking-wide mb-6 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
              <span>THE OPERATING SYSTEM FOR HACKATHONS</span>
            </motion.div>

            {/* Primary Headline */}
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.08]"
            >
              Run hackathons.
              <br />
              <span className="relative inline-block text-white">
                Not mental breakdowns.
                {/* Hand-drawn scribble underline accent */}
                <Scribble
                  variant="underline"
                  color="#028051"
                  className="absolute -bottom-2.5 left-0 w-full h-3.5 text-[#028051]"
                />
              </span>
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-[#A3A3A3] font-body max-w-lg leading-relaxed"
            >
              We handle the boring stuff.
              <br />
              You enjoy the chaos.
            </motion.p>

            {/* Action Buttons (CTAs) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3.5 w-full sm:w-auto"
            >
              {/* Primary CTA */}
              <button
                type="button"
                onClick={handleBookDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[12px] bg-[#028051] hover:bg-[#03A066] active:bg-[#015033] text-white font-semibold text-base shadow-sm transition-all border border-[#03A066]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131413] cursor-pointer"
              >
                <span>Book a Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary CTA */}
              <button
                type="button"
                onClick={handleSeeAction}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-[12px] bg-[#1A1D1A] hover:bg-[#222622] active:bg-[#161816] text-[#EDEDED] font-medium text-base border border-[#282C28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] cursor-pointer"
              >
                <Play className="w-4 h-4 text-[#03A066] fill-[#03A066]" />
                <span>See it in Action</span>
              </button>
            </motion.div>

            {/* Concise Proof Statistics */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 pt-6 border-t border-[#242824] w-full"
            >
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-[#8C908C]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#03A066]" />
                  <strong className="text-white font-bold font-heading text-sm sm:text-base">
                    1,200+
                  </strong>
                  <span>organizers</span>
                </div>

                <span className="text-[#3A3F3A] hidden xs:inline">•</span>

                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#03A066]" />
                  <strong className="text-white font-bold font-heading text-sm sm:text-base">
                    25K+
                  </strong>
                  <span>hackers</span>
                </div>

                <span className="text-[#3A3F3A] hidden xs:inline">•</span>

                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#03A066]" />
                  <strong className="text-white font-bold font-heading text-sm sm:text-base">
                    80+
                  </strong>
                  <span>countries</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT COLUMN: Interactive Product UI Demo + Mascot   */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 relative z-10 mt-6 lg:mt-0" id="hero-demo-visual">
            
            {/* Mascot Robot positioned dynamically above/beside the demo */}
            <div className="absolute -top-12 sm:-top-16 right-4 sm:right-8 z-30 pointer-events-auto">
              <MascotRobot speechText={'Spreadsheets called.\nThey quit.'} />
            </div>

            {/* Decorative Pixel Grid Background Detail */}
            <div
              className="absolute -inset-3 bg-gradient-to-tr from-[#028051]/10 via-transparent to-transparent rounded-[20px] -z-10 border border-[#282C28]/40"
              aria-hidden="true"
            />

            {/* Dashboard Demo Component */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
              <OrganizerDashboardDemo />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

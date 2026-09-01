'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { MascotRobot } from '../MascotRobot';
import { HackerDashboardDemo } from '../demos/HackerDashboardDemo';
import {
  Compass,
  UserCheck,
  Users,
  Target,
  FileCheck,
  Radio,
  Eye,
  MessageSquare,
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export interface HackerExperienceSectionProps {
  className?: string;
}

export const HackerExperienceSection: React.FC<HackerExperienceSectionProps> = ({
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const hackerFeatures = [
    {
      num: '01',
      title: 'Discover hackathons',
      description: 'Find the right event and track.',
      icon: Compass,
    },
    {
      num: '02',
      title: 'Easy registration',
      description: 'Register without filling the same form three times.',
      icon: UserCheck,
    },
    {
      num: '03',
      title: 'Team formation',
      description: 'Find teammates and manage your team.',
      icon: Users,
    },
    {
      num: '04',
      title: 'Track & problem discovery',
      description: "Know exactly what you're building against.",
      icon: Target,
    },
    {
      num: '05',
      title: 'Submission management',
      description: 'Submit without deadline panic.',
      icon: FileCheck,
    },
    {
      num: '06',
      title: 'Submission status',
      description: 'Know what happens after you hit submit.',
      icon: Radio,
    },
    {
      num: '07',
      title: 'Transparent judging',
      description: 'Understand how your work is evaluated.',
      icon: Eye,
    },
    {
      num: '08',
      title: 'Judge feedback',
      description: 'See useful feedback from judges.',
      icon: MessageSquare,
    },
    {
      num: '09',
      title: 'Results & rankings',
      description: 'Results without mystery.',
      icon: Trophy,
    },
    {
      num: '10',
      title: 'Certificates',
      description: 'Proof that you survived.',
      icon: Award,
    },
  ];

  return (
    <section
      id="hackers"
      className="relative py-16 md:py-24 lg:py-32 overflow-hidden text-left bg-[#131413] border-t border-[#222622]"
      aria-label="Hacker and Contestant Experience"
    >
      {/* Background Ambient Glow (brand green only) */}
      <div
        className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#028051]/5 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-80 h-80 bg-[#028051]/5 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ==================================================== */}
        {/* SECTION HEADER: Core Message & Headlines             */}
        {/* ==================================================== */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          
          {/* Eyebrow */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] font-medium tracking-wider uppercase mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
            <span>FOR HACKERS</span>
          </motion.div>

          {/* Primary Headline */}
          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.12]"
          >
            They came to build.
            <br />
            <span className="relative inline-block text-white">
              Let them build.
              <Scribble
                variant="underline"
                color="#028051"
                className="absolute -bottom-2 left-0 w-full h-3 text-[#028051]"
              />
            </span>
          </motion.h2>

          {/* Supporting Subtitle */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg font-mono text-[#5EEAD4] font-semibold"
          >
            Less admin. More shipping.
          </motion.p>

          {/* Supporting Copy */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-3 text-base sm:text-lg text-[#A3A3A3] font-body leading-relaxed max-w-2xl"
          >
            Registration, teams, submissions, deadlines and results — without making hackers navigate another maze of forms and spreadsheets.
          </motion.p>
        </div>

        {/* ==================================================== */}
        {/* MAIN GRID: Mandatory Feature List + Product Demo     */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* LEFT: Complete 10-Item Hacker Feature List */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="mb-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#737373] font-bold">
                The Hacker Lifecycle Matrix
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {hackerFeatures.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.num}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="p-3 rounded-[10px] bg-[#161816] hover:bg-[#1A1D1A] border border-[#242824] hover:border-[#028051]/40 transition-all duration-150 flex items-start gap-3 group text-left"
                  >
                    <div className="w-8 h-8 rounded-[7px] bg-[#1F231F] border border-[#282C28] flex items-center justify-center font-mono text-[11px] font-bold text-[#03A066] group-hover:bg-[#028051] group-hover:text-white transition-colors shrink-0">
                      {feat.num}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-heading font-bold text-[#EDEDED] group-hover:text-white transition-colors">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-[#8C908C] font-body mt-0.5 leading-snug">
                        {feat.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Hacker Dashboard Demo & Mascot */}
          <div className="lg:col-span-7 relative z-10">
            
            {/* Mascot Robot Annotation */}
            <div className="absolute -top-12 sm:-top-14 right-4 sm:right-6 z-30 pointer-events-auto">
              <MascotRobot speechText={"Build stuff.\nWe'll handle the paperwork."} />
            </div>

            {/* Decorative Corner Framing */}
            <div
              className="absolute -inset-3 bg-gradient-to-br from-[#028051]/10 via-transparent to-transparent rounded-[20px] -z-10 border border-[#282C28]/40"
              aria-hidden="true"
            />

            {/* Product Demo */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <HackerDashboardDemo />
            </motion.div>
          </div>

        </div>

        {/* ==================================================== */}
        {/* BOTTOM INSIGHT: Visual Rest & Supporting Proof       */}
        {/* ==================================================== */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-16 lg:mt-24 p-5 rounded-[12px] bg-[#161816] border border-[#242824] flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#03A066] shrink-0 animate-pulse" />
            <p className="text-sm font-mono text-[#C2C6C2]">
              <strong className="text-white">Zero spreadsheet sync errors.</strong> Builders focus on code, architecture, and shipping.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#03A066] font-semibold shrink-0">
            <span>Automated Repo Verification Active</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

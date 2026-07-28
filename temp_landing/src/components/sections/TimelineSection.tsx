'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  Rocket,
  Users,
  UserCheck,
  UploadCloud,
  Award,
  Trophy,
  FileBadge,
  PieChart,
  CheckCircle2
} from 'lucide-react';

export function TimelineSection() {
  const steps = [
    { step: '01', title: 'Create Hackathon', icon: PlusCircle, desc: 'Setup branding, track categories, prize pools, and eligibility criteria in under 5 minutes.' },
    { step: '02', title: 'Launch Registrations', icon: Rocket, desc: 'Publish sleek custom event portal with automatic RSVP tracking and Discord role sync.' },
    { step: '03', title: 'Manage Teams', icon: Users, desc: 'Algorithmic AI team matching connects solo developers and balances team skillsets.' },
    { step: '04', title: 'Assign Mentors', icon: UserCheck, desc: 'Office hour booking system matches hacker teams with domain expert mentors.' },
    { step: '05', title: 'Project Submission', icon: UploadCloud, desc: 'Direct GitHub and Figma repository sync with live deployment links and video previews.' },
    { step: '06', title: 'AI-Powered Judging', icon: Award, desc: 'Bias-free rubric scoring, code originality verification, and weighted track evaluation.' },
    { step: '07', title: 'Live Leaderboard', icon: Trophy, desc: 'Reveal track winners live on stage with dynamic score reveals and confetti effects.' },
    { step: '08', title: 'Instant Certificates', icon: FileBadge, desc: 'Dispatch cryptographically verifiable digital certificates to all hackers and mentors.' },
    { step: '09', title: 'Executive Reports', icon: PieChart, desc: 'Export comprehensive post-event analytics, resume booklets, and sponsor ROI reports.' },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-mono text-accent tracking-widest uppercase px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            EVENT LIFECYCLE PIPELINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            From zero to grand finale. <br />
            <span className="text-gradient-accent">In total sync.</span>
          </h2>
          <p className="text-muted text-base sm:text-lg">
            Follow the 9 automated stages of a modern hackathon powered by AlmostHack.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Connecting Glow Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-accent via-blue-500 to-emerald-500 hidden md:block opacity-40" />

          <div className="space-y-12">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isEven = idx % 2 === 0;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Text Card */}
                  <div className="w-full md:w-1/2">
                    <div className="p-6 rounded-2xl bg-surface border border-white/10 glass-card-hover glass-card space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-accent px-2.5 py-0.5 rounded bg-accent/10 border border-accent/20">
                          STAGE {item.step}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight">{item.title}</h3>
                      <p className="text-xs text-muted leading-relaxed font-sans">{item.desc}</p>
                    </div>
                  </div>

                  {/* Center Node Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-accent border-2 border-white/20 flex items-center justify-center text-white shadow-xl shadow-accent/30 z-10 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Empty Spacer Column for Desktop Symmetry */}
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

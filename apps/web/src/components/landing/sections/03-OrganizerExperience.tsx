'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Trophy,
  Rocket,
  Clock,
  Check,
} from 'lucide-react';

export const OrganizerExperienceSection: React.FC = () => {
  const organizerPoints = [
    'Real-time event overview',
    'Registration & team management',
    'Submission tracking',
    'Judge assignments',
    'Integrity monitoring',
    'Results & rankings',
    'Certificates & announcements',
  ];

  return (
    <section id="organizers" className="relative py-20 lg:py-28 bg-[#0B0D0C] border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: FOR ORGANIZERS */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#111412] border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
            <div className="space-y-4">
              <div className="text-[11px] font-mono tracking-widest text-[#A8E63B] uppercase font-semibold">
                FOR ORGANIZERS
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Complete control. <br /> Zero spreadsheet chaos.
              </h3>

              {/* Checklist */}
              <div className="space-y-2.5 pt-2">
                {organizerPoints.map((point) => (
                  <div key={point} className="flex items-start gap-2 text-xs sm:text-[13px] text-[#A7AEA7]">
                    <CheckCircle2 className="w-4 h-4 text-[#A8E63B] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Graphic & CTA */}
            <div className="mt-8 space-y-5">
              {/* Graphic: Pie / Metrics preview */}
              <div className="p-4 rounded-xl bg-[#0B0D0C]/90 border border-white/[0.06] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-[#737A73]">TRACK DISTRIBUTION</div>
                  <div className="text-xs font-semibold text-white">AI (42%) • Web3 (38%) • Infra (20%)</div>
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-[#028051] border-t-[#A8E63B] border-r-[#A8E63B]/50" />
              </div>

              <Link
                href="/hackathons/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#151917] text-[#A8E63B] border border-[#A8E63B]/30 hover:bg-[#A8E63B] hover:text-black transition-all w-full justify-center group-hover:shadow-[0_0_15px_rgba(168,230,59,0.2)]"
              >
                <span>Explore Organizer Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: FOR JUDGES */}
          <div id="judges" className="p-6 sm:p-7 rounded-2xl bg-[#111412] border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
            <div className="space-y-4">
              <div className="text-[11px] font-mono tracking-widest text-purple-400 uppercase font-semibold">
                FOR JUDGES
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Spend less time managing submissions. More time judging them.
              </h3>

              {/* Visual Card Mockup */}
              <div className="p-4 rounded-xl bg-[#0B0D0C]/90 border border-white/[0.08] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div>
                    <div className="text-[10px] text-[#737A73]">ASSIGNED TO YOU</div>
                    <div className="text-xs font-bold text-white">12 submissions</div>
                  </div>
                  <div className="text-[10px] text-right">
                    <span className="text-[#A8E63B]">7 completed</span> <br />
                    <span className="text-amber-400">5 remaining</span>
                  </div>
                </div>

                <div className="text-[11px] font-sans font-semibold text-[#F5F7F4]">
                  Team Alpha — CodeFlow
                </div>

                <div className="space-y-1.5 text-[11px] text-[#A7AEA7]">
                  <div className="flex justify-between">
                    <span>Innovation</span>
                    <span className="text-white font-bold">8 / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Execution</span>
                    <span className="text-white font-bold">9 / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impact</span>
                    <span className="text-white font-bold">8 / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Presentation</span>
                    <span className="text-white font-bold">9 / 10</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-white/[0.06] text-white font-bold">
                    <span>Total</span>
                    <span className="text-[#A8E63B]">34 / 40</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="#transparent-judging"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#151917] text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all w-full justify-center"
              >
                <span>See the Judge Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: FOR HACKERS */}
          <div id="hackers" className="p-6 sm:p-7 rounded-2xl bg-[#111412] border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
            <div className="space-y-4">
              <div className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                FOR HACKERS
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Know exactly <br /> what to do next.
              </h3>

              {/* Visual Hacker Status Mockup */}
              <div className="p-4 rounded-xl bg-[#0B0D0C]/90 border border-white/[0.08] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="font-sans font-bold text-white">Build India 2026</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#A8E63B]/10 text-[#A8E63B] border border-[#A8E63B]/30">
                    LIVE
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#A7AEA7]">
                  <span>Submission deadline</span>
                  <span className="font-bold text-amber-300">18h 42m</span>
                </div>

                {/* Milestones Stepper */}
                <div className="space-y-2 pt-1 font-sans text-xs">
                  <div className="flex items-center gap-2 text-[#A8E63B]">
                    <div className="w-4 h-4 rounded-full bg-[#A8E63B]/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#A8E63B]" />
                    </div>
                    <span className="font-medium text-white">Registration</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A8E63B]">
                    <div className="w-4 h-4 rounded-full bg-[#A8E63B]/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#A8E63B]" />
                    </div>
                    <span className="font-medium text-white">Team</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A8E63B]">
                    <div className="w-4 h-4 rounded-full bg-[#A8E63B]/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#A8E63B]" />
                    </div>
                    <span className="font-medium text-white">Repository</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center">
                      <Clock className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="font-medium text-white">Submission</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#151917] text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all w-full justify-center"
              >
                <span>Explore Hacker Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

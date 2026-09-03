'use client';

import React from 'react';
import {
  Settings2,
  UserPlus2,
  Code2,
  Scale,
  Award,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create',
      desc: 'Set up your hackathon, tracks, rules and judging criteria.',
      icon: Settings2,
    },
    {
      num: '02',
      title: 'Invite',
      desc: 'Participants register, form teams and choose their track.',
      icon: UserPlus2,
    },
    {
      num: '03',
      title: 'Build',
      desc: 'Teams connect GitHub, build their projects and submit.',
      icon: Code2,
    },
    {
      num: '04',
      title: 'Judge',
      desc: 'Judges review projects using your defined evaluation criteria.',
      icon: Scale,
    },
    {
      num: '05',
      title: 'Publish',
      desc: 'Finalize results, publish rankings and issue certificates.',
      icon: Award,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 lg:py-28 bg-[#0B0D0C] border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Title */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <div className="text-[11px] font-mono tracking-widest text-[#A8E63B] uppercase font-semibold">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              From idea to final results.
            </h2>
          </div>

          {/* Right 5-Step Connected Timeline */}
          <div className="lg:col-span-9 relative">
            {/* Desktop Horizontal Line */}
            <div className="hidden lg:block absolute top-6 left-8 right-8 h-0.5 bg-gradient-to-r from-[#028051] via-[#A8E63B] to-[#028051] opacity-30 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="flex flex-col items-start group">
                    {/* Step Icon Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-[#151917] border border-white/10 flex items-center justify-center text-[#A8E63B] shadow-md group-hover:border-[#A8E63B]/50 group-hover:scale-105 transition-all">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-sm font-bold text-[#A8E63B]">{step.num}</span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-[#A8E63B] transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-xs text-[#A7AEA7] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

'use client';

import React from 'react';
import {
  CalendarDays,
  Users2,
  GitPullRequest,
  Sparkles,
  BarChart3,
  Award,
} from 'lucide-react';

export const OrganizerFeaturesSection: React.FC = () => {
  const features = [
    {
      icon: CalendarDays,
      title: 'Hackathon Management',
      description: "Create your event, define rules, configure tracks and launch when you're ready.",
      visual: (
        <div className="mt-4 p-2.5 rounded-lg bg-[#0B0D0C]/80 border border-white/[0.06] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[#A7AEA7]">
            <span>Tracks Configured</span>
            <span className="text-[#A8E63B]">4 Active</span>
          </div>
          <div className="flex gap-1">
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] text-white">AI / ML</span>
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] text-white">Web3</span>
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] text-white">Fintech</span>
          </div>
        </div>
      ),
    },
    {
      icon: Users2,
      title: 'Registrations & Teams',
      description: 'Manage participants, teams, invites and participation from one place.',
      visual: (
        <div className="mt-4 p-2.5 rounded-lg bg-[#0B0D0C]/80 border border-white/[0.06] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[#A7AEA7]">
            <span>Team Auto-Formation</span>
            <span className="text-[#A8E63B]">Enabled</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#737A73]">
            <span className="w-2 h-2 rounded-full bg-[#A8E63B]" />
            <span>312 verified teams formed</span>
          </div>
        </div>
      ),
    },
    {
      icon: GitPullRequest,
      title: 'GitHub & Submissions',
      description: 'Connect repositories, track projects and collect structured submissions.',
      visual: (
        <div className="mt-4 p-2.5 rounded-lg bg-[#0B0D0C]/80 border border-white/[0.06] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[#A7AEA7]">
            <span>Git Commit Auditing</span>
            <span className="text-[#A8E63B]">100% Synced</span>
          </div>
          <div className="text-[10px] text-[#737A73] truncate">
            commit: <span className="text-white">a8f29c1</span> (during event window)
          </div>
        </div>
      ),
    },
    {
      icon: Sparkles,
      title: 'Judging',
      description: 'Give judges everything they need to evaluate projects consistently and fairly.',
      visual: (
        <div className="mt-4 p-2.5 rounded-lg bg-[#0B0D0C]/80 border border-white/[0.06] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[#A7AEA7]">
            <span>Rubric Consensus</span>
            <span className="text-[#A8E63B]">Double-Blind</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="w-[85%] h-full bg-[#A8E63B] rounded-full" />
            </div>
            <span className="text-[9px] text-white">34/40</span>
          </div>
        </div>
      ),
    },
    {
      icon: BarChart3,
      title: 'Transparent Results',
      description: 'Make scores, feedback and results clearer for participants.',
      visual: (
        <div className="mt-4 p-2.5 rounded-lg bg-[#0B0D0C]/80 border border-white/[0.06] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[#A7AEA7]">
            <span>Leaderboard Consensus</span>
            <span className="text-[#A8E63B]">Published</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#737A73]">
            <span>#1 Team Alpha</span>
            <span className="text-white font-bold">92.4 pts</span>
          </div>
        </div>
      ),
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Recognize participants, winners and contributors with verifiable certificates.',
      visual: (
        <div className="mt-4 p-2.5 rounded-lg bg-[#0B0D0C]/80 border border-white/[0.06] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[#A7AEA7]">
            <span>Verifiable Credentials</span>
            <span className="text-[#A8E63B]">✓ Cryptographic</span>
          </div>
          <div className="text-[10px] text-[#737A73] truncate">
            ID: <span className="text-white">AH-2026-7X34B</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="relative py-20 lg:py-28 bg-[#0B0D0C] border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 text-center">
        {/* Section Eyebrow & Title */}
        <div className="space-y-3 mb-14">
          <div className="text-[11px] font-mono tracking-widest text-[#A8E63B] uppercase font-semibold">
            ONE PLATFORM. EVERY HACKATHON.
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Everything you need to run the event.
          </h2>
        </div>

        {/* 6 Feature Cards (3x2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-[#111412] border border-white/[0.08] hover:border-white/20 hover:bg-[#151917] transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#151917] border border-white/10 flex items-center justify-center text-[#A8E63B] mb-4 group-hover:scale-105 group-hover:bg-[#1f2622] group-hover:border-[#A8E63B]/40 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#A8E63B] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#A7AEA7] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {feature.visual}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

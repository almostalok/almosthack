'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { OrganizerDashboardPreview } from '../OrganizerDashboardPreview';

interface HeroSectionProps {
  onBookDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookDemo }) => {
  const integrations = [
    {
      name: 'GitHub',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
    {
      name: 'Google',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      ),
    },
    {
      name: 'Discord',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#5865F2">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.01c3.931 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.195.373.288a.077.077 0 0 1-.006.127c-.598.35-1.22.648-1.873.891-.041.016-.062.066-.041.107.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      name: 'Docker',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#0db7ed">
          <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.714h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186H8.1a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185M23.76 11.23c-.347-.215-1.04-.3-1.637-.058-.088-.475-.38-.89-.877-1.127-.893-.427-1.99-.08-2.527.755-.388-.135-.8-.182-1.226-.145-.733.064-1.424.398-1.928.927H.947a.787.787 0 00-.785.786c0 1.27.18 2.53.535 3.75 1.077 3.702 3.864 6.388 7.644 6.726 1.45.13 2.91.036 4.343-.28 3.593-.794 6.638-3.076 8.35-6.26.195-.362.483-.787.726-1.2.775-.246 1.83-.82 2-1.917v-.002z" />
        </svg>
      ),
    },
    {
      name: 'APIs',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
  ];

  return (
    <section id="hero" className="relative w-full pt-28 sm:pt-36 pb-20 overflow-hidden">
      {/* Official Landscape Artwork Background */}
      <div className="absolute inset-0 z-0 h-[1050px] sm:h-[1150px] lg:h-[1250px]">
        <Image
          src="/bg-landscape.jpg"
          alt="AlmostHack Visual Landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-90 select-none pointer-events-none"
        />
        {/* Soft top radial vignette for crystal-clear text readability over sky */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(5,7,6,0.50)_0%,rgba(5,7,6,0.15)_50%,transparent_80%)]" />
        {/* Soft bottom vignette fading cleanly into #050706 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050706]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050706] to-transparent" />
      </div>

      {/* Centered Hero Content Container */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Centered Copy Stack */}
        <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0D0B]/85 backdrop-blur-md border border-white/10 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#9AA29A] uppercase shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8E63B]" />
            <span>THE HACKATHON OPERATING SYSTEM</span>
            <span className="text-[#A8E63B]">✦</span>
          </div>

          {/* Centered Large Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[76px] xl:text-[84px] font-extrabold text-white tracking-tight leading-[0.98] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            Run Hackathons. <br />
            Without the <span className="text-[#A8E63B] drop-shadow-[0_0_20px_rgba(168,230,59,0.35)]">Chaos.</span>
          </h1>

          {/* Subtitle with high contrast */}
          <p className="text-base sm:text-lg text-[#F5F7F3]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] leading-relaxed max-w-2xl mx-auto pt-1 font-medium">
            One platform to create, manage, judge and run your entire hackathon — from the first
            registration to the final result.
          </p>

          {/* Centered Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/hackathons/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#A8E63B] text-[#050706] hover:bg-[#bcf05b] hover:shadow-[0_0_20px_rgba(168,230,59,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
            >
              <span>Create a Hackathon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="#pipeline"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#0E1210]/90 text-white border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all backdrop-blur-md shadow-lg"
            >
              <span>Explore the Platform</span>
            </a>
          </div>

          {/* Centered Social Proof */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-[#028051] border-2 border-[#050706] flex items-center justify-center text-[9px] font-bold text-white shadow">
                JD
              </div>
              <div className="w-6 h-6 rounded-full bg-[#274535] border-2 border-[#050706] flex items-center justify-center text-[9px] font-bold text-[#A8E63B] shadow">
                AS
              </div>
              <div className="w-6 h-6 rounded-full bg-[#121713] border-2 border-[#050706] flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-white/10 shadow">
                KL
              </div>
              <div className="w-6 h-6 rounded-full bg-[#A8E63B] border-2 border-[#050706] flex items-center justify-center text-[9px] font-bold text-black shadow">
                +
              </div>
            </div>
            <span className="text-xs text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-medium">
              Built for organizers. Loved by hackers.
            </span>
          </div>
        </div>

        {/* Centered Large Dashboard Mockup */}
        <div className="mt-10 sm:mt-12 max-w-[980px] mx-auto w-full">
          <OrganizerDashboardPreview />
        </div>

        {/* Centered Integration Strip */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-2.5">
          <div className="text-[11px] text-[#737A73] tracking-wider font-medium">
            Connect the tools your teams already use.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-[#0E1210]/90 backdrop-blur-xl border border-white/10 shadow-lg">
            {integrations.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/15 transition-all cursor-default text-xs text-[#F5F7F3]"
              >
                <div className="text-[#9AA29A]">{tool.icon}</div>
                <span className="font-medium text-[11px]">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

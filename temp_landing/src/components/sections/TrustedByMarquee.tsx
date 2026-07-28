'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, GraduationCap, Globe2, Rocket, Cpu, ShieldCheck } from 'lucide-react';

export function TrustedByMarquee() {
  const partners = [
    { name: 'MIT Innovation Lab', icon: GraduationCap, category: 'University' },
    { name: 'Y Combinator Events', icon: Rocket, category: 'Accelerator' },
    { name: 'Stanford Hackers', icon: GraduationCap, category: 'University' },
    { name: 'Devfolio Network', icon: Globe2, category: 'Community' },
    { name: 'Google Cloud for Startups', icon: Cpu, category: 'Enterprise' },
    { name: 'AWS Builder Series', icon: Building2, category: 'Enterprise' },
    { name: 'ETHGlobal Community', icon: Globe2, category: 'Web3' },
    { name: 'Techstars Incubator', icon: Rocket, category: 'Incubator' },
    { name: 'Government Innovation Hub', icon: ShieldCheck, category: 'Government' },
  ];

  return (
    <section className="py-12 border-y border-white/10 bg-surface/50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <p className="text-xs font-mono tracking-widest uppercase text-white/40">
          Trusted by leading universities, communities, companies & government programs worldwide
        </p>
      </div>

      {/* Infinite Ticker Container */}
      <div className="flex overflow-hidden select-none mask-fade">
        <div className="flex min-w-full shrink-0 items-center justify-around gap-12 animate-marquee">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-accent/20 group-hover:text-accent transition-colors border border-white/5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold tracking-tight text-white/80 group-hover:text-white">
                    {partner.name}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">{partner.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Duplicate Ticker for Seamless Loop */}
        <div className="flex min-w-full shrink-0 items-center justify-around gap-12 animate-marquee" aria-hidden="true">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={`dup-${partner.name}-${index}`}
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-accent/20 group-hover:text-accent transition-colors border border-white/5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold tracking-tight text-white/80 group-hover:text-white">
                    {partner.name}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">{partner.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

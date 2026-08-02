'use client';

import React from 'react';
import { GraduationCap, Globe2, Rocket, Cpu, Building2, ShieldCheck } from 'lucide-react';

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
    <section className="py-12 border-y-2 border-[#0D3A29] bg-[#F5F8F0] text-[#072419] relative overflow-hidden select-none transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <p className="text-xs font-mono font-bold tracking-widest uppercase text-[#557365]">
          TRUSTED BY 10,000+ BRANDS, UNIVERSITIES &amp; ENTERPRISE ORGANIZERS
        </p>
      </div>

      {/* Ticker Container */}
      <div className="relative flex overflow-hidden">
        
        {/* Left / Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F5F8F0] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F5F8F0] to-transparent z-10 pointer-events-none" />

        <div className="flex min-w-full shrink-0 items-center justify-around gap-12 animate-marquee">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center gap-3 text-[#072419] hover:text-[#0D3A29] transition-colors cursor-pointer group"
              >
                <div className="p-2.5 rounded-xl bg-white border-2 border-[#0D3A29] group-hover:bg-[#ABFF44] transition-all shadow-[ -2px_2px_0_0_#0D3A29]">
                  <Icon className="w-4 h-4 text-[#072419]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold tracking-tight text-[#072419] font-display">
                    {partner.name}
                  </span>
                  <span className="text-[9px] font-mono text-[#557365] font-semibold">{partner.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loop Duplicate */}
        <div className="flex min-w-full shrink-0 items-center justify-around gap-12 animate-marquee" aria-hidden="true">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={`dup-${partner.name}-${index}`}
                className="flex items-center gap-3 text-[#072419] hover:text-[#0D3A29] transition-colors cursor-pointer group"
              >
                <div className="p-2.5 rounded-xl bg-white border-2 border-[#0D3A29] group-hover:bg-[#ABFF44] transition-all shadow-[ -2px_2px_0_0_#0D3A29]">
                  <Icon className="w-4 h-4 text-[#072419]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold tracking-tight text-[#072419] font-display">
                    {partner.name}
                  </span>
                  <span className="text-[9px] font-mono text-[#557365] font-semibold">{partner.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

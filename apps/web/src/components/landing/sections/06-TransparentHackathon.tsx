'use client';

import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Quote } from 'lucide-react';

export const TransparentHackathonSection: React.FC = () => {
  return (
    <section id="transparent-judging" className="relative py-20 lg:py-28 bg-[#0B0D0C] border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Copy & Link */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="text-[11px] font-mono tracking-widest text-[#A8E63B] uppercase font-semibold">
              TRANSPARENT BY DESIGN
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Judging shouldn&apos;t feel like a black box.
            </h2>

            <p className="text-sm text-[#A7AEA7] leading-relaxed">
              Give participants meaningful visibility into how their projects were evaluated — while
              keeping private judge information protected.
            </p>

            <div className="pt-2">
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A8E63B] hover:text-[#bcf05b] transition-colors group"
              >
                <span>See Transparent Judging</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Center Graphic: Layered Glass Shield */}
          <div className="lg:col-span-3 flex justify-center py-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Layer 3 back */}
              <div className="absolute w-32 h-36 rounded-2xl bg-white/[0.02] border border-white/10 transform translate-x-4 -translate-y-4 backdrop-blur-sm" />
              {/* Layer 2 mid */}
              <div className="absolute w-32 h-36 rounded-2xl bg-white/[0.04] border border-white/15 transform translate-x-2 -translate-y-2 backdrop-blur-md" />
              {/* Layer 1 front */}
              <div className="relative w-32 h-36 rounded-2xl bg-[#151917]/90 border border-[#028051] flex items-center justify-center shadow-[0_0_30px_rgba(2,128,81,0.3)] backdrop-blur-xl">
                <ShieldCheck className="w-14 h-14 text-[#A8E63B]" />
              </div>
            </div>
          </div>

          {/* Right Cards: Evaluation Breakdown + Status + Testimonial */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Score Breakdown Card */}
            <div className="sm:col-span-1 lg:col-span-7 p-4 rounded-xl bg-[#111412] border border-white/[0.08] shadow-xl space-y-2.5 font-mono text-xs">
              <div className="text-xs font-sans font-bold text-white pb-1.5 border-b border-white/[0.06]">
                Your Evaluation
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

            {/* Status & Testimonial Column */}
            <div className="sm:col-span-1 lg:col-span-5 flex flex-col gap-3">
              {/* Status Badge Card */}
              <div className="p-3.5 rounded-xl bg-[#111412] border border-white/[0.08] shadow-xl text-center space-y-1">
                <div className="text-2xl font-bold font-mono text-white">4 / 4</div>
                <div className="text-[11px] text-[#737A73]">evaluations complete</div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#A8E63B]/10 text-[#A8E63B] border border-[#A8E63B]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A8E63B]" />
                    Published
                  </span>
                </div>
              </div>

              {/* Quote Card */}
              <div className="p-3.5 rounded-xl bg-[#111412] border border-white/[0.08] shadow-xl space-y-1.5">
                <div className="text-[#A8E63B] text-xl font-serif leading-none">“</div>
                <p className="text-[11px] text-[#A7AEA7] italic leading-snug">
                  AlmostHack transformed how we run our hackathons. It&apos;s powerful and loved by our
                  community.
                </p>
                <div className="text-[10px] font-medium text-white pt-1">
                  — Ananya Sharma, DevFest India
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

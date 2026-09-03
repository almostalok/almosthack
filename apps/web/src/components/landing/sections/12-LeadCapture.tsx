'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageSquare, Flag } from 'lucide-react';

interface LeadCaptureSectionProps {
  onSuccessDemo?: () => void;
}

export const LeadCaptureSection: React.FC<LeadCaptureSectionProps> = ({ onSuccessDemo }) => {
  return (
    <section className="relative py-16 lg:py-24 bg-[#0B0D0C]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Rounded Banner Container with Landscape Background */}
        <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl p-8 sm:p-12 lg:p-14 min-h-[280px] flex items-center">
          {/* Exact Landscape Background Asset */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/bg-landscape.jpg"
              alt="AlmostHack Landscape Environment"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-bottom opacity-70 select-none pointer-events-none"
            />
            {/* Dark Atmosphere Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D0C]/95 via-[#0B0D0C]/80 to-[#0B0D0C]/90" />
            <div className="absolute inset-0 bg-[#0B0D0C]/40" />
          </div>

          {/* Banner Content Layout */}
          <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-3 text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Ready to run your <br />
                <span className="text-[#A8E63B]">best hackathon</span> yet?
              </h2>

              <p className="text-sm sm:text-base text-[#A7AEA7] leading-relaxed max-w-xl">
                Replace spreadsheets, scattered tools and judging chaos with one operational workspace.
              </p>
            </div>

            {/* Right Action Buttons & Flag Graphic */}
            <div className="lg:col-span-5 flex flex-wrap items-center justify-start lg:justify-end gap-3.5">
              <Link
                href="/hackathons/new"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-[#A8E63B] text-[#0B0D0C] hover:bg-[#bcf05b] hover:shadow-[0_0_25px_rgba(168,230,59,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Create a Hackathon</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={onSuccessDemo}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium bg-[#151917]/90 text-white border border-white/15 hover:bg-white/[0.08] hover:border-white/25 transition-all backdrop-blur-md"
              >
                <MessageSquare className="w-4 h-4 text-[#A8E63B]" />
                <span>Talk to Us</span>
              </button>

              {/* AlmostHack Flag Insignia */}
              <div className="hidden xl:flex items-center justify-center w-12 h-12 rounded-2xl bg-[#141815] border border-white/10 text-[#A8E63B] shadow-lg ml-2">
                <Flag className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

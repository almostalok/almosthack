'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      className="bg-[#0E100E] border-t border-[#222622] text-[#EDEDED] font-body text-left select-none relative z-10"
      aria-label="AlmostHack Footer"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-20 lg:py-28">
        
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-[10px] bg-[#028051] flex items-center justify-center font-heading font-extrabold text-base text-white shadow-sm group-hover:bg-[#03A066] transition-colors border border-[#03A066]/50">
                AH
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white leading-none">
                  almosthack
                </span>
                <span className="text-[11px] font-mono text-[#737373] tracking-wider uppercase mt-1">
                  hackathon operating system
                </span>
              </div>
            </Link>

            <p className="text-sm font-body text-[#8C908C] leading-relaxed max-w-sm">
              The verifiably fair, auditable, and automated operating system for hackathon organizers, judges, and builders.
            </p>

            <div className="pt-2 flex items-center gap-2.5 text-xs font-mono text-[#03A066]">
              <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
              <span>All Systems Operational • v1.4 Mainnet</span>
            </div>
          </div>

          {/* Column 1: PRODUCT */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm font-body text-[#A3A3A3]">
              <li>
                <a href="#organizer-experience" onClick={(e) => handleScrollTo(e, '#organizer-experience')} className="hover:text-white transition-colors">
                  For Organizers
                </a>
              </li>
              <li>
                <a href="#hackers" onClick={(e) => handleScrollTo(e, '#hackers')} className="hover:text-white transition-colors">
                  For Hackers
                </a>
              </li>
              <li>
                <a href="#dashboard-deep-dive" onClick={(e) => handleScrollTo(e, '#dashboard-deep-dive')} className="hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#features" onClick={(e) => handleScrollTo(e, '#features')} className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#transparency" onClick={(e) => handleScrollTo(e, '#transparency')} className="hover:text-white transition-colors">
                  Transparency Engine
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: RESOURCES */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm font-body text-[#A3A3A3]">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Organizer Guide</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Help Center</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Rubric Templates</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Webinars</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Engineering Blog</span>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm font-body text-[#A3A3A3]">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">About AlmostHack</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Careers</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Contact Us</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
              </li>
            </ul>
          </div>

          {/* Column 4: SOCIAL */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Community
            </h4>
            <ul className="space-y-2.5 text-sm font-body text-[#A3A3A3]">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#737373]" />
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#737373]" />
                </a>
              </li>
              <li>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>X (Twitter)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#737373]" />
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>YouTube</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#737373]" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="mt-16 pt-8 border-t border-[#222622] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#737373]">
          <div>
            &copy; {new Date().getFullYear()} AlmostHack. Run hackathons. Easy.
          </div>
          <div className="flex items-center gap-8">
            <Link href="/overview" className="hover:text-[#EDEDED] transition-colors">
              Platform Console
            </Link>
            <Link href="/login" className="hover:text-[#EDEDED] transition-colors">
              Organizer Sign In
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

'use client';

import React from 'react';
import { Github, Twitter, Linkedin, MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#051C14] border-t-2 border-[#0D3A29] py-16 text-xs text-[#789887] select-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-7 h-5 text-[#ABFF44]"
                viewBox="0 0 48 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M24.3 23.3 L33.4 23.3" stroke="#ABFF44" />
                  <path d="M9.5 12.4 L14.5 6.5 L24.3 23.3" />
                  <path d="M27.1 12.4 L32.86 6.5 L38.4 12.4" />
                </g>
              </svg>
              <span className="text-lg font-extrabold text-white tracking-tight font-display">almosthack</span>
            </div>
            <p className="text-xs text-[#789887] max-w-sm leading-relaxed font-sans font-medium">
              The AI platform to create and optimize hackathons. So experience-makers can do the work they love.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-xl bg-[#0D3A29] border border-[#0D3A29] hover:bg-[#ABFF44] hover:text-[#072419] text-white transition-all shadow-sm">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-[#0D3A29] border border-[#0D3A29] hover:bg-[#ABFF44] hover:text-[#072419] text-white transition-all shadow-sm">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-[#0D3A29] border border-[#0D3A29] hover:bg-[#ABFF44] hover:text-[#072419] text-white transition-all shadow-sm">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-[#0D3A29] border border-[#0D3A29] hover:bg-[#ABFF44] hover:text-[#072419] text-white transition-all shadow-sm">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 font-mono">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-[#ABFF44] transition-colors font-semibold">Platform Features</a></li>
              <li><a href="#manifesto" className="hover:text-[#ABFF44] transition-colors font-semibold">The Manifesto</a></li>
              <li><a href="#feedback" className="hover:text-[#ABFF44] transition-colors font-semibold">Social Proof</a></li>
              <li><a href="#pricing" className="hover:text-[#ABFF44] transition-colors font-semibold">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Use Cases */}
          <div className="space-y-3 font-mono">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Use Cases</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#ABFF44] transition-colors font-semibold">Colleges &amp; Universities</a></li>
              <li><a href="#" className="hover:text-[#ABFF44] transition-colors font-semibold">Developer Communities</a></li>
              <li><a href="#" className="hover:text-[#ABFF44] transition-colors font-semibold">Incubators &amp; Accelerators</a></li>
              <li><a href="#" className="hover:text-[#ABFF44] transition-colors font-semibold">Enterprise Hackathons</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3 font-mono">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Legal &amp; Trust</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#ABFF44] transition-colors font-semibold">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#ABFF44] transition-colors font-semibold">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#ABFF44] transition-colors font-semibold">Security Overview</a></li>
              <li><a href="#" className="hover:text-[#ABFF44] transition-colors font-semibold">Status Page</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t-2 border-[#0D3A29] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#789887] font-mono font-bold">
          <div>© 2026 AlmostHack Inc. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ABFF44] animate-pulse" />
            All Systems Operational • v2.4.0
          </div>
        </div>
      </div>
    </footer>
  );
}

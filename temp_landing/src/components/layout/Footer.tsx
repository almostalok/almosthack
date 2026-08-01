'use client';

import React from 'react';
import { Github, Twitter, Linkedin, MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full mac-nav-bg border-t mac-border py-16 text-xs mac-text-muted select-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-7 h-5 mac-text-main"
                viewBox="0 0 48 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M24.3 23.3 L33.4 23.3" stroke="#00F0FF" />
                  <path d="M9.5 12.4 L14.5 6.5 L24.3 23.3" />
                  <path d="M27.1 12.4 L32.86 6.5 L38.4 12.4" />
                </g>
              </svg>
              <span className="text-lg font-bold mac-text-main tracking-tight font-display">almosthack</span>
            </div>
            <p className="text-xs mac-text-muted max-w-sm leading-relaxed font-sans">
              an ai buddy &amp; evaluation engine for your hackathon. from registration to instant certificates—everything unified in one desktop OS interface.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-lg mac-pill-bg hover:opacity-80 mac-text-muted transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg mac-pill-bg hover:opacity-80 mac-text-muted transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg mac-pill-bg hover:opacity-80 mac-text-muted transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg mac-pill-bg hover:opacity-80 mac-text-muted transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 font-mono">
            <h4 className="font-bold mac-text-main text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:mac-text-main transition-colors">Platform Features</a></li>
              <li><a href="#manifesto" className="hover:mac-text-main transition-colors">The Dream Notes</a></li>
              <li><a href="#feedback" className="hover:mac-text-main transition-colors">Feedback Wall</a></li>
              <li><a href="#pricing" className="hover:mac-text-main transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Use Cases */}
          <div className="space-y-3 font-mono">
            <h4 className="font-bold mac-text-main text-xs uppercase tracking-wider">Use Cases</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:mac-text-main transition-colors">Colleges &amp; Universities</a></li>
              <li><a href="#" className="hover:mac-text-main transition-colors">Developer Communities</a></li>
              <li><a href="#" className="hover:mac-text-main transition-colors">Incubators &amp; Accelerators</a></li>
              <li><a href="#" className="hover:mac-text-main transition-colors">Enterprise Hackathons</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3 font-mono">
            <h4 className="font-bold mac-text-main text-xs uppercase tracking-wider">Legal &amp; Trust</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:mac-text-main transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:mac-text-main transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:mac-text-main transition-colors">Security Overview</a></li>
              <li><a href="#" className="hover:mac-text-main transition-colors">Status Page</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t mac-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] mac-text-muted font-mono">
          <div>© 2026 AlmostHack Inc. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All Systems Operational • v2.4.0
          </div>
        </div>
      </div>
    </footer>
  );
}

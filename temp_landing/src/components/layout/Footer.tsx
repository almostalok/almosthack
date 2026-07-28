'use client';

import React from 'react';
import { Zap, Github, Twitter, Linkedin, MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#030407] border-t border-white/10 py-16 text-xs text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AlmostHack</span>
            </div>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed">
              The Modern Operating System for Hackathons. From registration to instant certificates—everything unified in one platform.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Platform Features</a></li>
              <li><a href="#interactive-demo" className="hover:text-white transition-colors">Interactive OS</a></li>
              <li><a href="#ai-engine" className="hover:text-white transition-colors">AI Engine Suite</a></li>
              <li><a href="#certificates" className="hover:text-white transition-colors">Certificate Builder</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Use Cases */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">Use Cases</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Colleges & Universities</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Developer Communities</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Incubators & Accelerators</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise Hackathons</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Government Innovation</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">Legal & Trust</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Overview</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SOC2 Compliance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
          <div>© 2026 AlmostHack Inc. All rights reserved.</div>
          <div className="font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All Systems Operational • v2.4.0
          </div>
        </div>
      </div>
    </footer>
  );
}

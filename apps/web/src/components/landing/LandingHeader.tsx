'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight, Menu, X, Sparkles } from 'lucide-react';

interface LandingHeaderProps {
  onBookDemo?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onBookDemo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      label: 'Product',
      hasDropdown: true,
      items: [
        { label: 'Overview', href: '#hero', desc: 'The entire hackathon OS' },
        { label: 'Pipeline & Workflow', href: '#pipeline', desc: 'End-to-end operational flow' },
        { label: 'Features Matrix', href: '#features', desc: 'All platform capabilities' },
        { label: 'Command Center', href: '#command-center', desc: 'Real-time telemetry & controls' },
      ],
    },
    {
      label: 'For Organizers',
      hasDropdown: true,
      items: [
        { label: 'Organizer Workspace', href: '#organizers', desc: 'Complete control without spreadsheets' },
        { label: 'Team Management', href: '#pipeline', desc: 'Auto-formation & invite links' },
        { label: 'Audit Logs & Integrity', href: '#pipeline', desc: 'Git commit audit trails' },
      ],
    },
    {
      label: 'For Judges',
      hasDropdown: true,
      items: [
        { label: 'Judge Scoring Portal', href: '#judges', desc: 'Distraction-free rubrics' },
        { label: 'Double-Blind Evaluation', href: '#judges', desc: 'Fair, unbiased consensus' },
        { label: 'Transparent Judging', href: '#transparent-judging', desc: 'Explainable scorecards' },
      ],
    },
    {
      label: 'For Hackers',
      hasDropdown: true,
      items: [
        { label: 'Hacker Experience', href: '#hackers', desc: 'Know exactly what to do next' },
        { label: 'GitHub Submission', href: '#hackers', desc: 'Automatic repo sync & milestones' },
        { label: 'Verifiable Certificates', href: '#certificates', desc: 'Cryptographic credentials' },
      ],
    },
    {
      label: 'Resources',
      hasDropdown: true,
      items: [
        { label: 'How It Works', href: '#how-it-works', desc: '5-step event timeline' },
        { label: 'FAQ', href: '#faq', desc: 'Frequently asked questions' },
        { label: 'Documentation', href: '/docs', desc: 'Guides & API reference' },
      ],
    },
    {
      label: 'Pricing',
      hasDropdown: false,
      href: '#pricing',
    },
  ];

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-[1240px] mx-auto pointer-events-auto">
        <nav
          className={`flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-[#0F1210]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300 ${
            scrolled ? 'bg-[#0B0D0C]/95 border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.8)]' : ''
          }`}
          aria-label="Main Navigation"
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#028051] flex items-center justify-center shadow-[0_0_15px_rgba(2,128,81,0.6)] group-hover:scale-105 transition-transform">
              {/* Modern AlmostHack clover/cross emblem */}
              <div className="w-4 h-4 relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 border-2 border-[#A8E63B] rounded-sm transform rotate-45" />
                <div className="absolute w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#A8E63B] transition-colors">
              AlmostHack
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
              >
                {item.hasDropdown ? (
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                      activeDropdown === item.label
                        ? 'text-white bg-white/[0.06]'
                        : 'text-[#A7AEA7] hover:text-white hover:bg-white/[0.04]'
                    }`}
                    aria-expanded={activeDropdown === item.label}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#737A73] transition-transform duration-200 ${
                      activeDropdown === item.label ? 'rotate-180 text-white' : ''
                    }`} />
                  </button>
                ) : (
                  <a
                    href={item.href || '#'}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#A7AEA7] hover:text-white hover:bg-white/[0.04] transition-colors inline-block"
                  >
                    {item.label}
                  </a>
                )}

                {/* Dropdown Menu */}
                {item.hasDropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 w-64 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="p-2 rounded-xl bg-[#141815] border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                      {item.items?.map((subItem) => (
                        <a
                          key={subItem.label}
                          href={subItem.href}
                          className="block p-2 rounded-lg hover:bg-white/[0.06] transition-colors group"
                        >
                          <div className="text-xs font-semibold text-white group-hover:text-[#A8E63B] transition-colors">
                            {subItem.label}
                          </div>
                          {subItem.desc && (
                            <div className="text-[11px] text-[#737A73] mt-0.5 leading-tight">
                              {subItem.desc}
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-[13px] font-medium text-[#A7AEA7] hover:text-white transition-colors"
            >
              Sign in
            </Link>

            <Link
              href="/hackathons/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#A8E63B] text-[#0B0D0C] hover:bg-[#bcf05b] hover:shadow-[0_0_20px_rgba(168,230,59,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Create a Hackathon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/hackathons/new"
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#A8E63B] text-[#0B0D0C]"
            >
              Create
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#A7AEA7] hover:text-white hover:bg-white/[0.06]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 p-4 rounded-2xl bg-[#0F1210]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
            <div className="space-y-1">
              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/[0.06]"
              >
                Product
              </a>
              <a
                href="#organizers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/[0.06]"
              >
                For Organizers
              </a>
              <a
                href="#judges"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/[0.06]"
              >
                For Judges
              </a>
              <a
                href="#hackers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/[0.06]"
              >
                For Hackers
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/[0.06]"
              >
                How It Works
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/[0.06]"
              >
                FAQ
              </a>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-white bg-white/[0.04] border border-white/[0.08]"
              >
                Sign in
              </Link>
              <Link
                href="/hackathons/new"
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-[#A8E63B] text-black"
              >
                Create a Hackathon →
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

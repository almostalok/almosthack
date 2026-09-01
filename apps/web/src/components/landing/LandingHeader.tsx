'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface LandingHeaderProps {
  onBookDemo?: () => void;
  className?: string;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onBookDemo, className }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'For Organizers', href: '#organizers' },
    { label: 'For Hackers', href: '#hackers' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-[#131413]/90 backdrop-blur-md border-b border-[#222622] transition-colors',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] rounded-lg p-1"
          aria-label="AlmostHack Homepage"
        >
          <div className="w-8 h-8 rounded-[8px] bg-[#028051] flex items-center justify-center font-heading font-extrabold text-sm text-white shadow-sm group-hover:bg-[#03A066] transition-colors border border-[#03A066]/40">
            AH
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading font-extrabold text-base tracking-tight text-white leading-none">
              almosthack
            </span>
            <span className="text-[10px] font-mono text-[#737373] tracking-wider uppercase mt-0.5">
              hackathon os
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-sm font-medium text-[#A3A3A3] hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white focus-visible:ring-1 focus-visible:ring-[#028051] rounded px-1.5 py-0.5"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[#A3A3A3] hover:text-white transition-colors px-3 py-1.5 rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051]"
          >
            Log in
          </Link>

          <button
            type="button"
            onClick={onBookDemo || (() => {
              const target = document.querySelector('#book-demo') || document.querySelector('#hero');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            })}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#028051] hover:bg-[#03A066] active:bg-[#015033] px-4 py-2 rounded-[10px] shadow-sm transition-all border border-[#03A066]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131413] cursor-pointer"
          >
            <span>Book a Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[8px] text-[#A3A3A3] hover:text-white hover:bg-[#1A1C1A] border border-[#282C28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden border-b border-[#222622] bg-[#161816] px-4 pt-3 pb-6 space-y-4"
          >
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="px-3 py-2 rounded-[8px] text-sm font-medium text-[#A3A3A3] hover:text-white hover:bg-[#1F231F] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-[#282C28] flex flex-col gap-2.5">
              <Link
                href="/login"
                className="w-full text-center py-2 text-sm font-medium text-[#EDEDED] bg-[#1A1C1A] hover:bg-[#222622] border border-[#282C28] rounded-[10px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onBookDemo) {
                    onBookDemo();
                  } else {
                    const target = document.querySelector('#book-demo') || document.querySelector('#hero');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-[#028051] hover:bg-[#03A066] active:bg-[#015033] rounded-[10px] shadow-sm transition-colors border border-[#03A066]/50"
              >
                <span>Book a Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

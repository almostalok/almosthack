'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, ArrowUpRight, Zap, Command, Terminal } from 'lucide-react';

interface NavbarProps {
  onOpenCommandMenu?: () => void;
  onOpenDemoModal?: () => void;
}

export function Navbar({ onOpenCommandMenu, onOpenDemoModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Platform', href: '#features' },
    { label: '3D OS Preview', href: '#interactive-demo' },
    { label: 'AI Engine', href: '#ai-engine' },
    { label: 'Certificates', href: '#certificates' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-white/15 shadow-2xl py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group select-none">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform font-bold">
              <Zap className="w-5 h-5 fill-black text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tighter text-white flex items-center gap-1.5 uppercase">
                AlmostHack
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              </span>
              <span className="text-[10px] text-cyan tracking-widest uppercase font-mono">
                SYSTEM OS 2.4
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-50/80 border border-white/15 rounded-full px-4 py-1.5 backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-mono text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommandMenu}
              className="flex items-center gap-2 bg-surface-50 border border-white/15 hover:border-white/30 text-white/80 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all group cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-cyan" />
              <span>Search</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-white/10 text-white/70 text-[10px] px-1.5 py-0.5 rounded border border-white/10">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            {/* Deploy Button */}
            <button
              onClick={onOpenDemoModal}
              className="px-5 py-2 rounded-xl bg-white text-black font-display font-bold text-xs hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Deploy Hackathon</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenCommandMenu}
              className="p-2 text-white/80 bg-surface-50 rounded-xl border border-white/15"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-cyan" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white bg-surface-50 rounded-xl border border-white/15"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/15 px-6 py-6"
          >
            <div className="flex flex-col gap-4 font-mono">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-white/80 hover:text-white py-1"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-white/15 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDemoModal?.();
                  }}
                  className="w-full text-center py-3 text-xs font-bold font-display text-black bg-white rounded-xl shadow-lg"
                >
                  Deploy Hackathon
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

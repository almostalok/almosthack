'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Menu, X, Check, Play, Pause } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavbarProps {
  onOpenCommandMenu?: () => void;
  onOpenDemoModal?: () => void;
}

export function Navbar({ onOpenCommandMenu, onOpenDemoModal }: NavbarProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [wifiOpen, setWifiOpen] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { label: 'features', href: '#features' },
    { label: 'manifesto', href: '#manifesto' },
    { label: 'feedback', href: '#feedback' },
    { label: 'pricing', href: '#pricing' },
    { label: 'faq', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full mac-nav-bg border-b mac-border text-xs font-mono select-none backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
        
        {/* Left Side: Custom SVG Logo & Nav Links */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2.5 group select-none">
            {/* Custom HeyClicky-style Animated SVG Logo Face */}
            <svg
              className="w-7 h-5 mac-text-main transition-transform group-hover:scale-105"
              viewBox="0 0 48 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="almosthack logo"
            >
              <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path className="clicky-logo-mouth" d="M24.3 23.3 L33.4 23.3" stroke="#00F0FF" />
                <path className="clicky-logo-zig" d="M9.5 12.4 L14.5 6.5 L24.3 23.3" />
                <path className="clicky-logo-eye" d="M27.1 12.4 L32.86 6.5 L38.4 12.4" />
              </g>
            </svg>

            <span className="font-display font-black text-sm tracking-tight mac-text-main group-hover:text-cyan transition-colors">
              almosthack
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-5 mac-text-muted">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:mac-text-main transition-colors lowercase"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Side: macOS Status Bar Widgets & Theme Switch */}
        <div className="hidden md:flex items-center gap-3 mac-text-muted">
          
          {/* Custom Wi-Fi SVG Status Icon */}
          <div className="relative">
            <button
              onClick={() => { setWifiOpen(!wifiOpen); setAudioOpen(false); }}
              className="p-1 hover:bg-white/10 rounded flex items-center gap-1.5 text-emerald-400 transition-colors"
              title="Network Status"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12.55a11 11 0 0 1 14 0" />
                <path d="M8.5 16.29a7 7 0 0 1 7 0" />
                <path d="M12 20h.01" />
              </svg>
            </button>

            <AnimatePresence>
              {wifiOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-52 mac-card-bg border mac-border rounded-lg shadow-2xl p-2.5 z-50 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded mac-pill-bg font-mono">
                    <span className="flex items-center gap-2 mac-text-main font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Hackathon Mesh 5G
                    </span>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="mt-1.5 px-2 text-[10px] mac-text-muted flex items-center justify-between font-mono">
                    <span>1.2 Gbps</span>
                    <span className="text-emerald-400 font-bold">Connected</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Audio Equalizer Widget */}
          <div className="relative">
            <button
              onClick={() => { setAudioOpen(!audioOpen); setWifiOpen(false); }}
              className="p-1 hover:bg-white/10 rounded flex items-center gap-1 text-cyan transition-colors"
              title="Now Playing"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
              {isPlaying && (
                <span className="flex items-end gap-0.5 h-3 px-0.5">
                  <span className="w-0.5 bg-cyan animate-[bounce_1s_infinite_100ms] h-full" />
                  <span className="w-0.5 bg-cyan animate-[bounce_1s_infinite_300ms] h-2" />
                  <span className="w-0.5 bg-cyan animate-[bounce_1s_infinite_200ms] h-2.5" />
                </span>
              )}
            </button>

            <AnimatePresence>
              {audioOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-60 mac-card-bg border mac-border rounded-lg shadow-2xl p-2.5 z-50 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan to-blue-600 flex items-center justify-center font-bold text-black text-xs">
                        ♫
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] mac-text-main font-bold">hackathon_lofi.mp3</span>
                        <span className="text-[9px] mac-text-muted">AI Coding Vibes</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-full mac-pill-bg hover:bg-white/20 mac-text-main transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Engine Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 mac-pill-bg border mac-border px-2.5 py-0.5 rounded-full text-[10px] mac-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="font-mono">AI Eval v2.4</span>
          </div>

          {/* Custom Battery SVG Icon */}
          <div className="flex items-center gap-1 text-[11px] mac-text-muted font-mono">
            <svg className="w-5 h-3 text-emerald-400" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="1" width="18" height="12" rx="3" fill="rgba(16, 185, 129, 0.2)" />
              <rect x="3" y="3" width="14" height="8" rx="1.5" fill="currentColor" />
              <path d="M21 5v4" strokeLinecap="round" />
            </svg>
            <span>100%</span>
          </div>

          {/* Clock */}
          <span className="text-[11px] mac-text-muted font-mono pl-1.5 border-l mac-border">
            {timeString || '1:43 PM'}
          </span>

          {/* Cmd+K Button */}
          <button
            onClick={onOpenCommandMenu}
            className="flex items-center gap-1 mac-pill-bg hover:opacity-80 mac-text-muted border mac-border px-2 py-1 rounded text-[11px] transition-colors cursor-pointer"
          >
            <Search className="w-3 h-3 text-cyan" />
            <kbd className="text-[9px] mac-text-muted bg-white/10 px-1 rounded">⌘K</kbd>
          </button>

          {/* Dark Mode / Light Mode Switch */}
          <div className="pl-1 border-l mac-border">
            <ThemeToggle />
          </div>

          {/* Primary Glossy Button */}
          <button
            onClick={onOpenDemoModal}
            className="mac-btn-gloss px-3 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <svg className="w-3 h-3 text-cyan fill-cyan" viewBox="0 0 24 24">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>get almosthack</span>
          </button>
        </div>

        {/* Mobile Menu Button & Theme Switch */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onOpenCommandMenu}
            className="p-1.5 mac-text-muted mac-pill-bg rounded border mac-border"
          >
            <Search className="w-3.5 h-3.5 text-cyan" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 mac-text-main mac-pill-bg rounded border mac-border"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mac-nav-bg border-b mac-border px-4 py-4 flex flex-col gap-3"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs mac-text-muted hover:mac-text-main py-1 lowercase font-mono"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t mac-border flex flex-col gap-2">
              <div className="flex items-center justify-between py-1 font-mono text-xs mac-text-muted">
                <span>Appearance</span>
                <ThemeToggle showLabel />
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDemoModal?.();
                }}
                className="mac-btn-gloss w-full py-2 text-center text-xs font-bold text-white rounded-md flex items-center justify-center gap-1.5"
              >
                <span>get almosthack</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


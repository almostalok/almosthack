'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Check, Play, Pause } from 'lucide-react';
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
    <header className="sticky top-0 left-0 right-0 z-50 w-full bg-[#051C14]/95 border-b-2 border-[#0D3A29] text-xs font-mono select-none backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Left Side: Custom SVG Logo & Nav Links */}
        <div className="flex items-center gap-7">
          <a href="#" className="flex items-center gap-2.5 group select-none">
            <svg
              className="w-7 h-5 text-[#ABFF44] transition-transform group-hover:scale-105"
              viewBox="0 0 48 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="almosthack logo"
            >
              <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M24.3 23.3 L33.4 23.3" stroke="#ABFF44" />
                <path d="M9.5 12.4 L14.5 6.5 L24.3 23.3" />
                <path d="M27.1 12.4 L32.86 6.5 L38.4 12.4" />
              </g>
            </svg>

            <span className="font-display font-black text-base tracking-tight text-white group-hover:text-[#ABFF44] transition-colors">
              almosthack
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-[#789887]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#ABFF44] transition-colors lowercase font-semibold text-xs"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Side: Status Widgets & Optimizely Electric Lime CTA */}
        <div className="hidden md:flex items-center gap-3 text-[#789887]">
          
          {/* Wi-Fi Status Icon */}
          <div className="relative">
            <button
              onClick={() => { setWifiOpen(!wifiOpen); setAudioOpen(false); }}
              className="p-1.5 hover:bg-white/10 rounded-lg flex items-center gap-1.5 text-[#ABFF44] transition-colors"
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
                  className="absolute right-0 top-full mt-2 w-52 bg-[#0D3A29] border-2 border-[#051C14] rounded-xl shadow-2xl p-3 z-50 backdrop-blur-md text-white"
                >
                  <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded bg-[#051C14] font-mono">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#ABFF44] animate-pulse" />
                      Hackathon Mesh 5G
                    </span>
                    <Check className="w-3.5 h-3.5 text-[#ABFF44]" />
                  </div>
                  <div className="mt-1.5 px-2 text-[10px] text-[#789887] flex items-center justify-between font-mono">
                    <span>1.2 Gbps</span>
                    <span className="text-[#ABFF44] font-bold">Connected</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Audio Equalizer Widget */}
          <div className="relative">
            <button
              onClick={() => { setAudioOpen(!audioOpen); setWifiOpen(false); }}
              className="p-1.5 hover:bg-white/10 rounded-lg flex items-center gap-1 text-[#ABFF44] transition-colors"
              title="Now Playing"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
              {isPlaying && (
                <span className="flex items-end gap-0.5 h-3 px-0.5">
                  <span className="w-0.5 bg-[#ABFF44] animate-[bounce_1s_infinite_100ms] h-full" />
                  <span className="w-0.5 bg-[#ABFF44] animate-[bounce_1s_infinite_300ms] h-2" />
                  <span className="w-0.5 bg-[#ABFF44] animate-[bounce_1s_infinite_200ms] h-2.5" />
                </span>
              )}
            </button>

            <AnimatePresence>
              {audioOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-60 bg-[#0D3A29] border-2 border-[#051C14] rounded-xl shadow-2xl p-3 z-50 backdrop-blur-md text-white"
                >
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-[#ABFF44] flex items-center justify-center font-bold text-[#072419] text-xs">
                        ♫
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">hackathon_lofi.mp3</span>
                        <span className="text-[9px] text-[#789887]">Optimizely Beats</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-full bg-[#051C14] hover:bg-white/20 text-white transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3 h-3 text-[#ABFF44]" /> : <Play className="w-3 h-3 text-[#ABFF44]" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Engine Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#0D3A29] border border-[#ABFF44]/30 px-3 py-1 rounded-full text-[10px] text-[#ABFF44] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ABFF44] animate-pulse" />
            <span className="font-mono">AI Eval v2.4</span>
          </div>

          {/* Clock */}
          <span className="text-[11px] text-[#789887] font-mono pl-1.5 border-l border-[#0D3A29]">
            {timeString || '1:43 PM'}
          </span>

          {/* Cmd+K Button */}
          <button
            onClick={onOpenCommandMenu}
            className="flex items-center gap-1 bg-[#0D3A29] text-[#ABFF44] border border-[#0D3A29] px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer hover:bg-white/10"
          >
            <Search className="w-3 h-3 text-[#ABFF44]" />
            <kbd className="text-[9px] text-white bg-black/40 px-1 rounded font-bold">⌘K</kbd>
          </button>

          {/* Dark Mode / Light Mode Switch */}
          <div className="pl-1 border-l border-[#0D3A29]">
            <ThemeToggle />
          </div>

          {/* Primary Optimizely Tactile Button */}
          <button
            onClick={onOpenDemoModal}
            className="optimizely-btn-lime px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <span>Let&apos;s grow</span>
            <svg className="w-3 h-3 text-[#072419] fill-[#072419]" viewBox="0 0 24 24">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onOpenCommandMenu}
            className="p-1.5 text-[#ABFF44] bg-[#0D3A29] rounded-lg border border-[#0D3A29]"
          >
            <Search className="w-3.5 h-3.5 text-[#ABFF44]" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-white bg-[#0D3A29] rounded-lg border border-[#0D3A29]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

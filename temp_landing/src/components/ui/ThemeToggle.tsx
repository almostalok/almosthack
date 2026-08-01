'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative flex items-center gap-2 p-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none ${
        isDark
          ? 'bg-zinc-900/90 border-white/15 text-amber-300 hover:border-amber-400/50 hover:bg-zinc-800/90 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
          : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-cyan hover:bg-white shadow-[0_0_12px_rgba(0,240,255,0.2)]'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Animated Sliding Pill Indicator */}
      <div className="relative flex items-center justify-between w-12 h-5 px-0.5">
        {/* Sun Icon */}
        <motion.div
          animate={{
            scale: isDark ? 0.7 : 1,
            opacity: isDark ? 0.4 : 1,
            rotate: isDark ? -45 : 0,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="z-10 text-amber-500"
        >
          <Sun className="w-3.5 h-3.5 fill-amber-400/20" />
        </motion.div>

        {/* Moon Icon */}
        <motion.div
          animate={{
            scale: isDark ? 1 : 0.7,
            opacity: isDark ? 1 : 0.4,
            rotate: isDark ? 0 : 45,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="z-10 text-cyan"
        >
          <Moon className="w-3.5 h-3.5 fill-cyan/20" />
        </motion.div>

        {/* Slider Thumb */}
        <motion.div
          className={`absolute top-0.5 w-4 h-4 rounded-full shadow-md ${
            isDark ? 'bg-cyan' : 'bg-amber-400'
          }`}
          animate={{
            x: isDark ? 28 : 0,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>

      {showLabel && (
        <span className="text-[11px] font-mono font-medium tracking-tight pr-1.5">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}

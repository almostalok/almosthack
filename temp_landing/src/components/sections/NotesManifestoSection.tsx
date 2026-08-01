'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export function NotesManifestoSection() {
  return (
    <section id="manifesto" className="py-24 bg-modern-dark mac-text-main relative overflow-hidden select-none transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-900/10 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Section Pill Label */}
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-1 rounded-full mac-pill-bg border mac-border text-xs font-mono text-cyan uppercase tracking-wider">
            the dream
          </span>
        </div>

        {/* macOS Notes Window */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="notes-doc max-w-2xl mx-auto"
        >
          {/* macOS Title Bar */}
          <div className="mac-window-bar px-4 py-2.5">
            <div className="mac-dots">
              <span className="mac-dot mac-dot-close" />
              <span className="mac-dot mac-dot-min" />
              <span className="mac-dot mac-dot-zoom" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs mac-text-muted">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>manifesto.notes</span>
            </div>
            <div className="w-12" />
          </div>

          {/* Notes Document Content */}
          <div className="p-8 sm:p-10 notes-paper font-sans text-base leading-relaxed mac-text-muted space-y-6">
            <p className="mac-text-main font-medium text-lg sm:text-xl">
              we all host hackathons, but managing 100+ team submissions, manually grading code, and chasing down judges is exhausting!
            </p>

            <p className="mac-text-muted">
              we just believe it&apos;s an interface and automation problem.
            </p>

            <p className="mac-text-muted">
              we wanna take frontier AI models and make it so event organizers can{' '}
              <span className="font-serif italic text-cyan text-xl sm:text-2xl font-normal border-b border-cyan/40 pb-0.5">
                break out of chaotic spreadsheets, uninspired chat groups, and slow manual scoring.
              </span>
            </p>

            <p className="mac-text-muted">
              we&apos;re building the AI co-host and evaluation engine the next million hackathon organizers &amp; builders will use.
            </p>

            <p className="mac-text-muted font-mono text-sm">
              it&apos;s early! try out what we have today and lmk what you think.
              <span className="text-cyan font-bold animate-blink ml-1">|</span>
            </p>

            {/* Founder Sign-off Box */}
            <div className="pt-6 border-t mac-border flex items-center justify-between">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan to-blue-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full mac-card-bg flex items-center justify-center font-bold text-cyan text-xs font-mono">
                    AH
                  </div>
                </div>
                <div className="flex flex-col font-mono text-xs">
                  <span className="mac-text-main font-bold group-hover:text-cyan transition-colors">alok &amp; team,</span>
                  <span className="mac-text-muted">founders @ almosthack</span>
                </div>
              </a>

              <div className="flex items-center gap-2 mac-pill-bg border mac-border px-3 py-1.5 rounded-lg text-xs font-mono mac-text-muted">
                <svg className="w-3.5 h-3.5 text-cyan fill-cyan" viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>almosthack v2.4</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

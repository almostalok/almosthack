'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';

export function NotesManifestoSection() {
  return (
    <section id="manifesto" className="py-28 bg-[#051C14] text-white relative overflow-hidden select-none transition-colors duration-300">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="optimizely-pill-lime mb-3 shadow-md">
            [ MANIFESTO ]
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Why We Built <span className="serif-accent text-[#ABFF44]">AlmostHack</span>
          </h2>
        </div>

        {/* Optimizely Cream Tactile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="optimizely-card rounded-3xl max-w-2xl mx-auto p-8 sm:p-12 space-y-6 relative overflow-hidden"
        >
          {/* Header Tag */}
          <div className="flex items-center justify-between border-b-2 border-[#0D3A29] pb-4">
            <div className="flex items-center gap-2 font-mono text-xs text-[#072419] font-extrabold tracking-wider uppercase">
              <FileText className="w-4 h-4 text-[#0D3A29]" />
              <span>THE DREAM &amp; MANIFESTO</span>
            </div>
            <span className="optimizely-pill-pink">
              Updated 2026
            </span>
          </div>

          {/* Statement Paragraphs */}
          <p className="text-[#072419] font-extrabold text-lg sm:text-xl leading-relaxed font-display">
            We all love hosting hackathons, but managing hundreds of team submissions, manually grading code, and chasing down judges is exhausting chaos.
          </p>

          <p className="text-[#557365] leading-relaxed font-sans text-sm sm:text-base font-medium">
            We believe it&apos;s fundamentally an interface and automation problem. With modern frontier AI models, event organizers can finally break out of chaotic spreadsheets, uninspired chat groups, and slow manual rubric scoring.
          </p>

          <p className="text-[#557365] leading-relaxed font-sans text-sm sm:text-base font-medium">
            We&apos;re building the AI co-host and evaluation engine that the next generation of hackathon organizers &amp; builders will rely on for seamless, verifiable events.
          </p>

          {/* Sign-off Footer */}
          <div className="pt-6 border-t-2 border-[#0D3A29] flex items-center justify-between">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#ABFF44] border-2 border-[#0D3A29] flex items-center justify-center font-bold text-[#072419] text-xs font-mono shadow-sm group-hover:scale-105 transition-transform">
                AH
              </div>
              <div className="flex flex-col font-mono text-xs">
                <span className="text-[#072419] font-bold group-hover:text-[#0D3A29] transition-colors">alok &amp; team</span>
                <span className="text-[#557365]">founders @ almosthack</span>
              </div>
            </a>

            <div className="optimizely-pill-lime">
              <Sparkles className="w-3.5 h-3.5 text-[#072419]" />
              <span>Hackathon OS v2.4</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

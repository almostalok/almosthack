'use client';

import React, { useState } from 'react';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import {
  IconTrophy,
  IconSparkle,
  IconCheckCircle,
  IconTerminalCode,
} from '@/components/ui/CustomIcons';

export function JudgeScoringSimulator() {
  const [innovation, setInnovation] = useState<number>(9.5);
  const [techDepth, setTechDepth] = useState<number>(9.2);
  const [uiUx, setUiUx] = useState<number>(9.0);
  const [viability, setViability] = useState<number>(8.8);

  const weightedTotal = ((innovation * 0.35 + techDepth * 0.35 + uiUx * 0.15 + viability * 0.15)).toFixed(2);

  return (
    <section className="py-24 relative overflow-hidden bg-black text-white bg-noise-fine select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title with Instrument Serif Accent */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-white/15 text-cyan font-mono text-xs font-bold">
            <IconTrophy size={14} className="text-amber-400" />
            <span>JUDGE RUBRIC SIMULATOR</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-display">
            fair, standardized judging.{' '}
            <span className="font-serif italic text-cyan text-4xl sm:text-5xl font-normal">
              no inconsistencies.
            </span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg font-sans">
            slide the scoring rubrics below to see how AlmostHack automatically calculates weighted final scores and AI verdict badges.
          </p>
        </div>

        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.18)"
          className="max-w-4xl mx-auto mac-window border border-white/15 overflow-hidden shadow-2xl p-0"
        >
          <div className="mac-window-bar px-6 py-3">
            <div className="mac-dots">
              <span className="mac-dot mac-dot-close" />
              <span className="mac-dot mac-dot-min" />
              <span className="mac-dot mac-dot-zoom" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
              <IconTerminalCode size={14} className="text-cyan" />
              <span>judge_rubric_simulator.app</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="p-8 bg-zinc-950/95 space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4 font-mono">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan/20 text-cyan border border-cyan/30">
                  <IconSparkle size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Evaluated Project: PulseAI Triage Engine</h3>
                  <p className="text-xs text-zinc-400">Judge: Dr. Marcus Vance • Track: AI Healthcare</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-zinc-500">WEIGHTED FINAL SCORE</div>
                <div className="text-3xl font-extrabold text-cyan">{weightedTotal} / 10</div>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              {/* Slider 1 */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Innovation &amp; Originality (35%)</span>
                  <span className="text-cyan">{innovation.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={innovation}
                  onChange={(e) => setInnovation(parseFloat(e.target.value))}
                  className="w-full accent-cyan bg-white/10 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 2 */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Technical Execution &amp; Code (35%)</span>
                  <span className="text-emerald-400">{techDepth.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={techDepth}
                  onChange={(e) => setTechDepth(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 3 */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-white">UI / UX Polish (15%)</span>
                  <span className="text-purple-400">{uiUx.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={uiUx}
                  onChange={(e) => setUiUx(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 bg-white/10 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 4 */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Market Viability &amp; Pitch (15%)</span>
                  <span className="text-amber-400">{viability.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={viability}
                  onChange={(e) => setViability(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-white/10 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <IconCheckCircle size={14} /> AI Rubric Consistency Verified
              </span>
              <span>Weighted formula auto-saved</span>
            </div>
          </div>
        </SpotlightCard>

      </div>
    </section>
  );
}

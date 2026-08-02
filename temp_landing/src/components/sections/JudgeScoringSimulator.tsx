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
    <section className="py-28 relative overflow-hidden bg-[#051C14] text-white select-none transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="optimizely-pill-pink shadow-md">
            [ JUDGE RUBRIC SIMULATOR ]
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-display">
            Fair, Standardized Judging.{' '}
            <span className="serif-accent text-[#ABFF44] font-normal">
              No Inconsistencies.
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-sans leading-relaxed">
            Slide the scoring rubrics below to see how AlmostHack automatically calculates weighted final scores and AI verdict badges.
          </p>
        </div>

        {/* Simulator macOS Window */}
        <SpotlightCard
          spotlightColor="rgba(171, 255, 68, 0.18)"
          className="max-w-4xl mx-auto mac-window border-2 border-[#0D3A29] overflow-hidden p-0"
        >
          <div className="mac-window-bar px-6 py-3.5">
            <div className="mac-dots">
              <span className="mac-dot mac-dot-close" />
              <span className="mac-dot mac-dot-min" />
              <span className="mac-dot mac-dot-zoom" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-white font-bold">
              <IconTerminalCode size={14} className="text-[#ABFF44]" />
              <span>judge_rubric_simulator.app</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="p-8 bg-[#051C14] space-y-8 font-sans">
            
            {/* Header Telemetry */}
            <div className="flex flex-wrap items-center justify-between border-b-2 border-[#0D3A29] pb-5 gap-4 font-mono">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#ABFF44] text-[#072419] border-2 border-[#0D3A29] shadow-sm">
                  <IconSparkle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Evaluated Project: PulseAI Triage Engine</h3>
                  <p className="text-xs text-[#789887] font-semibold">Judge: Dr. Marcus Vance • Track: AI Healthcare</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-[#789887] uppercase tracking-widest font-extrabold">WEIGHTED FINAL SCORE</div>
                <div className="text-3xl sm:text-4xl font-black text-[#ABFF44] font-display">{weightedTotal} / 10</div>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              
              {/* Slider 1 */}
              <div className="p-5 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-3">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Innovation &amp; Originality (35%)</span>
                  <span className="text-[#ABFF44] font-extrabold">{innovation.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={innovation}
                  onChange={(e) => setInnovation(parseFloat(e.target.value))}
                  className="w-full accent-[#ABFF44] bg-[#051C14] h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 2 */}
              <div className="p-5 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-3">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Technical Execution &amp; Code (35%)</span>
                  <span className="text-[#ABFF44] font-extrabold">{techDepth.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={techDepth}
                  onChange={(e) => setTechDepth(parseFloat(e.target.value))}
                  className="w-full accent-[#ABFF44] bg-[#051C14] h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 3 */}
              <div className="p-5 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-3">
                <div className="flex justify-between font-bold">
                  <span className="text-white">UI / UX Polish (15%)</span>
                  <span className="text-purple-400 font-extrabold">{uiUx.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={uiUx}
                  onChange={(e) => setUiUx(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 bg-[#051C14] h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 4 */}
              <div className="p-5 rounded-2xl bg-[#0D3A29]/70 border-2 border-[#0D3A29] space-y-3">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Market Viability &amp; Pitch (15%)</span>
                  <span className="text-amber-400 font-extrabold">{viability.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={viability}
                  onChange={(e) => setViability(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-[#051C14] h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Verification Footer Bar */}
            <div className="pt-3 flex items-center justify-between border-t-2 border-[#0D3A29] text-xs font-mono text-[#789887]">
              <span className="flex items-center gap-2 text-[#ABFF44] font-bold">
                <IconCheckCircle size={16} /> AI Rubric Consistency Verified
              </span>
              <span>Weighted formula auto-saved</span>
            </div>
          </div>
        </SpotlightCard>

      </div>
    </section>
  );
}

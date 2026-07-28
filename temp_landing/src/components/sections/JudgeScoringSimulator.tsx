'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Sliders, BrainCircuit, CheckCircle2, RefreshCw } from 'lucide-react';

export function JudgeScoringSimulator() {
  const [innovation, setInnovation] = useState<number>(9.5);
  const [techDepth, setTechDepth] = useState<number>(9.2);
  const [uiUx, setUiUx] = useState<number>(9.0);
  const [viability, setViability] = useState<number>(8.8);

  const weightedTotal = ((innovation * 0.35 + techDepth * 0.35 + uiUx * 0.15 + viability * 0.15)).toFixed(2);

  const getRatingBadge = (score: number) => {
    if (score >= 9.2) return { text: '🏆 Grand Champion Contender', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' };
    if (score >= 8.5) return { text: '⚡ Track Finalist', color: 'text-accent border-accent/40 bg-accent/10' };
    return { text: '✨ Honorable Mention', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' };
  };

  const badge = getRatingBadge(parseFloat(weightedTotal));

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent font-semibold text-xs">
            <Award className="w-4 h-4" />
            JUDGE RUBRIC SIMULATOR
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Fair, Standardized Judging. <br />
            <span className="text-gradient-accent">No Inconsistencies.</span>
          </h2>
          <p className="text-muted text-base sm:text-lg">
            Slide the scoring rubrics below to see how AlmostHack automatically calculates weighted final scores and AI verdict badges.
          </p>
        </div>

        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-surface border border-white/10 glass-card shadow-2xl space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/20 text-accent border border-accent/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Evaluated Project: PulseAI Triage Engine</h3>
                <p className="text-xs text-white/50">Judge: Dr. Marcus Vance • Track: AI Healthcare</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/50">WEIGHTED FINAL SCORE</div>
              <div className="text-3xl font-extrabold text-accent font-mono">{weightedTotal} / 10</div>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Slider 1 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-white">Innovation & Originality (35%)</span>
                <span className="text-accent font-mono">{innovation.toFixed(1)} / 10</span>
              </div>
              <input
                type="range"
                min="5"
                max="10"
                step="0.1"
                value={innovation}
                onChange={(e) => setInnovation(parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-white/10 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-white">Technical Execution & Code (35%)</span>
                <span className="text-emerald-400 font-mono">{techDepth.toFixed(1)} / 10</span>
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
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-white">UI / UX Polish (15%)</span>
                <span className="text-purple-400 font-mono">{uiUx.toFixed(1)} / 10</span>
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
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-white">Market Potential (15%)</span>
                <span className="text-amber-400 font-mono">{viability.toFixed(1)} / 10</span>
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

          {/* AI Verdict Summary Output */}
          <div className="p-5 rounded-2xl bg-surface-50 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-5 h-5 text-accent" />
              <div>
                <div className="text-xs text-white/50">AI Automated Verdict Classification</div>
                <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                    {badge.text}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setInnovation(9.5);
                setTechDepth(9.2);
                setUiUx(9.0);
                setViability(8.8);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Default Rubric
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

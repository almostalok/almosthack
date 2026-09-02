'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Gavel,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface JudgeScoringDemoProps {
  className?: string;
}

export const JudgeScoringDemo: React.FC<JudgeScoringDemoProps> = ({ className }) => {
  const shouldReduceMotion = useReducedMotion();

  const [scores, setScores] = useState({
    innovation: 18,
    execution: 17,
    impact: 19,
    design: 16,
    presentation: 15,
  });

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleSliderChange = (key: keyof typeof scores, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div
      className={cn(
        'w-full rounded-[20px] bg-[#141614] border border-[#282C28] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-body text-left relative',
        className
      )}
    >
      {/* Top Chrome */}
      <div className="h-11 bg-[#111311] border-b border-[#242824] px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2C302C]" />
          <div className="w-3 h-3 rounded-full bg-[#2C302C]" />
          <div className="w-3 h-3 rounded-full bg-[#2C302C]" />
          <span className="ml-2 text-xs font-mono text-[#737373]">
            app.almosthack.io/judge/review/sub-8492
          </span>
        </div>
        <span className="text-xs font-mono text-[#03A066] flex items-center gap-1.5 bg-[#028051]/15 px-3 py-1 rounded-[6px] border border-[#028051]/30">
          <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
          Double-Blind Mode
        </span>
      </div>

      <div className="p-6 sm:p-8 space-y-6 bg-[#131413]">
        {/* Project Header */}
        <div className="p-4 sm:p-5 rounded-[12px] bg-[#171917] border border-[#282C28] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#737373] block">
              Sub-8492 (Anonymized)
            </span>
            <h4 className="text-lg sm:text-xl font-heading font-extrabold text-white mt-0.5">
              QuantumQuest • AI-Powered Climate Optimization
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#5EEAD4] bg-[#1A1D1A] px-3 py-1.5 rounded-[8px] border border-[#282C28]">
              <GitBranch className="w-3.5 h-3.5 text-[#03A066]" />
              <span>42 Verified Commits</span>
            </div>
          </div>
        </div>

        {/* Interactive Rubric Sliders */}
        <div className="space-y-4 p-5 sm:p-6 rounded-[16px] bg-[#161816] border border-[#282C28]">
          <div className="flex items-center justify-between pb-3 border-b border-[#242824]">
            <span className="text-sm font-mono uppercase tracking-wider text-[#EDEDED] font-bold">
              Standardized Rubric Scoring
            </span>
            <span className="text-xs font-mono text-[#03A066] font-semibold">
              Interactive Preview
            </span>
          </div>

          {/* Innovation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs sm:text-sm font-mono">
              <span className="text-[#C2C6C2]">Innovation (Weight: 20%)</span>
              <span className="font-bold text-white">{scores.innovation} / 20</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={scores.innovation}
              onChange={(e) => handleSliderChange('innovation', Number(e.target.value))}
              className="w-full accent-[#028051] bg-[#1F231F] h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Technical Execution */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs sm:text-sm font-mono">
              <span className="text-[#C2C6C2]">Technical Execution (Weight: 20%)</span>
              <span className="font-bold text-white">{scores.execution} / 20</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={scores.execution}
              onChange={(e) => handleSliderChange('execution', Number(e.target.value))}
              className="w-full accent-[#028051] bg-[#1F231F] h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Impact */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs sm:text-sm font-mono">
              <span className="text-[#C2C6C2]">Impact (Weight: 20%)</span>
              <span className="font-bold text-white">{scores.impact} / 20</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={scores.impact}
              onChange={(e) => handleSliderChange('impact', Number(e.target.value))}
              className="w-full accent-[#028051] bg-[#1F231F] h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Design */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs sm:text-sm font-mono">
              <span className="text-[#C2C6C2]">Design (Weight: 20%)</span>
              <span className="font-bold text-white">{scores.design} / 20</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={scores.design}
              onChange={(e) => handleSliderChange('design', Number(e.target.value))}
              className="w-full accent-[#028051] bg-[#1F231F] h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Presentation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs sm:text-sm font-mono">
              <span className="text-[#C2C6C2]">Presentation (Weight: 20%)</span>
              <span className="font-bold text-white">{scores.presentation} / 20</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={scores.presentation}
              onChange={(e) => handleSliderChange('presentation', Number(e.target.value))}
              className="w-full accent-[#028051] bg-[#1F231F] h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Score Total & Consensus Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-[#1A1D1A] border border-[#282C28] rounded-[12px] flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase">Your Evaluation</span>
              <div className="text-2xl font-heading font-extrabold text-white mt-0.5">{totalScore} / 100</div>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-[10px] bg-[#028051] hover:bg-[#03A066] text-white font-mono text-xs font-bold shadow-sm"
            >
              Lock Review
            </button>
          </div>

          <div className="p-4 bg-[#1A1D1A] border border-[#282C28] rounded-[12px] text-xs font-mono flex flex-col justify-center">
            <div className="flex justify-between text-[#8C908C]">
              <span>Judge Consensus:</span>
              <span className="text-[#03A066] font-bold">Variance 3.0</span>
            </div>
            <div className="text-xs text-[#737373] mt-1.5">
              J1: 87 • J2: 84 • J3: 85 (Normalized: 85.3)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

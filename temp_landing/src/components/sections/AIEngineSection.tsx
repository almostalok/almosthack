'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { AICoreCanvas } from '@/components/reactbits/AICoreCanvas';
import {
  IconCpuChip,
  IconSparkle,
  IconTerminalCode,
  IconVerifiedCheck,
  IconShieldCert,
  IconZapFlash,
} from '@/components/ui/CustomIcons';

export function AIEngineSection() {
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const aiFeatures = [
    { title: 'AI Team Matchmaking', desc: 'Connects solo hackers by analyzing past repos, tech stacks, and track preferences.' },
    { title: 'AI Project Tagging', desc: 'Auto-labels submissions into appropriate track categories and tags.' },
    { title: 'AI Code Summarizer', desc: 'Generates 10-second summary synopses of complex codebases for rapid judge review.' },
    { title: 'AI Duplicate Detection', desc: 'Scans commit logs & public repos to detect recycled or plagiarized projects.' },
    { title: 'AI Event Digest', desc: 'Produces executive event debrief reports and winning team highlight digests.' },
    { title: 'AI Hacker Feedback', desc: 'Provides actionable, constructive critique to non-winning teams on how to improve.' },
    { title: 'AI Certificate Engine', desc: 'Customizes personalized certificate citations based on team achievements.' },
    { title: 'AI Track Analytics', desc: 'Predictive insights on participant engagement, drop-off points, and track popularity.' },
  ];

  const promptDemos = [
    {
      label: 'Team Matcher',
      prompt: 'Match a React/TypeScript frontend developer with a Python ML engineer interested in MedTech.',
      result: 'Found Match! Connected @sarah_dev (React) with @david_ml (PyTorch) for track "AI Healthcare". Match confidence: 97.4%.',
    },
    {
      label: 'Duplicate Check',
      prompt: 'Scan submission "PulseAI" against GitHub public repositories for code recycling.',
      result: 'Shield Verified: 99.8% original codebase. 14 new commits pushed during hackathon hours. No plagiarism detected.',
    },
    {
      label: 'Judge Summary',
      prompt: 'Summarize 15,000 lines of Rust/Solana code in 2 sentences for Judge Rubric Evaluation.',
      result: 'Summary: Implements zero-knowledge proof verification for digital certificates on Solana. Key innovation: 85% gas reduction via custom circuit design.',
    },
  ];

  const handleRunDemo = (idx: number) => {
    setSelectedPrompt(idx);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 400);
  };

  return (
    <section id="ai-engine" className="py-28 relative overflow-hidden bg-black text-white bg-noise-fine select-none">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-cyan-glow opacity-25 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Instrument Serif Accent */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-900 border border-white/15 text-cyan font-mono font-bold text-xs">
            <IconCpuChip size={14} className="text-cyan" />
            <span>AI AUTOPILOT CORE</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white">
            powered by specialized{' '}
            <span className="font-serif italic text-cyan text-4xl sm:text-6xl font-normal">
              hackathon ai
            </span>
          </h2>
          <p className="font-sans text-zinc-400 text-base sm:text-lg">
            automate tedious manual work so organizers can focus on building an unforgettable developer experience.
          </p>
        </div>

        {/* 3D Asset Banner & Feature Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Left: 3D Holographic AI Core Asset in Spotlight Card */}
          <div className="lg:col-span-5">
            <SpotlightCard
              spotlightColor="rgba(0, 240, 255, 0.2)"
              className="mac-window p-6 border border-white/15 overflow-hidden group shadow-2xl"
            >
              <div className="mac-window-bar mb-4 px-2 py-1 bg-transparent border-b-0">
                <div className="mac-dots">
                  <span className="mac-dot mac-dot-close" />
                  <span className="mac-dot mac-dot-min" />
                  <span className="mac-dot mac-dot-zoom" />
                </div>
                <span className="text-[10px] font-mono text-zinc-400">neural_core_v4.2.app</span>
              </div>

              <AICoreCanvas />

              <div className="mt-4 font-mono text-left space-y-1">
                <div className="text-xs text-cyan font-bold uppercase flex items-center gap-2">
                  <IconCpuChip size={14} className="text-cyan" /> Neural Model v4.2 Active
                </div>
                <p className="text-[11px] text-zinc-400">
                  Latency: 18ms • Ephemeral container runtime isolated
                </p>
              </div>
            </SpotlightCard>
          </div>

          {/* Right: AI Capability Modules Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiFeatures.map((feat, idx) => (
              <SpotlightCard
                key={feat.title}
                spotlightColor="rgba(0, 240, 255, 0.12)"
                className="mac-window p-5 border border-white/10 bg-zinc-950/90 hover:border-cyan/40 transition-all"
              >
                <div className="flex items-center gap-2 mb-2 font-mono text-xs text-cyan font-bold">
                  <IconSparkle size={14} className="text-cyan" />
                  <span>{feat.title}</span>
                </div>
                <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                  {feat.desc}
                </p>
              </SpotlightCard>
            ))}
          </div>

        </div>

        {/* Interactive Prompt Sandbox Box */}
        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.18)"
          className="mac-window p-8 border border-white/15 bg-zinc-950/95 font-mono shadow-2xl"
        >
          <div className="mac-window-bar px-4 py-2 mb-6 border-b border-white/10">
            <div className="mac-dots">
              <span className="mac-dot mac-dot-close" />
              <span className="mac-dot mac-dot-min" />
              <span className="mac-dot mac-dot-zoom" />
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan font-bold">
              <IconTerminalCode size={14} />
              <span>ai_prompt_sandbox.terminal</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {promptDemos.map((demo, idx) => (
              <button
                key={demo.label}
                onClick={() => handleRunDemo(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedPrompt === idx
                    ? 'mac-btn-gloss text-cyan border-cyan/50 shadow-lg'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {demo.label}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-black border border-white/10 text-xs space-y-3">
            <div className="text-zinc-400 flex items-center gap-2">
              <span className="text-cyan font-bold">&gt;</span> Prompt: &quot;{promptDemos[selectedPrompt].prompt}&quot;
            </div>

            <div className="pt-3 border-t border-white/10 text-emerald-400 font-mono leading-relaxed">
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
                  <span>Processing prompt...</span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <IconVerifiedCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{promptDemos[selectedPrompt].result}</span>
                </div>
              )}
            </div>
          </div>
        </SpotlightCard>

      </div>
    </section>
  );
}

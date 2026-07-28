'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Users,
  Tag,
  Award,
  ShieldAlert,
  FileText,
  MessageSquare,
  FileBadge,
  BarChart,
  Sparkles,
  Bot,
  Cpu
} from 'lucide-react';

export function AIEngineSection() {
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const aiFeatures = [
    { title: 'AI Team Matchmaking', icon: Users, desc: 'Connects solo hackers by analyzing past repos, tech stacks, and track preferences.' },
    { title: 'AI Project Tagging', icon: Tag, desc: 'Auto-labels submissions into appropriate track categories and tags.' },
    { title: 'AI Code Summarizer', icon: Award, desc: 'Generates 10-second summary synopses of complex codebases for rapid judge review.' },
    { title: 'AI Duplicate Detection', icon: ShieldAlert, desc: 'Scans commit logs & public repos to detect recycled or plagiarized projects.' },
    { title: 'AI Event Digest', icon: FileText, desc: 'Produces executive event debrief reports and winning team highlight digests.' },
    { title: 'AI Hacker Feedback', icon: MessageSquare, desc: 'Provides actionable, constructive critique to non-winning teams on how to improve.' },
    { title: 'AI Certificate Engine', icon: FileBadge, desc: 'Customizes personalized certificate citations based on team achievements.' },
    { title: 'AI Track Analytics', icon: BarChart, desc: 'Predictive insights on participant engagement, drop-off points, and track popularity.' },
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
    <section id="ai-engine" className="py-28 relative overflow-hidden bg-black text-white">
      {/* Vercel Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-cyan-glow blur-[160px] pointer-events-none opacity-40" />
      <div className="absolute inset-0 vercel-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full brutalist-tag text-cyan font-mono font-bold text-xs">
            <BrainCircuit className="w-4 h-4 text-cyan animate-pulse" />
            [ AI AUTOPILOT CORE ]
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tighter text-white uppercase">
            Powered by Specialized <span className="text-gradient-cyan">Hackathon AI.</span>
          </h2>
          <p className="font-sans text-white/70 text-base sm:text-lg">
            Automate tedious manual work so organizers can focus on building an unforgettable developer experience.
          </p>
        </div>

        {/* 3D Asset Banner & Feature Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Left: 3D Holographic AI Core Asset */}
          <div className="lg:col-span-5 relative rounded-3xl vercel-card p-6 border border-white/20 text-center overflow-hidden group">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/50 flex items-center justify-center">
              <Image
                src="/images/ai-core-3d.png"
                alt="3D Holographic AI Engine Core"
                fill
                className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <div className="mt-4 font-mono text-left space-y-1">
              <div className="text-xs text-cyan font-bold uppercase flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" /> Neural Model v4.2 Active
              </div>
              <div className="text-sm font-bold text-white font-display">
                Real-Time Code Analysis & Fraud Guard
              </div>
            </div>
          </div>

          {/* Right: Feature Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-5 rounded-2xl vercel-card vercel-card-hover border border-white/10 space-y-2.5"
                >
                  <div className="p-2.5 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan w-fit">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-display tracking-tight">{feat.title}</h3>
                  <p className="text-xs text-white/60 font-sans leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>

        </div>

        {/* Interactive AI Sandbox Demo Widget */}
        <div className="p-8 rounded-3xl vercel-card border border-white/20 shadow-2xl space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-cyan" />
              <div>
                <h3 className="font-display font-bold text-white text-lg">Test AlmostHack AI Sandbox</h3>
                <p className="text-xs font-mono text-white/50">Select an AI prompt action below to see output</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan/10 text-cyan font-mono text-xs border border-cyan/30">
              Model: AlmostHack-v4.2-Mini
            </span>
          </div>

          {/* Prompt Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {promptDemos.map((demo, idx) => (
              <button
                key={demo.label}
                onClick={() => handleRunDemo(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedPrompt === idx
                    ? 'bg-cyan text-black font-bold shadow-lg shadow-cyan/20'
                    : 'bg-surface-50 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                {demo.label}
              </button>
            ))}
          </div>

          {/* Prompt Sandbox Screen */}
          <div className="p-5 rounded-2xl bg-black/80 border border-white/15 font-mono text-xs space-y-4">
            <div className="flex items-start gap-3 text-white/80">
              <span className="text-cyan font-bold">INPUT &gt;</span>
              <span className="text-white/90">{promptDemos[selectedPrompt].prompt}</span>
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">OUTPUT &gt;</span>
              {isProcessing ? (
                <span className="text-cyan animate-pulse">Generating neural output...</span>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-emerald-300 leading-relaxed"
                >
                  {promptDemos[selectedPrompt].result}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

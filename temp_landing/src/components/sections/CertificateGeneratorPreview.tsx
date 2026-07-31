'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import {
  IconShieldCert,
  IconSparkle,
  IconCheckCircle,
  IconZapFlash,
  IconTrophy,
} from '@/components/ui/CustomIcons';

export function CertificateGeneratorPreview() {
  const [recipientName, setRecipientName] = useState('Alex Chen');
  const [category, setCategory] = useState('1st Place Grand Winner 🏆');
  const [copied, setCopied] = useState(false);

  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="certificates" className="py-28 relative overflow-hidden bg-black text-white bg-noise-fine select-none">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-cyan-glow opacity-25 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Instrument Serif Accent */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-900 border border-white/15 text-cyan font-mono font-bold text-xs">
            <IconShieldCert size={14} className="text-cyan" />
            <span>HOLOGRAPHIC VERIFICATION ENGINE</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white">
            cryptographic certificates.{' '}
            <span className="font-serif italic text-cyan text-4xl sm:text-6xl font-normal">
              generated in seconds.
            </span>
          </h2>
          <p className="font-sans text-zinc-400 text-base sm:text-lg">
            instant verifiable badges on IPFS and Solana. type a recipient name below to test real-time rendering.
          </p>
        </div>

        <SpotlightCard
          spotlightColor="rgba(0, 240, 255, 0.18)"
          className="max-w-6xl mx-auto mac-window border border-white/15 overflow-hidden shadow-2xl p-0"
        >
          <div className="mac-window-bar px-6 py-3">
            <div className="mac-dots">
              <span className="mac-dot mac-dot-close" />
              <span className="mac-dot mac-dot-min" />
              <span className="mac-dot mac-dot-zoom" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
              <IconShieldCert size={14} className="text-purple-400" />
              <span>certificate_builder.app</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="p-8 bg-zinc-950/95 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center font-sans">
            
            {/* Left Column: Interactive Controls */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-5">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <IconSparkle size={16} className="text-cyan" /> Live Generator Controls
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">RECIPIENT NAME</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white focus:outline-none focus:border-cyan font-sans"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">AWARD CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white focus:outline-none focus:border-cyan font-sans"
                  >
                    <option value="1st Place Grand Winner 🏆">1st Place Grand Winner 🏆</option>
                    <option value="Best AI Innovation Track 🤖">Best AI Innovation Track 🤖</option>
                    <option value="Official Hackathon Mentor 🌟">Official Hackathon Mentor 🌟</option>
                    <option value="Participant Excellence ⚡">Participant Excellence ⚡</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={handleTriggerConfetti}
                  className="mac-btn-gloss w-full py-3.5 rounded-xl text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IconSparkle size={14} className="text-cyan" /> Render &amp; Trigger Winner Confetti
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 border border-white/15 hover:bg-white/10 text-zinc-300 font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? <IconCheckCircle size={14} className="text-cyan" /> : <IconZapFlash size={14} className="text-cyan" />}
                  <span>{copied ? 'Verification Link Copied!' : 'Copy Verification Link'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: 3D Asset & Certificate Card Preview */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-white/15 shadow-2xl relative overflow-hidden font-mono space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-cyan font-bold text-xs">
                    <IconTrophy size={16} className="text-amber-400" />
                    <span>ALMOSTHACK PROOF-OF-WIN</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">ID: #0492</span>
                </div>

                <div className="text-center py-4 space-y-1">
                  <div className="text-[11px] text-zinc-400 uppercase">THIS CERTIFIES THAT</div>
                  <div className="text-2xl font-bold font-display text-white">{recipientName || 'Alex Chen'}</div>
                  <div className="text-xs text-cyan pt-1">{category}</div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Solana Hash: 0x8a92...f7b</span>
                  <span className="text-emerald-400 font-bold">✓ IPFS Verified</span>
                </div>
              </div>
            </div>

          </div>
        </SpotlightCard>

      </div>
    </section>
  );
}

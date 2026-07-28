'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FileBadge, Sparkles, Check, ShieldCheck, Share2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export function CertificateGeneratorPreview() {
  const [recipientName, setRecipientName] = useState('Alex Chen');
  const [category, setCategory] = useState('1st Place Grand Winner 🏆');
  const [hackathonName, setHackathonName] = useState('Global AI Hackathon 2026');
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
    <section id="certificates" className="py-28 relative overflow-hidden bg-black text-white">
      {/* Vercel Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-glow blur-[150px] pointer-events-none opacity-35" />
      <div className="absolute inset-0 vercel-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full brutalist-tag text-cyan font-mono text-xs font-bold">
            <FileBadge className="w-4 h-4 text-cyan" />
            [ HOLOGRAPHIC VERIFICATION ENGINE ]
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tighter text-white uppercase">
            Cryptographic Certificates. <br />
            <span className="text-gradient-cyan">Generated In Seconds.</span>
          </h2>
          <p className="font-sans text-white/70 text-base sm:text-lg">
            Instant verifiable badges on IPFS and Solana. Type a recipient name below to test real-time rendering.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Interactive Controls */}
          <div className="lg:col-span-5 p-6 rounded-3xl vercel-card border border-white/20 space-y-5">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan" /> Live Generator Controls
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-white/70 mb-1.5 font-medium">RECIPIENT NAME</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/20 text-white focus:outline-none focus:border-cyan font-sans"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1.5 font-medium">AWARD CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/20 text-white focus:outline-none focus:border-cyan font-sans"
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
                className="w-full py-3.5 rounded-xl bg-white text-black font-display font-bold text-xs hover:bg-white/90 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" /> Render & Trigger Winner Confetti
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl bg-surface-50 border border-white/20 hover:bg-white/10 text-white font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-cyan" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Verification Link Copied!' : 'Copy Verification Link'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Asset & Certificate Card Preview */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div
              layout
              className="p-8 sm:p-10 rounded-3xl vercel-card border border-white/20 shadow-2xl space-y-6 relative overflow-hidden text-center group"
            >
              {/* Holographic Watermark Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 border border-cyan/40 text-[10px] font-mono text-cyan">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan" /> SOLANA & IPFS VERIFIED
              </div>

              {/* 3D Certificate Badge Preview */}
              <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden bg-black/60 p-2 border border-white/20 group-hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/cert-badge-3d.png"
                  alt="3D Holographic Certificate Trophy"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono tracking-widest uppercase text-white/50">
                  OFFICIAL CERTIFICATE OF ACHIEVEMENT
                </span>
                <h4 className="text-xl font-bold font-display text-white tracking-tight">{hackathonName}</h4>
              </div>

              <div className="space-y-2 py-4 border-y border-white/15">
                <p className="text-xs font-mono text-white/60">PRESENTED TO</p>
                <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {recipientName || 'Alex Chen'}
                </h3>
                <p className="text-xs font-mono text-white/80 pt-2">
                  FOR SECURING HIGHEST HONOR IN
                </p>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-cyan/15 text-cyan border border-cyan/40 mt-1">
                  {category}
                </span>
              </div>

              {/* Certificate Footer Stamp */}
              <div className="flex items-center justify-between pt-2 text-[10px] text-white/40 font-mono">
                <div>
                  <div>ISSUED BY ALMOSTHACK ENGINE</div>
                  <div>HASH: #AH-CERT-9824-2026</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-black/80 border border-white/20 flex items-center justify-center text-cyan">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

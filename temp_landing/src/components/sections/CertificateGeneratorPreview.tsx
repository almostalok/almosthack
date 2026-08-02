'use client';

import React, { useState } from 'react';
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
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="certificates" className="py-28 relative overflow-hidden bg-[#051C14] text-white select-none transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="optimizely-pill-pink shadow-md">
            [ CERTIFICATE ENGINE ]
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white">
            Cryptographic Certificates.{' '}
            <span className="serif-accent text-[#ABFF44] font-normal">
              Generated in Seconds.
            </span>
          </h2>
          <p className="font-sans text-slate-300 text-base sm:text-lg leading-relaxed">
            Instant verifiable credentials on IPFS and Solana. Type a recipient name below to test real-time rendering.
          </p>
        </div>

        {/* Certificate Builder Window */}
        <SpotlightCard
          spotlightColor="rgba(171, 255, 68, 0.18)"
          className="max-w-6xl mx-auto mac-window border-2 border-[#0D3A29] overflow-hidden p-0"
        >
          <div className="mac-window-bar px-6 py-3.5">
            <div className="mac-dots">
              <span className="mac-dot mac-dot-close" />
              <span className="mac-dot mac-dot-min" />
              <span className="mac-dot mac-dot-zoom" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-white font-bold">
              <IconShieldCert size={14} className="text-[#ABFF44]" />
              <span>certificate_builder.app</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="p-8 bg-[#051C14] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center font-sans">
            
            {/* Left Column: Interactive Controls */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0D3A29]/60 border-2 border-[#0D3A29] space-y-5">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <IconSparkle size={16} className="text-[#ABFF44]" /> Live Generator Controls
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-[#789887] mb-1.5 font-bold uppercase">RECIPIENT NAME</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#051C14] border-2 border-[#0D3A29] text-white focus:outline-none focus:border-[#ABFF44] font-sans font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#789887] mb-1.5 font-bold uppercase">AWARD CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#051C14] border-2 border-[#0D3A29] text-white focus:outline-none focus:border-[#ABFF44] font-sans font-bold"
                  >
                    <option value="1st Place Grand Winner 🏆">1st Place Grand Winner 🏆</option>
                    <option value="Best AI Innovation Track 🤖">Best AI Innovation Track 🤖</option>
                    <option value="Official Hackathon Mentor 🌟">Official Hackathon Mentor 🌟</option>
                    <option value="Participant Excellence ⚡">Participant Excellence ⚡</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={handleTriggerConfetti}
                  className="optimizely-btn-lime w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IconSparkle size={14} className="text-[#072419]" /> Render &amp; Trigger Winner Confetti
                </button>
                <button
                  onClick={handleCopyLink}
                  className="optimizely-btn-dark w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? <IconCheckCircle size={14} className="text-[#ABFF44]" /> : <IconZapFlash size={14} className="text-[#ABFF44]" />}
                  <span>{copied ? 'Verification Link Copied!' : 'Copy Verification Link'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Certificate Card */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="w-full max-w-md p-7 rounded-3xl bg-[#F5F8F0] border-2 border-[#0D3A29] shadow-[-6px_6px_0_0_#0D3A29] relative overflow-hidden font-mono space-y-4 text-[#072419]">
                <div className="flex items-center justify-between border-b-2 border-[#0D3A29] pb-3">
                  <div className="flex items-center gap-2 text-[#072419] font-bold text-xs">
                    <IconTrophy size={16} className="text-[#072419]" />
                    <span>ALMOSTHACK PROOF-OF-WIN</span>
                  </div>
                  <span className="text-[10px] text-[#557365] font-bold">ID: #0492</span>
                </div>

                <div className="text-center py-4 space-y-1">
                  <div className="text-[11px] text-[#557365] font-extrabold uppercase tracking-widest">THIS CERTIFIES THAT</div>
                  <div className="text-2xl font-black font-display text-[#072419]">{recipientName || 'Alex Chen'}</div>
                  <div className="text-xs text-[#0D3A29] pt-1 font-bold">{category}</div>
                </div>

                <div className="pt-3 border-t-2 border-[#0D3A29] flex items-center justify-between text-[10px] text-[#557365] font-bold">
                  <span>Solana Hash: 0x8a92...f7b</span>
                  <span className="text-[#072419] bg-[#ABFF44] px-2 py-0.5 rounded border border-[#0D3A29]">✓ IPFS Verified</span>
                </div>
              </div>
            </div>

          </div>
        </SpotlightCard>

      </div>
    </section>
  );
}

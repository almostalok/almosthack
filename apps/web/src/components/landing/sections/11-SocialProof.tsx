'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  ArrowRight,
  Users,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const SocialProofSection: React.FC = () => {
  return (
    <section id="showcase-grid" className="relative py-20 lg:py-28 bg-[#0B0D0C] border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: RESULTS DAY */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#111412] border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
            <div className="space-y-4">
              <div className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
                RESULTS DAY
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                Make results clear <br /> and credible.
              </h3>

              {/* Leaderboard Table Preview */}
              <div className="p-4 rounded-xl bg-[#0B0D0C]/90 border border-white/[0.08] space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span className="font-sans font-bold text-white">Team Alpha</span>
                  </div>
                  <span className="font-bold text-amber-400">92.4</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span className="font-sans font-medium text-[#A7AEA7]">Team Quantum</span>
                  </div>
                  <span className="font-bold text-[#A7AEA7]">89.7</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-700/40 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span className="font-sans font-medium text-[#A7AEA7]">Team Nova</span>
                  </div>
                  <span className="font-bold text-[#A7AEA7]">87.9</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/results"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group-hover:translate-x-0.5"
              >
                <span>Explore Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: CERTIFICATES */}
          <div id="certificates" className="p-6 sm:p-7 rounded-2xl bg-[#111412] border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
            <div className="space-y-4">
              <div className="text-[11px] font-mono tracking-widest text-[#A8E63B] uppercase font-semibold">
                CERTIFICATES
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                Give every participant <br /> something worth keeping.
              </h3>

              {/* Certificate Preview Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#1C211E] to-[#121614] border border-[#A8E63B]/30 shadow-lg space-y-2 text-center relative overflow-hidden">
                <div className="text-[9px] font-mono tracking-widest text-[#A8E63B] uppercase">
                  CERTIFICATE OF PARTICIPATION
                </div>
                <div className="text-lg font-bold text-white font-serif tracking-wide pt-1">
                  Alok Sharma
                </div>
                <div className="text-[11px] text-[#A7AEA7]">Build India 2026</div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-[9px] font-mono text-[#737A73]">
                  <span>ID: AH-2026-7X34B</span>
                  <span className="inline-flex items-center gap-1 text-[#A8E63B] font-semibold">
                    ✓ Verified on-chain
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/certificates"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A8E63B] hover:text-[#bcf05b] transition-colors group-hover:translate-x-0.5"
              >
                <span>Explore Certificates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: BUILT FOR THE PEOPLE WHO RUN HACKATHONS */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#111412] border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
            <div className="space-y-4">
              <div className="text-[11px] font-mono tracking-widest text-[#A8E63B] uppercase font-semibold">
                BUILT FOR THE PEOPLE WHO RUN HACKATHONS
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#0B0D0C]/80 border border-white/[0.06]">
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[#A8E63B]">500+</div>
                  <div className="text-xs text-[#A7AEA7] mt-1">Hackathons run</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B0D0C]/80 border border-white/[0.06]">
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">100K+</div>
                  <div className="text-xs text-[#A7AEA7] mt-1">Participants</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B0D0C]/80 border border-white/[0.06]">
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">50K+</div>
                  <div className="text-xs text-[#A7AEA7] mt-1">Projects submitted</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B0D0C]/80 border border-white/[0.06]">
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[#A8E63B]">98%</div>
                  <div className="text-xs text-[#A7AEA7] mt-1">Organizer satisfaction</div>
                </div>
              </div>
            </div>

            <div className="pt-6 text-xs text-[#737A73]">
              Trusted by enterprise hackathons, universities, and Web3 ecosystems.
            </div>
          </div>

          {/* Card 4: ALWAYS IN CONTROL (COMMAND CENTER) */}
          <div id="command-center" className="p-6 sm:p-7 rounded-2xl bg-[#111412] border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
            <div className="space-y-4">
              <div className="text-[11px] font-mono tracking-widest text-[#A8E63B] uppercase font-semibold">
                ALWAYS IN CONTROL
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                Your hackathon&apos;s <br /> command center.
              </h3>

              {/* Mini Status Telemetry */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#A7AEA7]">Live Event Status</div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-[#0B0D0C]/90 border border-white/[0.06]">
                    <div className="text-xs sm:text-sm font-bold font-mono text-white">1,248</div>
                    <div className="text-[9px] text-[#737A73]">Participants</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B0D0C]/90 border border-white/[0.06]">
                    <div className="text-xs sm:text-sm font-bold font-mono text-white">312</div>
                    <div className="text-[9px] text-[#737A73]">Teams</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B0D0C]/90 border border-white/[0.06]">
                    <div className="text-xs sm:text-sm font-bold font-mono text-white">218</div>
                    <div className="text-[9px] text-[#737A73]">Submissions</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B0D0C]/90 border border-white/[0.06]">
                    <div className="text-xs sm:text-sm font-bold font-mono text-[#A8E63B]">64%</div>
                    <div className="text-[9px] text-[#737A73]">Judging</div>
                  </div>
                </div>

                {/* Green Waveform Chart */}
                <div className="h-16 w-full pt-2">
                  <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#A8E63B" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#028051" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 50 Q 50 30, 100 45 T 200 20 T 300 10 L 300 60 L 0 60 Z"
                      fill="url(#waveGradient)"
                    />
                    <path
                      d="M 0 50 Q 50 30, 100 45 T 200 20 T 300 10"
                      fill="none"
                      stroke="#A8E63B"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/overview"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A8E63B] hover:text-[#bcf05b] transition-colors group-hover:translate-x-0.5"
              >
                <span>Open Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

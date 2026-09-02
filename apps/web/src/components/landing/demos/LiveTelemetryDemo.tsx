'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  Radio,
  ShieldCheck,
  CheckCircle2,
  Users,
  FileCode2,
  Gavel,
  Zap,
} from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface LiveTelemetryDemoProps {
  className?: string;
}

export const LiveTelemetryDemo: React.FC<LiveTelemetryDemoProps> = ({ className }) => {
  const shouldReduceMotion = useReducedMotion();

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 100);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const healthItems = [
    { name: 'Registrations Pipeline', status: 'Operational', latency: '24ms' },
    { name: 'Submission Commit Stream', status: 'Operational', latency: '48ms' },
    { name: 'Repository Integrity Checker', status: 'Operational', latency: '32ms' },
    { name: 'Judge Calibration Engine', status: 'Operational', latency: '18ms' },
    { name: 'Leaderboard Consensus Seal', status: 'Ready', latency: '12ms' },
  ];

  const liveEvents = [
    { time: 'Just now', title: 'Team submitted', desc: 'QuantumQuest tagged commit #3a8f9c for final review', icon: FileCode2 },
    { time: '2m ago', title: 'Judge completed review', desc: 'Dr. Sarah Lin finalized rubric for Sub-8492', icon: Gavel },
    { time: '5m ago', title: 'New team registered', desc: 'NeuralSync onboarded 4 builders in AI Track', icon: Users },
    { time: '8m ago', title: 'Submission verified', desc: 'GreenChain repository SHA-256 passed static audit', icon: CheckCircle2 },
  ];

  return (
    <div
      className={cn(
        'w-full rounded-[20px] bg-[#141614] border border-[#282C28] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-body text-left relative',
        className
      )}
    >
      {/* Top Header */}
      <div className="h-11 bg-[#111311] border-b border-[#242824] px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#03A066] animate-pulse" />
          <span className="text-xs sm:text-sm font-mono text-white font-bold">
            LIVE TELEMETRY STREAM • HTF-2026
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-[#03A066]">
          <Zap className="w-3.5 h-3.5 text-[#03A066]" />
          <span>WebSocket Connected</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6 bg-[#131413]">
        {/* Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-[12px] bg-[#171917] border border-[#282C28]">
            <span className="text-xs font-mono uppercase text-[#737373] block">Registered</span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">847</div>
          </div>
          <div className="p-4 sm:p-5 rounded-[12px] bg-[#171917] border border-[#282C28]">
            <span className="text-xs font-mono uppercase text-[#737373] block">Teams</span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">132</div>
          </div>
          <div className="p-4 sm:p-5 rounded-[12px] bg-[#171917] border border-[#282C28]">
            <span className="text-xs font-mono uppercase text-[#737373] block">Submissions</span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">76</div>
          </div>
          <div className="p-4 sm:p-5 rounded-[12px] bg-[#171917] border border-[#282C28]">
            <span className="text-xs font-mono uppercase text-[#737373] block">Judges</span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">24 (72%)</div>
          </div>
        </div>

        {/* Dual Split: Live Event Stream + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Live Activity Column */}
          <div className="lg:col-span-7 p-5 rounded-[14px] bg-[#161816] border border-[#282C28] space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#242824]">
              <span className="text-sm font-mono uppercase tracking-wider text-[#EDEDED] font-bold">
                Real-Time Event Stream
              </span>
              <span className="text-xs font-mono text-[#03A066] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Broadcast
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {liveEvents.map((ev, idx) => {
                const Icon = ev.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[10px] bg-[#1A1D1A] border border-[#262A26] flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-[6px] bg-[#222822] border border-[#2C342C] flex items-center justify-center text-[#03A066] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{ev.title}</span>
                        <span className="text-xs text-[#737373]">{ev.time}</span>
                      </div>
                      <p className="text-xs text-[#8C908C] truncate mt-1">
                        {ev.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health Column */}
          <div className="lg:col-span-5 p-5 rounded-[14px] bg-[#161816] border border-[#282C28] space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#242824]">
              <span className="text-sm font-mono uppercase tracking-wider text-[#EDEDED] font-bold">
                System Health Check
              </span>
              <span className="text-xs font-mono text-[#03A066] font-bold">100% HEALTH</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {healthItems.map((h) => (
                <div
                  key={h.name}
                  className="p-3 rounded-[8px] bg-[#1A1D1A] border border-[#262A26] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-[#03A066] shrink-0" />
                    <span className="text-[#C2C6C2] truncate">{h.name}</span>
                  </div>
                  <span className="text-[#03A066] font-bold shrink-0">{h.latency}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

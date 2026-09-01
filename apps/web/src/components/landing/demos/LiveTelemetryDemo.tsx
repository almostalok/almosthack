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
  Trophy,
  Server,
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
        'w-full rounded-[16px] bg-[#141614] border border-[#282C28] shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden font-body text-left relative',
        className
      )}
    >
      {/* Top Header */}
      <div className="h-9 bg-[#111311] border-b border-[#242824] px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#03A066] animate-pulse" />
          <span className="text-[11px] font-mono text-white font-bold">
            LIVE TELEMETRY STREAM • HTF-2026
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#03A066]">
          <Zap className="w-3 h-3 text-[#03A066]" />
          <span>WebSocket Connected</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 bg-[#131413]">
        {/* Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-[8px] bg-[#171917] border border-[#282C28]">
            <span className="text-[10px] font-mono uppercase text-[#737373] block">Registered</span>
            <div className="text-xl font-heading font-extrabold text-white mt-0.5">847</div>
          </div>
          <div className="p-3 rounded-[8px] bg-[#171917] border border-[#282C28]">
            <span className="text-[10px] font-mono uppercase text-[#737373] block">Teams</span>
            <div className="text-xl font-heading font-extrabold text-white mt-0.5">132</div>
          </div>
          <div className="p-3 rounded-[8px] bg-[#171917] border border-[#282C28]">
            <span className="text-[10px] font-mono uppercase text-[#737373] block">Submissions</span>
            <div className="text-xl font-heading font-extrabold text-white mt-0.5">76</div>
          </div>
          <div className="p-3 rounded-[8px] bg-[#171917] border border-[#282C28]">
            <span className="text-[10px] font-mono uppercase text-[#737373] block">Judges</span>
            <div className="text-xl font-heading font-extrabold text-white mt-0.5">24 (72%)</div>
          </div>
        </div>

        {/* Dual Split: Live Event Stream + System Health */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Live Activity Column */}
          <div className="md:col-span-7 p-3.5 rounded-[10px] bg-[#161816] border border-[#282C28] space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#242824]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#EDEDED] font-bold">
                Real-Time Event Stream
              </span>
              <span className="text-[10px] font-mono text-[#03A066] flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Live Broadcast
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {liveEvents.map((ev, idx) => {
                const Icon = ev.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-[7px] bg-[#1A1D1A] border border-[#262A26] flex items-start gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-[5px] bg-[#222822] border border-[#2C342C] flex items-center justify-center text-[#03A066] shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{ev.title}</span>
                        <span className="text-[10px] text-[#737373]">{ev.time}</span>
                      </div>
                      <p className="text-[11px] text-[#8C908C] truncate mt-0.5">
                        {ev.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health Column */}
          <div className="md:col-span-5 p-3.5 rounded-[10px] bg-[#161816] border border-[#282C28] space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#242824]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#EDEDED] font-bold">
                System Status
              </span>
              <span className="text-[10px] font-mono text-[#03A066]">100% HEALTH</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {healthItems.map((h) => (
                <div
                  key={h.name}
                  className="p-2 rounded-[6px] bg-[#1A1D1A] border border-[#262A26] flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#03A066] shrink-0" />
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
